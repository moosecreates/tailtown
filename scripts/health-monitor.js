#!/usr/bin/env node

/**
 * Service Health Monitor
 * Monitors all Tailtown services and detects hangs/resource issues
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERVICES = [
  { name: 'Frontend', port: 3000, path: '/', expectedStatus: 200 },
  { name: 'Customer Service', port: 4004, path: '/api/customers', expectedStatus: 200 },
  { name: 'Reservation Service', port: 4003, path: '/health', expectedStatus: 200 },
  { name: 'Payment Service', port: 4005, path: '/health', expectedStatus: 200 }
];

const MCP_SERVER = {
  name: 'RAG MCP Server',
  script: path.join(__dirname, '../mcp-server/server.py'),
  env: {
    PYTHONPATH: path.join(__dirname, '../mcp-server'),
    TAILTOWN_ROOT: path.join(__dirname, '..')
  }
};

function checkService(service) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: service.port,
      path: service.path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve({
        name: service.name,
        status: res.statusCode === service.expectedStatus ? '✅ OK' : '❌ ERROR',
        statusCode: res.statusCode,
        responseTime: Date.now()
      });
    });

    req.on('error', () => {
      resolve({
        name: service.name,
        status: '❌ DOWN',
        statusCode: 'N/A',
        responseTime: Date.now()
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        status: '⚠️ TIMEOUT',
        statusCode: 'N/A',
        responseTime: Date.now()
      });
    });

    req.end();
  });
}

function checkMcpServer() {
  return new Promise((resolve) => {
    exec(`ps aux | grep -v grep | grep "${MCP_SERVER.script}"`, (error, stdout) => {
      resolve({
        name: MCP_SERVER.name,
        status: stdout.trim() ? '✅ RUNNING' : '❌ STOPPED',
        processCount: stdout.trim().split('\n').filter(line => line.trim()).length
      });
    });
  });
}

function checkNodeProcesses() {
  return new Promise((resolve) => {
    exec('ps aux | grep -E "(npm|node)" | grep -E "(tailtown|customer|reservation|payment|admin)" | grep -v grep | wc -l', (error, stdout) => {
      const count = parseInt(stdout.trim()) || 0;
      resolve({
        name: 'Node Processes',
        status: count > 20 ? '⚠️ TOO MANY' : count > 0 ? '✅ OK' : '❌ NONE',
        count
      });
    });
  });
}

async function main() {
  console.log('🔍 Tailtown Service Health Monitor');
  console.log('=====================================\n');

  // Check all services
  const results = await Promise.all([
    ...SERVICES.map(checkService),
    checkMcpServer(),
    checkNodeProcesses()
  ]);

  // Display results
  let hasIssues = false;
  results.forEach(result => {
    console.log(`${result.status} ${result.name}`);
    if (result.statusCode && result.statusCode !== 'N/A') {
      console.log(`   Status Code: ${result.statusCode}`);
    }
    if (result.count !== undefined) {
      console.log(`   Count: ${result.count}`);
    }
    if (result.processCount !== undefined) {
      console.log(`   Processes: ${result.processCount}`);
    }
    console.log('');
    
    if (result.status.includes('❌') || result.status.includes('⚠️')) {
      hasIssues = true;
    }
  });

  // Recommendations
  if (hasIssues) {
    console.log('🛠️  Recommended Actions:');
    console.log('------------------------');
    
    results.forEach(result => {
      if (result.name === 'Node Processes' && result.count > 20) {
        console.log('• Run: pkill -f "ts-node-dev" && pkill -f "react-scripts"');
      }
      if (result.name === 'RAG MCP Server' && result.status.includes('❌')) {
        console.log(`• Run: cd mcp-server && PYTHONPATH=${MCP_SERVER.env.PYTHONPATH} TAILTOWN_ROOT=${MCP_SERVER.env.TAILTOWN_ROOT} python3 server.py`);
      }
      if (result.name.includes('Service') && result.status.includes('❌')) {
        const port = SERVICES.find(s => s.name === result.name)?.port;
        if (port) {
          console.log(`• Check service logs and restart on port ${port}`);
        }
      }
    });
    
    process.exit(1);
  } else {
    console.log('✅ All services are healthy!');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkService, checkMcpServer, checkNodeProcesses };
