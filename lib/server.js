const WebSocket = require('ws');
const express = require('express');
const chokidar = require('chokidar');
const fs = require('fs');
const app = express();

app.use(express.static('public'));

const server = app.listen(8126, () => console.log('HTTP on 8126'));
const wss = new WebSocket.Server({ server });
let stations = {};
let peerIds = {};
let config = { stations: [], ships: [] };

// Load initial config
try {
    config = JSON.parse(fs.readFileSync('./stations.json', 'utf8'));
} catch (e) {
    console.log('No stations.json found, starting with empty config');
}

// Watch config file
chokidar.watch('./stations.json').on('change', (path) => {
    console.log(`Config file changed: ${path}`);
    try {
        config = JSON.parse(fs.readFileSync(path, 'utf8'));
        console.log('Config reloaded:', config);
        broadcastConfig();
    } catch (e) {
        console.log('Error reloading config:', e);
    }
});

// Watch HTML files for auto-update
chokidar.watch('./public/*.html').on('change', (filePath) => {
    console.log(`File changed: ${filePath}`);
    const fileName = filePath.split('/').pop();
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'page-update', file: fileName }));
        }
    });
});

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress.replace('::ffff:', '');
    console.log(`New connection from ${clientIp}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`Received: ${JSON.stringify(data)}`);

        if (data.type === 'claim' && !stations[data.station]) {
            stations[data.station] = { ws, ip: clientIp };
            peerIds[data.station] = data.peerId;
            console.log(`${data.station} claimed by ${clientIp}, peerId: ${data.peerId}`);

            // Immediate redirect with current PeerIDs
            const stationConfig = config.stations.find(s => s.name === data.station);
            if (stationConfig) {
                const shipStations = config.stations.filter(s => s.shipId === stationConfig.shipId);
                const targetIds = shipStations
                    .filter(s => s.name !== data.station && peerIds[s.name])
                    .map(s => peerIds[s.name])
                    .join(',');
                ws.send(JSON.stringify({
                    type: 'redirect',
                    station: data.station,
                    targetPeerIds: targetIds
                }));
                console.log(`Redirected ${data.station} with peers: ${targetIds}`);

                // Broadcast new PeerID to existing stations
                broadcastPeerUpdate(data.station, data.peerId, stationConfig.shipId);
            }
        } else if (data.type === 'config-update') {
            config = data.config;
            fs.writeFileSync('./stations.json', JSON.stringify(config, null, 2));
            console.log('Config updated:', config);
            broadcastConfig();
        } else if (data.type === 'getConfig') {
            ws.send(JSON.stringify({ type: 'config', config }));
        }
    });

    ws.on('close', () => {
        for (let station in stations) {
            if (stations[station].ws === ws) {
                delete stations[station];
                delete peerIds[station];
                console.log(`Removed ${station}`);
            }
        }
    });
});

function broadcastPeerUpdate(station, peerId, shipId) {
    const shipStations = config.stations.filter(s => s.shipId === shipId);
    shipStations.forEach(s => {
        if (s.name !== station && stations[s.name]) {
            const ws = stations[s.name].ws;
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'peerUpdate', station, peerId }));
            }
        }
    });
}

function broadcastConfig() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'config', config }));
        }
    });
}
