/**
 * Update Pet Veterinarian Information
 * Populates vetName and vetPhone fields on pets using the vets.json data
 */

import { readFileSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const TENANT_ID = 'dev';

async function updatePetVetInfo() {
  try {
    console.log('Starting pet veterinarian info update...\n');

    // Load vets data
    console.log('Loading veterinarian data...');
    const vetsData = JSON.parse(
      readFileSync('/Users/robweinstein/CascadeProjects/tailtown/data/gingr-reference/vets.json', 'utf8')
    );
    
    console.log(`Loaded ${vetsData.length} veterinarians\n`);

    // Create a map of vet ID to vet info
    const vetMap = new Map();
    vetsData.forEach(vet => {
      vetMap.set(vet.id, {
        name: vet.name,
        phone: vet.phone_number
      });
    });

    console.log('Fetching pets with veterinarian IDs...');
    const { stdout } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -t -c "SELECT id, \\"veterinarianId\\" FROM pets WHERE \\"veterinarianId\\" IS NOT NULL;"`
    );

    const pets = [];
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.trim().split('|').map(s => s.trim());
      if (parts.length >= 2) {
        const [id, vetId] = parts;
        if (id && vetId) {
          pets.push({ id, vetId });
        }
      }
    }

    console.log(`Found ${pets.length} pets with veterinarian IDs\n`);

    // Generate UPDATE statements
    const updates = [];
    let matched = 0;
    let notMatched = 0;

    for (const pet of pets) {
      const vetInfo = vetMap.get(pet.vetId);
      
      if (vetInfo && vetInfo.name && vetInfo.name !== '!') {
        const vetName = vetInfo.name.replace(/'/g, "''");
        const vetPhone = vetInfo.phone ? vetInfo.phone.replace(/'/g, "''") : '';
        
        updates.push(`
UPDATE pets 
SET "vetName" = '${vetName}', 
    "vetPhone" = '${vetPhone}'
WHERE id = '${pet.id}';
        `.trim());
        
        matched++;
      } else {
        notMatched++;
      }
    }

    console.log(`Matched: ${matched} pets`);
    console.log(`Not matched: ${notMatched} pets\n`);

    if (updates.length === 0) {
      console.log('No updates to apply');
      return;
    }

    // Write SQL file
    const sqlFile = '/tmp/update-pet-vet-info.sql';
    const fs = await import('fs');
    fs.writeFileSync(sqlFile, updates.join('\n'));
    
    console.log(`Generated SQL file: ${sqlFile}`);
    console.log('Applying updates to database...\n');

    // Execute SQL
    const { stdout: result, stderr } = await execAsync(
      `docker exec -i tailtown-postgres psql -U postgres -d customer < ${sqlFile}`
    );
    
    if (stderr && !stderr.includes('UPDATE')) {
      console.error('Errors:', stderr);
    }

    console.log('✅ Update complete!\n');

    // Verify
    const { stdout: verifyResult } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -t -c "SELECT COUNT(*) FROM pets WHERE \\"vetName\\" IS NOT NULL;"`
    );
    
    console.log(`Pets with vet names: ${verifyResult.trim()}`);

    // Show sample
    const { stdout: sample } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -c "SELECT name as pet_name, \\"vetName\\", \\"vetPhone\\" FROM pets WHERE \\"vetName\\" IS NOT NULL LIMIT 5;"`
    );
    
    console.log('\nSample updated pets:');
    console.log(sample);

  } catch (error) {
    console.error('Update failed:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    process.exit(1);
  }
}

// Run the update
updatePetVetInfo();
