cat > ~/setup_starship.sh << 'EOF'
#!/bin/bash

# Script to automate Starship Control Demo setup

# Exit on any error
set -e

echo "Starting Starship Control Demo setup..."

# Step 1: Remove old temp directory if it exists
if [ -d "/tmp/starship-control-demo" ]; then
    echo "Removing /tmp/starship-control-demo..."
    rm -rf /tmp/starship-control-demo
fi

# Step 2: Clone the repository
echo "Cloning repository into /tmp/starship-control-demo..."
git clone https://github.com/maker-dave/starship-control-demo.git /tmp/starship-control-demo

# Step 3: Set execute permissions on install.sh
echo "Setting execute permissions on tools/install.sh..."
cd /tmp/starship-control-demo
chmod +x tools/install.sh

# Step 4: Run the install script
echo "Running install.sh..."
./tools/install.sh

echo "Setup complete! Access the demo at http://<your-pi-ip>:8126/index.html"
EOF
