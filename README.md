# Starship Control Demo

A distributed starship control simulator featuring modular stations—Navigation, Engineering, World, and Science—designed to simulate real-time crew interaction and ship dynamics. Built with HTML5, WebSocket, and WebRTC (via PeerJS), this project runs on a Raspberry Pi 4, leveraging peer-to-peer communication for station sync and client-side processing, with a server tracking the external world.

## Features
- Stations:
  - Navigation: Set throttle (0-100%) and course (0-360°), calculate ship speed/course, monitor power output, view radar-filtered map.
  - Engineering: Adjust power output (0-100%), monitor navigation inputs and ship speed.
  - World: Server utility to manage the simulation universe, track objects, and broadcast filtered world state.
  - Science: Configure radar settings (range, FOV, direction), monitor filtered world state on a map.
- Real-Time Sync: Station states (throttle, course, power, radar config) sync via PeerJS P2P.
- Distributed Processing: Clients calculate ship speed/course locally using P2P data, offloading computation from the server.
- World Simulation: Server tracks ship position (x, y) and objects, broadcasting filtered state based on radar settings.
- Local Persistence: Station states saved in localStorage for session continuity.
- Reconnection Handling: WebSocket and PeerJS auto-reconnect on network drops.
- Modular Design: `index.html` as launchpad redirects to station-specific pages (`nav.html`, `engineering.html`, `world.html`, `science.html`).

## Prerequisites
- Raspberry Pi 4 with Raspbian installed.
- Node.js and npm for the WebSocket and HTTP server.
- Git for cloning the repository.

## Setup Instructions
The easiest way to set up the project is to use the provided installation script, which automates the process.

### Automated Installation (Recommended)
1. Clone the repository to a temporary location:
   git clone https://github.com/maker-dave/starship-control-demo.git /tmp/starship-control-demo
   cd /tmp/starship-control-demo

2. Run the installation script (located in the `tools/` directory):
   chmod +x tools/install.sh
   ./tools/install.sh

3. Access the Demo:
   The script will install the project in `~/spaceship` and start the server. Access the demo at the URL provided by the script (e.g., `http://192.168.86.69:8123/index.html`).
   Claim "Navigation," "Engineering," "World," and "Science" on separate devices to start the simulation.

### Manual Installation (Alternative)
If you prefer to set up the project manually:
1. Clone the Repository:
   git clone https://github.com/maker-dave/starship-control-demo.git ~/spaceship
   cd ~/spaceship

2. Install Dependencies:
   Install Node.js modules:
   npm install ws express

3. Move HTML Files:
   Create a `public/` directory and move the HTML files from `lib/`:
   mkdir public
   mv lib/*.html public/

4. Start the Server:
   Launch the WebSocket and HTTP server:
   node server.js

5. Access the Demo:
   On four devices, open http://<pi-ip-address>:8123/index.html (e.g., http://192.168.86.69:8123/index.html) in a browser.
   Claim "Navigation," "Engineering," "World," and "Science" on separate devices to start the simulation.

## Usage
- Claim a Station: Select "Navigation," "Engineering," "World," or "Science" on `index.html` to redirect to the station interface.
- Control the Ship:
  - Navigation: Adjust throttle and course sliders, watch speed/course update based on Engineering’s power, view radar-filtered map.
  - Engineering: Set power output, monitor Navigation’s inputs and resulting speed.
  - World: Manage simulation objects (add, edit, delete), monitor all objects on a map.
  - Science: Configure radar settings (range, FOV, direction), monitor detected objects on a map.
- Monitor Status: Real-time updates reflect across stations via P2P.
- Test Resilience: Disconnect or refresh to verify reconnection and state persistence.

## Project Files
- lib/index.html: Launchpad for station selection and redirection (HTML5, JavaScript, PeerJS).
- lib/nav.html: Navigation station interface and logic.
- lib/engineering.html: Engineering station interface and logic.
- lib/world.html: World station interface and logic (server utility).
- lib/science.html: Science station interface and logic.
- lib/server.js: WebSocket server for signaling and Express for serving files (Node.js).
- docs/revision_history.txt: Version history log.
- README.md: This file (also available as README.txt).
- tools/install.sh: Installation script for automated setup.

## Requirements
- Node.js: Version 18+ with `ws` and `express` modules.
- Network: Devices on the same network as the Pi (e.g., Wi-Fi at 192.168.86.x).
- Ports: 8123 open for WebSocket and HTTP (sudo ufw allow 8123).

## Notes
- Developed on a Raspberry Pi 4 with IP 192.168.86.69.
- Uses Express (in `server.js`) to serve HTML files; no Apache required.
  - Note: Early versions of this project (up to Version 0.7) used Apache 2 to serve HTML files, with `server.js` handling only WebSocket communication. Starting with Version 0.8, `server.js` was updated to use Express for serving files, consolidating HTTP and WebSocket on port 8123 and eliminating the need for Apache.
- Navigation and Science stations receive world updates every 3 seconds, filtered by radar settings.
- No external hosting needed; P2P handles station sync, server manages world state.
- The `install.sh` script moves HTML files from `lib/` to `public/` during installation to match the expected structure for Express.
- Changed server port to 8123 to avoid conflicts with commonly used port 8080.

## Contributing
Fork the repo, tweak the stations or add new ones, and submit a pull request—or open an issue with ideas! This is a maker-driven project—go wild with it.

## License
None specified yet—open to suggestions!

## Author
- Maker Dave (cpusurgeon@gmail.com)
