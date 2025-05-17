const axios = require('axios');

// Test analytics API endpoints
async function testAnalyticsEndpoints() {
  // Test period values to try
  const periods = ['day', 'week', 'month', 'year', 'all'];
  
  // Test dashboard endpoint
  try {
    console.log('Testing /api/analytics/dashboard endpoint...');
    const dashboardResponse = await axios.get(`http://localhost:3002/api/analytics/dashboard?period=month`);
    console.log('Dashboard response status:', dashboardResponse.status);
    console.log('Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
  } catch (error) {
    console.error('Error with dashboard endpoint:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Full error:', error);
    }
  }

  // Test sales by service endpoint
  try {
    console.log('\nTesting /api/analytics/sales/services endpoint...');
    const servicesResponse = await axios.get(`http://localhost:3002/api/analytics/sales/services?period=month`);
    console.log('Services response status:', servicesResponse.status);
    console.log('Services data:', JSON.stringify(servicesResponse.data, null, 2));
  } catch (error) {
    console.error('Error with sales/services endpoint:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Full error:', error);
    }
  }
  
  // Test sales by add-on endpoint
  try {
    console.log('\nTesting /api/analytics/sales/addons endpoint...');
    const addonsResponse = await axios.get(`http://localhost:3002/api/analytics/sales/addons?period=month`);
    console.log('Add-ons response status:', addonsResponse.status);
    console.log('Add-ons data:', JSON.stringify(addonsResponse.data, null, 2));
  } catch (error) {
    console.error('Error with sales/addons endpoint:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Full error:', error);
    }
  }
}

testAnalyticsEndpoints();
