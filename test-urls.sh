#!/bin/bash

echo "Testing static file endpoint..."
curl -s http://localhost:3002/test-static | json_pp

echo -e "\nTesting direct file access..."
curl -I http://localhost:3002/uploads/pets/pet-1744685553244-883005399.jpg
