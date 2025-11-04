#!/usr/bin/env node

/**
 * Run Temperaments Migration
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('\n😊 Running Temperaments Migration\n');
  
  const migrationsDir = path.join(__dirname, '..', 'services', 'customer', 'prisma', 'migrations');
  const migrations = fs.readdirSync(migrationsDir);
  const tempMigration = migrations.find(m => m.includes('add_temperaments'));
  
  if (!tempMigration) {
    console.error('❌ Error: Temperaments migration not found');
    process.exit(1);
  }
  
  const migrationFile = path.join(migrationsDir, tempMigration, 'migration.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');
  
  console.log(`📁 Migration file: ${tempMigration}\n`);
  
  const client = new Client({
    host: 'localhost',
    port: 5433,
    database: 'customer',
    user: 'postgres',
    password: 'postgres'
  });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');
    
    console.log('🚀 Executing migration...');
    await client.query(sql);
    console.log('✅ Migration executed successfully\n');
    
    const result = await client.query(`
      SELECT name FROM temperament_types 
      WHERE "tenantId" = 'dev'
      ORDER BY name
    `);
    
    console.log(`📊 Temperament types imported: ${result.rows.length}\n`);
    console.log('😊 Available Temperaments:');
    result.rows.forEach(row => {
      console.log(`   • ${row.name}`);
    });
    
    console.log('\n✅ Temperaments migration complete!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
