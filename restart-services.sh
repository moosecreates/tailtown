#!/bin/bash
# Simple restart script for Tailtown services

# Activate NVM
source ~/.nvm/nvm.sh

# Define colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Tailtown Service Restart ===${NC}"
echo -e "${YELLOW}To stop servers: Press Ctrl+C in each terminal window${NC}"
echo

# Instructions for manual restart
echo -e "${GREEN}1. Start reservation service (Terminal 1):${NC}"
echo -e "   cd $(pwd)/services/reservation-service"
echo -e "   source ~/.nvm/nvm.sh"
echo -e "   npm run dev"
echo
echo -e "${GREEN}2. Start customer service (Terminal 2):${NC}"
echo -e "   cd $(pwd)/services/customer"
echo -e "   source ~/.nvm/nvm.sh"
echo -e "   npm run dev"
echo
echo -e "${GREEN}3. Start frontend (Terminal 3):${NC}"
echo -e "   cd $(pwd)/frontend"
echo -e "   source ~/.nvm/nvm.sh"
echo -e "   npm start"
echo
echo -e "${GREEN}4. Set tenant ID in browser console:${NC}"
echo -e "   localStorage.setItem('tailtown_tenant_id', 'dev')"
echo
echo -e "${YELLOW}Note: If a service won't start due to port in use:${NC}"
echo -e "   kill -9 \$(lsof -ti tcp:3000) 2>/dev/null || true  # For frontend"
echo -e "   kill -9 \$(lsof -ti tcp:4003) 2>/dev/null || true  # For reservation"
echo -e "   kill -9 \$(lsof -ti tcp:4004) 2>/dev/null || true  # For customer"
