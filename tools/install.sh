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
PORT=8126

echo "Starting installation of Starship Control Demo..."

# Step 1: Check for required tools (git, curl for Node.js setup, lsof for port checking)
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

if ! command -v lsof &> /dev/null; then
    echo "lsof is not installed. Installing lsof..."
    sudo apt update
    sudo apt install -y lsof
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

# Step 3: Clone the repository into ~/spaceship (remove existing directory if present)
if [ -d "$PROJECT_DIR" ]; then
    echo "Project directory $PROJECT_DIR already exists."
    echo "Removing existing directory to ensure a clean installation..."
    rm -rf "$PROJECT_DIR"
fi

echo "Cloning repository from $REPO_URL into $PROJECT_DIR..."
git clone "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Step 4: Install Node.js dependencies using package.json
echo "Installing Node.js dependencies..."
# Copy package.json from tools/ to project root
if [ -f "$PROJECT_DIR/tools/package.json" ]; then
    cp "$PROJECT_DIR/tools/package.json" "$PROJECT_DIR/package.json"
    echo "Copied package.json to $PROJECT_DIR"
else
    echo "Error: package.json not found in $PROJECT_DIR/tools/. Installation cannot proceed."
    exit 1
fi
npm install

# Step 5: Create public directory and move HTML files and server.js from lib/
echo "Setting up public directory for HTML files..."
if [ ! -d "$PROJECT_DIR/public" ]; then
    echo "Creating $PROJECT_DIR/public..."
    mkdir "$PROJECT_DIR/public"
fi

# Check if lib/ directory exists and move files
if [ -d "$PROJECT_DIR/lib" ]; then
    # Move HTML files to public/
    HTML_FILES=("index.html" "navigation.html" "engineering.html" "world.html" "science.html" "config.html" "ops.html")
    for file in "${HTML_FILES[@]}"; do
        if [ -f "$PROJECT_DIR/lib/$file" ]; then
            mv "$PROJECT_DIR/lib/$file" "$PROJECT_DIR/public/$file"
            echo "Moved $file from $PROJECT_DIR/lib/ to $PROJECT_DIR/public/"
        else
            echo "Warning: $file not found in $PROJECT_DIR/lib/. Ensure it's present."
        fi
    done

    # Move server.js to root
    if [ -f "$PROJECT_DIR/lib/server.js" ]; then
        mv "$PROJECT_DIR/lib/server.js" "$PROJECT_DIR/server.js"
        echo "Moved server.js from $PROJECT_DIR/lib/ to $PROJECT_DIR/"
    else
        echo "Error: server.js not found in $PROJECT_DIR/lib/. Installation cannot proceed."
        exit 1
    fi

    # Copy stations.json to root
    if [ -f "$PROJECT_DIR/tools/stations.json" ]; then
        cp "$PROJECT_DIR/tools/stations.json" "$PROJECT_DIR/stations.json"
        echo "Copied stations.json to $PROJECT_DIR"
    else
        echo "Error: stations.json not found in $PROJECT_DIR/tools/. Installation cannot proceed."
        exit 1
    fi
else
    echo "Error: $PROJECT_DIR/lib/ directory not found. Ensure the repository includes a lib/ directory with HTML files and server.js."
    exit 1
fi

# Step 6: Verify required files
echo "Verifying required files..."
REQUIRED_FILES=("server.js" "stations.json" "public/index.html" "public/navigation.html" "public/engineering.html" "public/world.html" "public/science.html" "public/config.html" "public/ops.html")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PROJECT_DIR/$file" ]; then
        echo "Error: $file not found in $PROJECT_DIR. Installation cannot proceed."
        exit 1
    else
        echo "Found $file"
    fi
done

# Step 7: Check for and stop any existing server.js processes
echo "Checking for existing server.js processes..."
if ps aux | grep "[n]ode server.js" > /dev/null; then
    echo "Found existing server.js process. Stopping it..."
    pkill -f 'node server.js' || {
        echo "Warning: Could not stop existing server.js process. Please stop it manually and rerun the script."
        exit 1
    }
    sleep 2  # Wait for the process to fully terminate
fi

# Step 8: Check if port 8126 is in use
echo "Checking if port $PORT is available..."
if sudo lsof -i :$PORT > /dev/null || ss -tuln | grep ":$PORT" > /dev/null; then
    echo "Port $PORT is in use. Attempting to free it..."
    sudo fuser -k $PORT/tcp || {
        echo "Error: Could not free port $PORT. Please free it manually and rerun the script."
        echo "To free the port manually, run: sudo lsof -i :$PORT to find the PID, then sudo kill -9 <PID>"
        exit 1
    }
    sleep 5  # Wait longer to ensure the port is fully released
fi

# Verify the port is free
if sudo lsof -i :$PORT > /dev/null || ss -tuln | grep ":$PORT" > /dev/null; then
    echo "Error: Port $PORT is still in use after attempting to free it."
    echo "Please free the port manually and rerun the script."
    exit 1
fi
echo "Port $PORT is available."

# Step 9: Open port 8126 for WebSocket and HTTP
echo "Opening port $PORT for WebSocket and HTTP..."
sudo ufw allow $PORT || echo "ufw not installed, skipping port configuration (ensure port $PORT is open manually if needed)."

# Step 10: Start the server in the background with retries
echo "Starting the server..."
MAX_RETRIES=3
RETRY_COUNT=0
until [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
    nohup node server.js > server.log 2>&1 &
    sleep 5  # Increased delay to ensure the server has time to bind
    if ps aux | grep "[n]ode server.js" > /dev/null; then
        echo "Server started successfully! Logs are in $PROJECT_DIR/server.log"
        break
    else
        echo "Attempt $((RETRY_COUNT + 1)) to start the server failed."
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "Retrying in 5 seconds..."
            sleep 5
            if sudo lsof -i :$PORT > /dev/null || ss -tuln | grep ":$PORT" > /dev/null; then
                echo "Port $PORT is in use again. Freeing it..."
                sudo fuser -k $PORT/tcp || {
                    echo "Error: Could not free port $PORT. Please free it manually and rerun the script."
                    exit 1
                }
                sleep 5  # Wait longer after freeing the port
            fi
        fi
    fi
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Failed to start the server after $MAX_RETRIES attempts. Displaying server log for details:"
    cat "$PROJECT_DIR/server.log"
    exit 1
fi

# Step 11: Display access instructions
PI_IP=$(hostname -I | awk '{print $1}')
echo "Installation complete!"
echo "Access the demo at: http://$PI_IP:$PORT/index.html"
echo "To stop the server, run: pkill -f 'node server.js'"
echo "To restart the server, run: cd $PROJECT_DIR && nohup node server.js > server.log 2>&1 &"
