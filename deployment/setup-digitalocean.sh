#!/bin/bash

# Initial setup script for Digital Ocean droplet
# Run this once on a fresh Ubuntu 22.04 droplet

set -e

echo "🚀 Setting up Tailtown on Digital Ocean..."
echo ""

# Update system
echo "[1/10] Updating system..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "[2/10] Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "[3/10] Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js and npm (for PM2 option)
echo "[4/10] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "[5/10] Installing PM2..."
sudo npm install -g pm2

# Create tailtown user
echo "[6/10] Creating tailtown user..."
sudo useradd -m -s /bin/bash tailtown || true
sudo usermod -aG docker tailtown

# Create directories
echo "[7/10] Creating directories..."
sudo mkdir -p /opt/tailtown
sudo mkdir -p /var/log/tailtown
sudo chown -R tailtown:tailtown /opt/tailtown
sudo chown -R tailtown:tailtown /var/log/tailtown

# Install Nginx
echo "[8/10] Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx

# Install PostgreSQL client
echo "[9/10] Installing PostgreSQL client..."
sudo apt-get install -y postgresql-client

# Setup firewall
echo "[10/10] Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo "✅ Initial setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /opt/tailtown"
echo "2. Create .env.production file with your configuration"
echo "3. Choose deployment method:"
echo "   - Docker: Run ./deployment/deploy.sh"
echo "   - PM2: Run pm2 start ecosystem.config.js --env production"
echo "   - systemd: Copy service files and enable them"
echo ""
echo "⚠️  Log out and back in for Docker group changes to take effect"
