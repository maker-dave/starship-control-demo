cd /tmp/starship-control-demo

# Update server.js (remove the extra app.listen)
cat > lib/server.js << 'EOF'
const WebSocket = require('ws');
const express = require('express');
const app = express();

app.use(express.static('public'));

const server = app.listen(8126, () => console.log('HTTP on 8126'));
const wss = new WebSocket.Server({ server });
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
EOF

# Update index.html to include all four stations
cat > lib/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Starship Setup</title>
    <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
    <style>
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .panel { text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="panel">
        <h1>Choose Your Station</h1>
        <button onclick="claimStation('navigation')">Navigation</button>
        <button onclick="claimStation('engineering')">Engineering</button>
        <button onclick="claimStation('world')">World</button>
        <button onclick="claimStation('science')">Science</button>
        <div id="status">Waiting...</div>
    </div>

    <script>
        const wsPort = window.location.port || '8126';
        const wsHost = window.location.hostname || '192.168.86.69';
        const socket = new WebSocket(`ws://${wsHost}:${wsPort}`);
        let myPeer;

        socket.onopen = () => {
            console.log('WebSocket connected');
            document.getElementById('status').innerText = 'Connected - Select a station';
        };

        function claimStation(station) {
            localStorage.setItem('myStation', station);
            myPeer = new Peer();
            myPeer.on('open', (id) => {
                socket.send(JSON.stringify({ type: 'claim', station, peerId: id }));
                document.getElementById('status').innerText = `Claiming ${station}...`;
            });
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'redirect') {
                window.location.href = `${data.station}.html?peerId=${myPeer.id}&targetPeerIds=${data.targetPeerIds}`;
            }
        };
    </script>
</body>
</html>
EOF

# Now run install.sh
chmod +x tools/install.sh
./tools/install.sh
