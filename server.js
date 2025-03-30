const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let stations = {};
let peerIds = {};
let worldState = { shipX: 0, shipY: 0 }; // Simple world tracking

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress.replace('::ffff:', '');
    console.log(`New connection from ${clientIp}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`Received: ${JSON.stringify(data)}`);

        if (data.type === 'claim' && !stations[data.station]) {
            stations[data.station] = { ws, ip: clientIp };
            console.log(`${data.station} claimed by ${clientIp}`);
        }
        if (data.type === 'peerId' && data.station) {
            peerIds[data.station] = data.peerId;
            console.log(`${data.station} peer ID: ${data.peerId}`);
        }
        if (data.type === 'restore' && !stations[data.station]) {
            stations[data.station] = { ws, ip: clientIp };
            console.log(`${data.station} restored by ${clientIp}`);
        }
        if (data.type === 'shipUpdate') {
            const rad = data.course * Math.PI / 180;
            worldState.shipX += data.speed * Math.cos(rad);
            worldState.shipY += data.speed * Math.sin(rad);
            console.log(`Ship position: (${worldState.shipX}, ${worldState.shipY})`);
        }

        if (Object.keys(stations).length === 2 && Object.keys(peerIds).length === 2) {
            const navPeerId = peerIds.navigation;
            const engPeerId = peerIds.engineering;
            stations.navigation.ws.send(JSON.stringify({ type: 'setup', station: 'navigation', targetPeerId: engPeerId }));
            stations.engineering.ws.send(JSON.stringify({ type: 'setup', station: 'engineering', targetPeerId: navPeerId }));
            console.log('Setup sent to both stations');
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
