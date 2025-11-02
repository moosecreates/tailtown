/**
 * Populate vaccinationStatus and vaccineExpirations JSON fields
 * from medical_records table
 */

import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

async function populateVaccinationStatus() {
  try {
    console.log('Populating vaccinationStatus fields from medical_records...\n');

    // SQL to update pets with vaccination data from medical_records
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

    console.log('Executing SQL update...');
    const { stdout, stderr } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -c "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`
    );

    if (stderr && !stderr.includes('UPDATE')) {
      console.error('Errors:', stderr);
    }

    console.log(stdout);
    console.log('\n✅ Update complete!');

    // Verify with Beaucoup
    const { stdout: verify } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -c "SELECT name, \\"vaccinationStatus\\" FROM pets WHERE id = '545ef633-d276-4682-8cfd-ead494c5d311';"`
    );

    console.log('\nSample pet (Beaucoup):');
    console.log(verify);

  } catch (error) {
    console.error('Update failed:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    process.exit(1);
  }
}

// Run the update
populateVaccinationStatus();
