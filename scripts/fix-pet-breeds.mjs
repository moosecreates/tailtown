/**
 * Fix Pet Breed Names
 * Updates breed field from Gingr breed_id to actual breed name
 */

import { readFileSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

async function fixPetBreeds() {
  try {
    console.log('Starting pet breed fix...\n');

    // Load breeds data
    console.log('Loading breeds data...');
    const breedsData = JSON.parse(
      readFileSync('/Users/robweinstein/CascadeProjects/tailtown/data/gingr-reference/breeds.json', 'utf8')
    );
    
    console.log(`Loaded ${breedsData.length} breeds\n`);

    // Create a map of breed ID to breed name
    const breedMap = new Map();
    breedsData.forEach(breed => {
      breedMap.set(breed.value, breed.label);
    });

    console.log('Fetching pets with breed IDs...');
    const { stdout } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -t -c "SELECT id, breed FROM pets WHERE breed IS NOT NULL AND breed != '';"`
    );

    const pets = [];
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.trim().split('|').map(s => s.trim());
      if (parts.length >= 2) {
        const [id, breedId] = parts;
        if (id && breedId) {
          pets.push({ id, breedId });
        }
      }
    }

    console.log(`Found ${pets.length} pets with breed IDs\n`);

    // Generate UPDATE statements
    const updates = [];
    let matched = 0;
    let notMatched = 0;

    for (const pet of pets) {
      const breedName = breedMap.get(pet.breedId);
      
      if (breedName) {
        const escapedBreed = breedName.replace(/'/g, "''");
        updates.push(`UPDATE pets SET breed = '${escapedBreed}' WHERE id = '${pet.id}';`);
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
    const sqlFile = '/tmp/fix-pet-breeds.sql';
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
      `docker exec tailtown-postgres psql -U postgres -d customer -c "SELECT name, breed FROM pets WHERE id = '545ef633-d276-4682-8cfd-ead494c5d311';"`
    );
    
    console.log('Sample updated pet (Beaucoup):');
    console.log(verifyResult);

  } catch (error) {
    console.error('Update failed:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    process.exit(1);
  }
}

// Run the fix
fixPetBreeds();
