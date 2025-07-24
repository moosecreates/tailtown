// Simple script to check API endpoints
const http = require('http');

// Function to make a GET request to an API endpoint
function checkEndpoint(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status for ${url}: ${res.statusCode}`);
        try {
          const parsedData = JSON.parse(data);
          console.log('Response data:', JSON.stringify(parsedData, null, 2));
          resolve(parsedData);
        } catch (e) {
          console.log('Response is not JSON:', data.substring(0, 100) + (data.length > 100 ? '...' : ''));
          resolve(data);
        }
      });
    }).on('error', (err) => {
      console.error(`Error checking ${url}: ${err.message}`);
      reject(err);
    });
  });
}

// Check customer service endpoints
async function checkCustomerService() {
  console.log('\n=== Checking Customer Service (Port 4004) ===');
  try {
    await checkEndpoint('http://localhost:4004/api/customers?limit=5');
    await checkEndpoint('http://localhost:4004/api/pets?limit=5');
  } catch (error) {
    console.error('Failed to check customer service:', error.message);
  }
}

// Check reservation service endpoints
async function checkReservationService() {
  console.log('\n=== Checking Reservation Service (Port 4003) ===');
  try {
    await checkEndpoint('http://localhost:4003/api/reservations?limit=5');
    await checkEndpoint('http://localhost:4003/api/resources?limit=5');
  } catch (error) {
    console.error('Failed to check reservation service:', error.message);
  }
}

// Run the checks
async function runChecks() {
  await checkCustomerService();
  await checkReservationService();
}

runChecks().catch(console.error);
