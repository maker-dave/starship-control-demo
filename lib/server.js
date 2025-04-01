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

            // Check if all configured stations for a ship are claimed
            const ships = {};
            config.stations.forEach(station => {
                const shipId = station.shipId || 'default';
                ships[shipId] = ships[shipId] || { total: 0, claimed: 0 };
                ships[shipId].total++;
                if (stations[station.name]) ships[shipId].claimed++;
            });

            Object.keys(ships).forEach(shipId => {
                if (ships[shipId].claimed === ships[shipId].total) {
                    const shipStations = config.stations.filter(s => s.shipId === shipId);
                    shipStations.forEach(station => {
                        const targetIds = shipStations
                            .filter(s => s.name !== station.name)
                            .map(s => peerIds[s.name])
                            .join(',');
                        stations[station.name].ws.send(JSON.stringify({
                            type: 'redirect',
                            station: station.name,
                            targetPeerIds: targetIds
                        }));
                    });
                    console.log(`Redirected all stations for ship ${shipId}`);
                }
            });
        } else if (data.type === 'config-update') {
            config = data.config;
            fs.writeFileSync('./stations.json', JSON.stringify(config, null, 2));
            console.log('Config updated:', config);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'config', config }));
                }
            });
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
