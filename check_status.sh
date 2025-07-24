#!/bin/bash

echo "=== Docker Container Status ==="
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}" | grep -E 'postgres|tailtown'

echo -e "\n=== Database Connection Test ==="
echo "Testing connection to customer database (port 5435)..."
docker exec tailtown-customer-db-1 psql -U postgres -d customer -c "SELECT COUNT(*) FROM pet;" || echo "Failed to connect to customer database"

echo -e "\n=== Service Status ==="
echo "Checking if customer service is running on port 4004..."
curl -s http://localhost:4004/health || echo "Customer service not responding"

echo -e "\nChecking if reservation service is running on port 4003..."
curl -s http://localhost:4003/health || echo "Reservation service not responding"

echo -e "\nChecking if frontend is running on port 3000..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
  echo "Frontend is running"
else
  echo "Frontend not responding"
fi

echo -e "\n=== Environment Variables ==="
echo "Customer service DATABASE_URL:"
grep DATABASE_URL /Users/robweinstein/CascadeProjects/tailtown/services/customer/.env

echo -e "\nReservation service DATABASE_URL:"
grep DATABASE_URL /Users/robweinstein/CascadeProjects/tailtown/services/reservation-service/.env

echo -e "\nFrontend API URLs:"
grep -E 'REACT_APP.*API_URL' /Users/robweinstein/CascadeProjects/tailtown/frontend/.env
