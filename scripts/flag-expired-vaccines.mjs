/**
 * Flag Pets with Expired Vaccines
 * Adds a visual flag to pets with expired required vaccines
 */

import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Required vaccines for dogs and cats
const REQUIRED_VACCINES = {
  DOG: ['rabies', 'dhpp', 'bordetella'],
  CAT: ['rabies', 'fvrcp']
};

async function flagExpiredVaccines() {
  try {
    console.log('Checking for expired vaccines...\n');

    // SQL to identify pets with expired required vaccines
    const sql = `
      WITH vaccine_status AS (
        SELECT 
          p.id,
          p.name,
          p.type,
          mr.description,
          mr."expirationDate",
          CASE 
            WHEN mr."expirationDate" IS NULL THEN 'MISSING'
            WHEN mr."expirationDate" < NOW() THEN 'EXPIRED'
            ELSE 'CURRENT'
          END as status
        FROM pets p
        LEFT JOIN medical_records mr ON p.id = mr."petId" 
          AND mr."recordType" = 'VACCINATION'
          AND mr.description LIKE '%vaccination'
        WHERE p.type IN ('DOG', 'CAT')
      ),
      expired_pets AS (
        SELECT DISTINCT
          id,
          name,
          type,
          COUNT(*) FILTER (WHERE status = 'EXPIRED') as expired_count,
          COUNT(*) FILTER (WHERE status = 'MISSING') as missing_count,
          array_agg(DISTINCT description) FILTER (WHERE status = 'EXPIRED') as expired_vaccines
        FROM vaccine_status
        GROUP BY id, name, type
        HAVING COUNT(*) FILTER (WHERE status = 'EXPIRED') > 0
           OR COUNT(*) FILTER (WHERE status = 'MISSING') > 0
      )
      SELECT 
        id,
        name,
        type,
        expired_count,
        missing_count,
        expired_vaccines
      FROM expired_pets
      ORDER BY expired_count DESC, missing_count DESC
      LIMIT 20;
    `;

    console.log('Finding pets with expired vaccines...');
    const { stdout } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -c "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`
    );

    console.log(stdout);

    // Now add a special icon to pets with expired vaccines
    console.log('\nAdding expired vaccine flag to pet icons...');
    
    const updateSql = `
      UPDATE pets p
      SET "petIcons" = CASE
        WHEN "petIcons" IS NULL THEN '["VACCINE_EXPIRED"]'::jsonb
        WHEN NOT "petIcons"::text LIKE '%VACCINE_EXPIRED%' THEN 
          ("petIcons"::jsonb || '["VACCINE_EXPIRED"]'::jsonb)
        ELSE "petIcons"
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

    const { stdout: updateResult } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -c "${updateSql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`
    );

    console.log(updateResult);
    console.log('\n✅ Flagging complete!');

    // Summary
    const { stdout: summary } = await execAsync(
      `docker exec tailtown-postgres psql -U postgres -d customer -c "SELECT COUNT(*) as pets_with_expired_vaccines FROM pets WHERE \\"petIcons\\"::text LIKE '%VACCINE_EXPIRED%';"`
    );

    console.log('\nSummary:');
    console.log(summary);

  } catch (error) {
    console.error('Flagging failed:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    process.exit(1);
  }
}

// Run the flagging
flagExpiredVaccines();
