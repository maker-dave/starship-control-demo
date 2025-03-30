# Starship Control Demo

A simple demo of a starship control system featuring two stations—Navigation and Engineering—designed to simulate real-time interaction between crew roles. Built with HTML5, WebSocket, and WebRTC (via PeerJS), this project runs on a Raspberry Pi 4, enabling peer-to-peer communication between stations with local state persistence.

## Features
- Stations:
  - Navigation: Toggle FTL and Sublight drives, monitor engine statuses.
  - Engineering: Toggle FTL and Sublight engine states, monitor drive statuses.
- Real-Time Sync: Updates propagate instantly between stations using WebRTC.
- Local Persistence: Toggle states are saved in localStorage for session continuity.
- Reconnection Handling: Automatically recovers from screen timeouts and network drops.
- Refresh Protection: Warns on browser refresh and restores sessions from localStorage.

## Prerequisites
- Raspberry Pi 4 with Raspbian installed.
- Apache 2 to serve the HTML interface.
- Node.js and npm for the WebSocket server.
- Git for cloning the repository.

## Setup Instructions
1. Clone the Repository:
   git clone https://github.com/maker-dave/starship-control-demo.git
   cd starship-control-demo

2. Install Dependencies:
   Install the WebSocket module for Node.js:
   npm install ws

3. Deploy Files:
   Copy index.html to Apache’s web directory:
   sudo cp index.html /var/www/html/
   Keep server.js in your project directory (e.g., /home/aprs/starship-control-demo).

4. Start the Server:
   Launch the WebSocket server:
   node server.js

5. Access the Demo:
   On two devices, open http://<pi-ip-address>/index.html (e.g., http://192.168.86.69/index.html) in a browser.
   One device claims "Navigation," the other "Engineering."

## Usage
- Claim a Station: Select "Navigation" or "Engineering" on each device.
- Toggle Controls: Click buttons to switch FTL/Sublight (Navigation) or engine states (Engineering).
- Monitor Status: Observe real-time updates on the other station’s display.
- Test Resilience: Lock a device screen or refresh the browser to verify reconnection and session restore.

## Project Files
- index.html: Client-side interface and logic (HTML5, JavaScript, PeerJS).
- server.js: WebSocket server for initial station coordination (Node.js).
- .gitignore: Excludes node_modules/ and log files.
- README.txt: This file.

## Requirements
- Apache 2: Configured to serve from /var/www/html (or adjust DocumentRoot to /home/aprs/starship-control-demo).
- Node.js: Version 18+ with ws module installed.
- Network: Devices must be on the same network as the Pi (e.g., Wi-Fi at 192.168.86.x).

## Notes
- Developed and tested on a Raspberry Pi 4 with IP 192.168.86.69.
- WebSocket server runs on port 8080—ensure it’s open with sudo ufw allow 8080.
- For local development, work in /home/aprs/starship-control-demo and sync index.html to Apache’s directory as needed.
- No external hosting required; all communication is local or P2P after setup.

## Contributing
Fork the repo, make your changes, and submit a pull request—or open an issue with suggestions! This is a maker-friendly project—feel free to experiment and share ideas.

## License
None specified yet—open to suggestions!

## Author
- Maker Dave (cpusurgeon@gmail.com)
