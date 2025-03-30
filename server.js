const WebSocket = require('ws');
const express = require('express');
const app = express();

app.use(express.static('public')); // Serve index.html, nav.html, engineering.html

const wss = new WebSocket.Server({ port: 8080 });
let stations = {};
let peerIds = {};
let worldState = { shipX: 0, shipY: 0 };

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

            if (Object.keys(stations).length === 2) {
                const navPeerId = peerIds.navigation;
                const engPeerId = peerIds.engineering;
                stations.navigation.ws.send(JSON.stringify({
                    type: 'redirect',
                    station: 'nav',
                    targetPeerId: engPeerId
                }));
                stations.engineering.ws.send(JSON.stringify({
                    type: 'redirect',
                    station: 'engineering',
                    targetPeerId: navPeerId
                }));
                console.log('Redirected both stations');
            }
        }

        if (data.type === 'shipUpdate') {
            const rad = data.course * Math.PI / 180;
            worldState.shipX += data.speed * Math.cos(rad);
            worldState.shipY += data.speed * Math.sin(rad);
            console.log(`Ship position: (${worldState.shipX}, ${worldState.shipY})`);
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

app.listen(8080, () => console.log('HTTP on 8080'));
