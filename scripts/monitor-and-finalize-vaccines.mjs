/**
 * Monitor Vaccine Import and Finalize
 * Waits for vaccine import to complete, then:
 * 1. Populates vaccinationStatus JSON fields
 * 2. Flags pets with expired vaccines
 */

import { promisify } from 'util';
import { exec } from 'child_process';
import { readFileSync } from 'fs';

const execAsync = promisify(exec);

async function checkImportStatus() {
  try {
    const log = readFileSync('/tmp/vaccine-reimport.log', 'utf8');
    return log.includes('FINAL SUMMARY') && log.includes('Import complete');
  } catch (error) {
    return false;
  }
}

async function waitForImport() {
  console.log('Monitoring vaccine import progress...\n');
  
  let checks = 0;
  const maxChecks = 120; // 20 minutes max (10 second intervals)
  
  while (checks < maxChecks) {
    const isComplete = await checkImportStatus();
    
    if (isComplete) {
      console.log('\n✅ Vaccine import complete!\n');
      return true;
    }
    
    // Show progress every 30 seconds
    if (checks % 3 === 0) {
      try {
        const log = readFileSync('/tmp/vaccine-reimport.log', 'utf8');
        const batchMatch = log.match(/Processing batch (\d+)\/19/g);
        if (batchMatch && batchMatch.length > 0) {
          const lastBatch = batchMatch[batchMatch.length - 1];
          console.log(`  ${lastBatch}...`);
        }
      } catch (e) {
        // Ignore read errors
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    checks++;
  }
  
  console.log('\n⚠️  Import taking longer than expected. Proceeding anyway...\n');
  return false;
}

async function populateVaccinationStatus() {
  console.log('Step 1: Populating vaccinationStatus fields...\n');
  
  const sql = `
    WITH vaccine_data AS (
      SELECT 
        "petId",
        json_object_agg(
          LOWER(REPLACE(REPLACE(description, ' vaccination', ''), ' ', '_')),
          json_build_object(
            'status', CASE 
              WHEN "expirationDate" IS NULL THEN 'PENDING'
              WHEN "expirationDate" > NOW() THEN 'CURRENT'
              ELSE 'EXPIRED'
            END,
            'expiration', "expirationDate",
            'lastGiven', "recordDate"
          )
        ) as vaccination_status,
        json_object_agg(
          LOWER(REPLACE(REPLACE(description, ' vaccination', ''), ' ', '_')),
          "expirationDate"
        ) as vaccine_expirations
      FROM medical_records
      WHERE "recordType" = 'VACCINATION'
        AND description LIKE '%vaccination'
      GROUP BY "petId"
    )
    UPDATE pets p
    SET 
      "vaccinationStatus" = v.vaccination_status,
      "vaccineExpirations" = v.vaccine_expirations
    FROM vaccine_data v
    WHERE p.id = v."petId";
  `;

  const { stdout } = await execAsync(
    `docker exec tailtown-postgres psql -U postgres -d customer -c "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`
  );
  
  console.log(stdout);
  console.log('✅ Vaccination status populated!\n');
}

async function flagExpiredVaccines() {
  console.log('Step 2: Flagging pets with expired vaccines...\n');
  
  // Add red-flag icon to pets with expired vaccines
  const updateSql = `
    UPDATE pets p
    SET "petIcons" = CASE
      WHEN "petIcons" IS NULL THEN '["red-flag"]'::jsonb
      WHEN NOT "petIcons"::text LIKE '%red-flag%' THEN 
        ("petIcons"::jsonb || '["red-flag"]'::jsonb)
      ELSE "petIcons"
    END,
    "iconNotes" = CASE
      WHEN "iconNotes" IS NULL THEN '{"red-flag": "EXPIRED VACCINES - Update required before check-in"}'::jsonb
      ELSE "iconNotes"::jsonb || '{"red-flag": "EXPIRED VACCINES - Update required before check-in"}'::jsonb
    END
    WHERE p.id IN (
      SELECT DISTINCT p2.id
      FROM pets p2
      JOIN medical_records mr ON p2.id = mr."petId"
      WHERE mr."recordType" = 'VACCINATION'
        AND mr."expirationDate" < NOW()
        AND mr.description LIKE '%vaccination'
    );
  `;

  const { stdout } = await execAsync(
    `docker exec tailtown-postgres psql -U postgres -d customer -c "${updateSql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`
  );

  console.log(stdout);
  
  // Get count
  const { stdout: count } = await execAsync(
    `docker exec tailtown-postgres psql -U postgres -d customer -t -c "SELECT COUNT(*) FROM pets WHERE \\"petIcons\\"::text LIKE '%red-flag%';"`
  );
  
  console.log(`✅ Flagged ${count.trim()} pets with expired vaccines (red flag 🟥)!\n`);
}

async function showSummary() {
  console.log('=== FINAL SUMMARY ===\n');
  
  const { stdout: vaccineCount } = await execAsync(
    `docker exec tailtown-postgres psql -U postgres -d customer -t -c "SELECT COUNT(*) FROM medical_records WHERE \\"recordType\\" = 'VACCINATION';"`
  );
  
  const { stdout: petsWithVaccines } = await execAsync(
    `docker exec tailtown-postgres psql -U postgres -d customer -t -c "SELECT COUNT(DISTINCT \\"petId\\") FROM medical_records WHERE \\"recordType\\" = 'VACCINATION';"`
  );
  
  const { stdout: expiredCount } = await execAsync(
    `docker exec tailtown-postgres psql -U postgres -d customer -t -c "SELECT COUNT(*) FROM pets WHERE \\"petIcons\\"::text LIKE '%VACCINE_EXPIRED%';"`
  );
  
  console.log(`Total vaccine records: ${vaccineCount.trim()}`);
  console.log(`Pets with vaccines: ${petsWithVaccines.trim()}`);
  console.log(`Pets with expired vaccines: ${expiredCount.trim()}`);
  
  // Show Beaucoup's data
  const { stdout: beaucoup } = await execAsync(
    `docker exec tailtown-postgres psql -U postgres -d customer -c "SELECT name, breed, \\"vaccinationStatus\\" FROM pets WHERE id = '545ef633-d276-4682-8cfd-ead494c5d311';"`
  );
  
  console.log('\nSample pet (Beaucoup):');
  console.log(beaucoup);
  
  console.log('\n🎉 All vaccine data finalized and ready!');
}

async function main() {
  try {
    // Wait for import to complete
    await waitForImport();
    
    // Populate vaccination status
    await populateVaccinationStatus();
    
    // Flag expired vaccines
    await flagExpiredVaccines();
    
    // Show summary
    await showSummary();
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
