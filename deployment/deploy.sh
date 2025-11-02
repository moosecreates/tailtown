#!/bin/bash

# Tailtown Production Deployment Script for Digital Ocean
# This script handles deployment using Docker Compose

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   Tailtown Production Deployment           ║"
echo "║   Digital Ocean Setup                      ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    echo "Please create .env.production with required environment variables"
    exit 1
fi

# Load environment variables
export $(cat .env.production | xargs)

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}[1/6]${NC} Checking prerequisites..."

if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites met${NC}"
echo ""

# Pull latest code
echo -e "${BLUE}[2/6]${NC} Pulling latest code..."
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Build Docker images
echo -e "${BLUE}[3/6]${NC} Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache
echo -e "${GREEN}✓ Images built${NC}"
echo ""

# Stop existing containers
echo -e "${BLUE}[4/6]${NC} Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

# Start new containers
echo -e "${BLUE}[5/6]${NC} Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Wait for services to be healthy
echo -e "${BLUE}[6/6]${NC} Waiting for services to be healthy..."
sleep 10

# Check health
CUSTOMER_HEALTH=$(docker exec tailtown-customer-prod wget -qO- http://localhost:4004/health 2>/dev/null || echo "FAIL")
RESERVATION_HEALTH=$(docker exec tailtown-reservation-prod wget -qO- http://localhost:4003/health 2>/dev/null || echo "FAIL")

if [ "$CUSTOMER_HEALTH" != "FAIL" ] && [ "$RESERVATION_HEALTH" != "FAIL" ]; then
    echo -e "${GREEN}✓ All services healthy${NC}"
else
    echo -e "${YELLOW}⚠ Some services may not be healthy yet${NC}"
    echo "Check logs with: docker-compose -f docker-compose.prod.yml logs"
fi

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║   ✅ Deployment Complete!                  ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Services:"
echo "  Frontend:            http://$(hostname -I | awk '{print $1}')"
echo "  Customer Service:    http://$(hostname -I | awk '{print $1}'):4004"
echo "  Reservation Service: http://$(hostname -I | awk '{print $1}'):4003"
echo ""
echo "Useful commands:"
echo "  View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop:         docker-compose -f docker-compose.prod.yml down"
echo "  Restart:      docker-compose -f docker-compose.prod.yml restart"
echo "  Status:       docker-compose -f docker-compose.prod.yml ps"
echo ""
