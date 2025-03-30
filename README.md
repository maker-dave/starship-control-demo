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
1. Clone the Repository:
   git clone https://github.com/maker-dave/starship-control-demo.git ~/spaceship
   cd ~/spaceship

2. Install Dependencies:
   Install Node.js modules:
   npm install ws express

3. Start the Server:
   Launch the WebSocket and HTTP server:
   node server.js

4. Access the Demo:
   On four devices, open http://<pi-ip-address>:8080/index.html (e.g., http://192.168.86.69:8080/index.html) in a browser.
   Claim "Navigation," "Engineering," "World," and "Science" on separate devices to start the simulation.

## Automated Installation
An installation script is provided to automate the setup process:
1. Save `install.sh` to your Pi (e.g., `/home/pi/install.sh`).
2. Make it executable:
   chmod +x /home/pi/install.sh
3. Run the script:
   ./install.sh
The script will clone the repository, install dependencies, set up files, and start the server.

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
- index.html: Launchpad for station selection and redirection (HTML5, JavaScript, PeerJS).
- nav.html: Navigation station interface and logic.
- engineering.html: Engineering station interface and logic.
- world.html: World station interface and logic (server utility).
- science.html: Science station interface and logic.
- server.js: WebSocket server for signaling and Express for serving files (Node.js).
- revision_history.txt: Version history log.
- README.txt: This file.
- install.sh: Installation script for automated setup.

## Requirements
- Node.js: Version 18+ with `ws` and `express` modules.
- Network: Devices on the same network as the Pi (e.g., Wi-Fi at 192.168.86.x).
- Ports: 8080 open for WebSocket and HTTP (sudo ufw allow 8080).

## Notes
- Developed on a Raspberry Pi 4 with IP 192.168.86.69.
- Uses Express (in `server.js`) to serve HTML files; no Apache required.
- Navigation and Science stations receive world updates every 3 seconds, filtered by radar settings.
- No external hosting needed; P2P handles station sync, server manages world state.

## Contributing
Fork the repo, tweak the stations or add new ones, and submit a pull request—or open an issue with ideas! This is a maker-driven project—go wild with it.

## License
None specified yet—open to suggestions!

## Author
- Maker Dave (cpusurgeon@gmail.com)
