# Starship Control Demo

A distributed starship simulator with modular stations—Nav, Eng,
World, Sci, Ops, Config—for real-time crew interaction. Built
with HTML5, WebSocket, and WebRTC (PeerJS), runs on a Pi 4 with
P2P sync and client-side processing, server tracks the world.

## Features
- Stations:
  - Nav: Set throttle (0-100%), course (0-360°), view radar map
  - Eng: Adjust power (0-100%), monitor Nav inputs and speed
  - World: Manage sim universe, track objects, broadcast state
  - Sci: Config radar (range, FOV, dir), monitor objects on map
  - Ops: Allocate power to stations from Eng's total output
  - Config: Manage station/ship configs via `stations.json`
- Real-Time Sync: States sync via PeerJS P2P, dynamic peer adds
- Distributed: Clients calc speed/course locally with P2P data
- World Sim: Server tracks position (x, y) and objects
- Persistence: States in localStorage, auto-reload on updates
- Reconnect: WebSocket/PeerJS auto-reconnect on drops
- Modular: `index.html` redirects dynamically from stations.json

## Prerequisites
- Raspberry Pi 4 with Raspbian
- Node.js/npm for WebSocket/HTTP server
- Git for cloning repo

## Setup Instructions
Easiest setup uses the install script to automate the process.

### Automated Installation (Recommended)
1. Clone repo to temp location:
   git clone https://github.com/maker-dave/starship-control-demo.git /tmp/starship-control-demo
   cd /tmp/starship-control-demo
2. Run install script in `tools/`:
   chmod +x tools/install.sh
   ./tools/install.sh
3. Access Demo:
   Script installs in `~/spaceship`, starts server. Use URL (e.g.,
   `http://192.168.86.69:8126/index.html`). Claim stations on devices.

### Manual Installation (Alternative)
1. Clone Repo:
   git clone https://github.com/maker-dave/starship-control-demo.git ~/spaceship
   cd ~/spaceship
2. Install Deps:
   npm init -y
   npm install ws express chokidar
3. Move Files:
   mkdir public
   mv lib/*.html public/
   cp tools/stations.json .
4. Start Server:
   node server.js
5. Access Demo:
   Open `http://<pi-ip>:8126/index.html` on devices, claim stations.

## Usage
- Claim Station: Pick one on `index.html` to redirect
- Control Ship:
  - Nav: Adjust throttle/course, view radar
  - Eng: Set power, monitor Nav
  - World: Manage objects, monitor universe
  - Sci: Config radar, monitor objects
  - Ops: Allocate power to stations
  - Config: Edit `stations.json`
- Monitor: Real-time P2P updates, peers added dynamically
- Test: Edit file/refresh to check auto-update

## Project Files
- docs/revision_history.txt: Version log
- docs/To-Do: Task list
- lib/config.html: Config station
- lib/engineering.html: Eng station
- lib/index.html: Launchpad (HTML5, JS, PeerJS)
- lib/nav.html: Nav station
- lib/ops.html: Ops station
- lib/science.html: Sci station
- lib/server.js: WebSocket/Express server
- lib/world.html: World station (utility)
- tools/install.sh: Install script
- tools/package.json: Dependency setup
- tools/setup_starship.sh: Setup script
- tools/stations.json: Station/ship config
- README.md: This file (also README.txt)

## Requirements
- Node.js: 18+ with `ws`, `express`, `chokidar`
- Network: Devices on Pi network (e.g., 192.168.86.x)
- Ports: 8126 open (sudo ufw allow 8126)

## Notes
- Dev on Pi 4, IP 192.168.86.69
- Uses Express in `server.js`; no Apache
  - Early versions (to 0.7) used Apache, now Express on 8126
- Nav/Sci get world updates every 3s, radar-filtered
- No external host; P2P sync, server for world state
- `install.sh` moves HTML from `lib/` to `public/`, `stations.json` in root
- Port 8126 avoids conflicts; `EADDRINUSE` may need manual fix

## Contributing
Fork, tweak stations, PR—or open an issue! Maker-driven—go wild.

## License
None yet—open to suggestions!

## Author
- Maker Dave (cpusurgeon@gmail.com)
