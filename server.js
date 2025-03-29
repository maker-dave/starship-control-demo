const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let stations = {};
let peerIds = {};

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress.replace('::ffff:', '');
    console.log(`New connection from ${clientIp}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`Received message: ${JSON.stringify(data)}`);

        if (data.type === 'claim' && !stations[data.station]) {
            stations[data.station] = { ws, ip: clientIp };
            console.log(`${data.station} claimed by ${clientIp}`);
            console.log(`Current stations: ${JSON.stringify(Object.keys(stations))}`);
        }
        if (data.type === 'peerId' && data.station) {
            peerIds[data.station] = data.peerId;
            console.log(`${data.station} registered peer ID: ${data.peerId}`);
            console.log(`Current peer IDs: ${JSON.stringify(peerIds)}`);
        }
        if (data.type === 'restore' && !stations[data.station]) {
            stations[data.station] = { ws, ip: clientIp };
            console.log(`${data.station} restored by ${clientIp}`);
            console.log(`Current stations: ${JSON.stringify(Object.keys(stations))}`);
        }

        if (Object.keys(stations).length === 2 && Object.keys(peerIds).length === 2) {
            const navPeerId = peerIds.navigation;
            const engPeerId = peerIds.engineering;
            stations.navigation.ws.send(JSON.stringify({ type: 'setup', station: 'navigation', targetPeerId: engPeerId }));
            stations.engineering.ws.send(JSON.stringify({ type: 'setup', station: 'engineering', targetPeerId: navPeerId }));
            console.log('Sent setup messages to both stations');
        }
    });

    ws.on('error', (err) => console.log(`WebSocket error from ${clientIp}: ${err}`));
    ws.on('close', () => {
        console.log(`Connection closed from ${clientIp}`);
        for (let station in stations) {
            if (stations[station].ws === ws) {
                delete stations[station];
                delete peerIds[station];
                console.log(`Removed ${station} due to disconnection`);
            }
        }
    });
});
