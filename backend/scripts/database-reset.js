/**
 * ============================================================================
 * SCRIPT: backend/scripts/database-reset.js
 * PURPOSE: Clears all application data from PostgreSQL.
 * USAGE:   npm run database:reset
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;

// Load backend/.env if available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch (e) {
    // ignore now :>
  }
}

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:Danny12345@localhost:5432/lg_natures_water_db';

const client = new Client({ connectionString });

async function resetDatabase() {
  console.log('Connecting to PostgreSQL to reset application data...');
  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    const tablesToClear = [
      'billing_documents',
      'orders',
      'photo_count_logs',
      'customer_profiles',
      'container_ledgers',
      'route_trips',
      'delivery_customers',
      'container_presets',
      'users',
    ];

    for (const table of tablesToClear) {
      try {
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
        console.log(`✓ Cleared table: ${table}`);
      } catch (err) {
        // Ignore if table does not exist (code 42P01)
        if (err.code !== '42P01') {
          console.warn(`! Note for ${table}: ${err.message}`);
        }
      }
    }

    console.log('\n============================================================');
    console.log('✅ Database reset complete: All application data cleared.');
    console.log('👉 Next step: Run "npm run database:data" to upload staff accounts.');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
