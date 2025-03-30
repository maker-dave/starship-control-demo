# Starship Control Demo

A distributed starship control simulator featuring modular stations—Navigation and Engineering—designed to simulate real-time crew interaction and ship dynamics. Built with HTML5, WebSocket, and WebRTC (via PeerJS), this project runs on a Raspberry Pi 4, leveraging peer-to-peer communication for station sync and client-side processing, with a server tracking the external world.

## Features
- Stations:
  - Navigation: Set throttle (0-100%) and course (0-360°), calculate ship speed/course, monitor power output.
  - Engineering: Adjust power output (0-100%), monitor navigation inputs and ship speed.
- Real-Time Sync: Station states (throttle, course, power) sync via PeerJS P2P.
- Distributed Processing: Clients calculate ship speed/course locally using P2P data, offloading computation from the server.
- World Simulation: Server tracks ship position (x, y) based on Navigation’s periodic speed/course updates.
- Local Persistence: Station states saved in localStorage for session continuity.
- Reconnection Handling: WebSocket and PeerJS auto-reconnect on network drops.
- Modular Design: `index.html` as launchpad redirects to station-specific pages (`nav.html`, `engineering.html`).

## Prerequisites
- Raspberry Pi 4 with Raspbian installed.
- Apache 2 to serve HTML files (or Express via Node.js).
- Node.js and npm for the WebSocket server.
- Git for cloning the repository.

## Setup Instructions
1. Clone the Repository:
   git clone https://github.com/maker-dave/starship-control-demo.git
   cd starship-control-demo

2. Install Dependencies:
   Install Node.js modules:
   npm install ws express

3. Deploy Files:
   Place `index.html`, `nav.html`, and `engineering.html` in a `public` folder under the project directory.
   Keep `server.js` in the root project directory (e.g., /home/aprs/starship-control-demo).

4. Start the Server:
   Launch the WebSocket and HTTP server:
   node server.js

5. Access the Demo:
   On two devices, open http://<pi-ip-address>:8080/index.html (e.g., http://192.168.86.69:8080/index.html) in a browser.
   One device claims "Navigation," the other "Engineering," then redirects to station pages.

## Usage
- Claim a Station: Select "Navigation" or "Engineering" on `index.html` to redirect to the station interface.
- Control the Ship:
  - Navigation: Adjust throttle and course sliders, watch speed/course update based on Engineering’s power.
  - Engineering: Set power output, monitor Navigation’s inputs and resulting speed.
- Monitor Status: Real-time updates reflect across stations via P2P.
- Test Resilience: Disconnect or refresh to verify reconnection and state persistence.

## Project Files
- index.html: Launchpad for station selection and redirection (HTML5, JavaScript, PeerJS).
- nav.html: Navigation station interface and logic.
- engineering.html: Engineering station interface and logic.
- server.js: WebSocket server for signaling and world tracking, Express for file serving (Node.js).
- revision_history.txt: Version history log.
- README.txt: This file.

## Requirements
- Node.js: Version 18+ with `ws` and `express` modules.
- Network: Devices on the same network as the Pi (e.g., Wi-Fi at 192.168.86.x).
- Ports: 8080 open for WebSocket and HTTP (sudo ufw allow 8080).

## Notes
- Developed on a Raspberry Pi 4 with IP 192.168.86.69.
- Apache can be replaced by Express (included in `server.js`)—serve from `/home/aprs/starship-control-demo/public`.
- Navigation reports speed/course to the server every 5 seconds during downtime; server updates ship position.
- No external hosting needed; P2P handles station sync, server manages world state.

## Contributing
Fork the repo, tweak the stations or add new ones, and submit a pull request—or open an issue with ideas! This is a maker-driven project—go wild with it.

## License
None specified yet—open to suggestions!

## Author
- Maker Dave (cpusurgeon@gmail.com)
