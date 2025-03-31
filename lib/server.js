const WebSocket = require('ws');
const express = require('express');
const app = express();

app.use(express.static('public'));

const wss = new WebSocket.Server({ port: 8123 });
let stations = {};
let peerIds = {};

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

            if (Object.keys(stations).length === 4) { // Wait for Nav, Eng, World, Science
                const navPeerId = peerIds.navigation;
                const engPeerId = peerIds.engineering;
                const worldPeerId = peerIds.world;
                const sciencePeerId = peerIds.science;

                stations.navigation.ws.send(JSON.stringify({
                    type: 'redirect',
                    station: 'nav',
                    targetPeerIds: [engPeerId, worldPeerId, sciencePeerId].join(',')
                }));
                stations.engineering.ws.send(JSON.stringify({
                    type: 'redirect',
                    station: 'engineering',
                    targetPeerIds: [navPeerId, worldPeerId, sciencePeerId].join(',')
                }));
                stations.world.ws.send(JSON.stringify({
                    type: 'redirect',
                    station: 'world',
                    targetPeerIds: [navPeerId, engPeerId, sciencePeerId].join(',')
                }));
                stations.science.ws.send(JSON.stringify({
                    type: 'redirect',
                    station: 'science',
                    targetPeerIds: [navPeerId, engPeerId, worldPeerId].join(',')
                }));
                console.log('Redirected all stations');
            }
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

app.listen(8123, () => console.log('HTTP on 8123'));
