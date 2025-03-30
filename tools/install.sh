#!/bin/bash

# Starship Control Demo Installation Script
# Run this script on a Raspberry Pi 4 with Raspbian to set up the project in ~/spaceship.
# Note: This project uses Express (in server.js) to serve HTML files, so Apache is not required.

# Exit on any error
set -e

# Define project directory and repository URL
HOME_DIR=$(eval echo ~$USER)
PROJECT_DIR="$HOME_DIR/spaceship"
REPO_URL="https://github.com/maker-dave/starship-control-demo.git"

echo "Starting installation of Starship Control Demo..."

# Step 1: Check for required tools (git, curl for Node.js setup)
echo "Checking for required tools..."
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Installing git..."
    sudo apt update
    sudo apt install -y git
fi

if ! command -v curl &> /dev/null; then
    echo "Curl is not installed. Installing curl..."
    sudo apt update
    sudo apt install -y curl
fi

# Step 2: Install Node.js and npm (if not already installed)
echo "Checking for Node.js and npm..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Node.js and/or npm not found. Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Verify Node.js and npm versions
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "Node.js version: $NODE_VERSION"
echo "npm version: $NPM_VERSION"

# Step 3: Clone the repository into ~/spaceship (or update if it exists)
if [ -d "$PROJECT_DIR" ]; then
    echo "Project directory $PROJECT_DIR already exists. Updating repository..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    echo "Cloning repository from $REPO_URL into $PROJECT_DIR..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# Step 4: Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install ws express

# Step 5: Create public directory and move HTML files from lib/ to public/
echo "Setting up public directory for HTML files..."
if [ ! -d "$PROJECT_DIR/public" ]; then
    echo "Creating $PROJECT_DIR/public..."
    mkdir "$PROJECT_DIR/public"
fi

# Check if lib/ directory exists and move HTML files to public/
if [ -d "$PROJECT_DIR/lib" ]; then
    HTML_FILES=("index.html" "nav.html" "engineering.html" "world.html" "science.html")
    for file in "${HTML_FILES[@]}"; do
        if [ -f "$PROJECT_DIR/lib/$file" ]; then
            mv "$PROJECT_DIR/lib/$file" "$PROJECT_DIR/public/$file"
            echo "Moved $file from $PROJECT_DIR/lib/ to $PROJECT_DIR/public/"
        else
            echo "Warning: $file not found in $PROJECT_DIR/lib/. Ensure it's present."
        fi
    done
else
    echo "Error: $PROJECT_DIR/lib/ directory not found. Ensure the repository includes a lib/ directory with HTML files."
    exit 1
fi

# Step 6: Verify required files
echo "Verifying required files..."
REQUIRED_FILES=("server.js" "public/index.html" "public/nav.html" "public/engineering.html" "public/world.html" "public/science.html")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PROJECT_DIR/$file" ]; then
        echo "Error: $file not found in $PROJECT_DIR. Installation cannot proceed."
        exit 1
    else
        echo "Found $file"
    fi
done

# Step 7: Open port 8080 for WebSocket and HTTP
echo "Opening port 8080 for WebSocket and HTTP..."
sudo ufw allow 8080 || echo "ufw not installed, skipping port configuration (ensure port 8080 is open manually if needed)."

# Step 8: Start the server in the background
echo "Starting the server..."
nohup node server.js > server.log 2>&1 &

# Wait a moment for the server to start
sleep 2

# Check if the server is running
if ps aux | grep "[n]ode server.js" > /dev/null; then
    echo "Server started successfully! Logs are in $PROJECT_DIR/server.log"
else
    echo "Failed to start the server. Check $PROJECT_DIR/server.log for details."
    exit 1
fi

# Step 9: Display access instructions
PI_IP=$(hostname -I | awk '{print $1}')
echo "Installation complete!"
echo "Access the demo at: http://$PI_IP:8080/index.html"
echo "To stop the server, run: pkill -f 'node server.js'"
echo "To restart the server, run: cd $PROJECT_DIR && nohup node server.js > server.log 2>&1 &"
