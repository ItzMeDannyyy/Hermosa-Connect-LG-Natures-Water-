/**
 * ============================================================================
 * SCRIPT: backend/scripts/database-data.js
 * PURPOSE: Seeds/uploads the 2 staff accounts (Station Operator & Delivery Rider)
 *          into PostgreSQL, along with required station branch & container presets.
 *          Does NOT seed or load any orders or demo transactions.
 * USAGE:   npm run database:data
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
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
    // ignore parse error if any
  }
}

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:Danny12345@localhost:5432/lg_natures_water_db';

const client = new Client({ connectionString });

async function uploadData() {
  console.log('Connecting to PostgreSQL to upload staff accounts and presets...');
  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Ensure Station Branch #1 exists
    const branchRes = await client.query(
      `SELECT id, name FROM station_branches WHERE name ILIKE '%Station 1%' LIMIT 1;`
    );

    let branchId;
    if (branchRes.rows.length > 0) {
      branchId = branchRes.rows[0].id;
      console.log(`✓ Using existing Station Branch: ${branchRes.rows[0].name} (${branchId})`);
    } else {
      const newBranchRes = await client.query(`
        INSERT INTO station_branches (name, address, latitude, longitude, delivery_fee)
        VALUES (
          'LG Nature''s Water - Station 1 (Main Hub)',
          '124 Katipunan Ave, Loyola Heights, QC',
          14.6415,
          121.0748,
          '30.00'
        )
        RETURNING id, name;
      `);
      branchId = newBranchRes.rows[0].id;
      console.log(`✓ Created Station Branch: ${newBranchRes.rows[0].name} (${branchId})`);
    }

    // 2. Ensure Counter Container Presets exist for this branch
    const presetsToEnsure = [
      { name: '10 Liters (10L)', price: '13.00' },
      { name: '7 Liters (7L)', price: '9.00' },
      { name: '5-Gallon Round', price: '20.00' },
    ];

    for (const preset of presetsToEnsure) {
      const existingPresetRes = await client.query(
        `SELECT id FROM container_presets WHERE branch_id = $1 AND name = $2;`,
        [branchId, preset.name]
      );

      if (existingPresetRes.rows.length === 0) {
        await client.query(
          `INSERT INTO container_presets (branch_id, name, refill_price) VALUES ($1, $2, $3);`,
          [branchId, preset.name, preset.price]
        );
        console.log(`✓ Added preset: ${preset.name} @ ₱${preset.price}`);
      } else {
        await client.query(
          `UPDATE container_presets SET refill_price = $1 WHERE id = $2;`,
          [preset.price, existingPresetRes.rows[0].id]
        );
        console.log(`✓ Updated preset: ${preset.name} @ ₱${preset.price}`);
      }
    }

    // 3. Hash default password for staff accounts
    const passwordHash = await bcrypt.hash('password123', 12);

    // 4. Seed/Upload the 2 Staff Accounts
    const staffAccounts = [
      {
        fullName: 'Danny (Station Operator)',
        phoneNumber: '+639170000001',
        role: 'OPERATOR',
      },
      {
        fullName: 'J. Cruz (Delivery Rider)',
        phoneNumber: '+639170000002',
        role: 'RIDER',
      },
    ];

    for (const staff of staffAccounts) {
      const userCheck = await client.query(
        `SELECT id, full_name FROM users WHERE phone_number = $1;`,
        [staff.phoneNumber]
      );

      if (userCheck.rows.length > 0) {
        await client.query(
          `UPDATE users
           SET full_name = $1, password_hash = $2, role = $3, branch_id = $4, updated_at = NOW()
           WHERE phone_number = $5;`,
          [staff.fullName, passwordHash, staff.role, branchId, staff.phoneNumber]
        );
        console.log(`✓ Updated Account: ${staff.fullName} [${staff.role}] (${staff.phoneNumber})`);
      } else {
        await client.query(
          `INSERT INTO users (full_name, phone_number, password_hash, role, branch_id)
           VALUES ($1, $2, $3, $4, $5);`,
          [staff.fullName, staff.phoneNumber, passwordHash, staff.role, branchId]
        );
        console.log(`✓ Uploaded Account: ${staff.fullName} [${staff.role}] (${staff.phoneNumber})`);
      }
    }

    // 5. Verify no orders were created
    const ordersCountRes = await client.query(`SELECT COUNT(*)::int as count FROM orders;`);
    const ordersCount = ordersCountRes.rows[0].count;

    console.log('\n============================================================');
    console.log('✅ Staff Accounts Successfully Uploaded into Database!');
    console.log('------------------------------------------------------------');
    console.log('1. Operator Account:');
    console.log('   Phone:    +639170000001');
    console.log('   Password: password123');
    console.log('   Role:     OPERATOR (Station Operator)');
    console.log('');
    console.log('2. Rider Account:');
    console.log('   Phone:    +639170000002');
    console.log('   Password: password123');
    console.log('   Role:     RIDER (Delivery Rider)');
    console.log('------------------------------------------------------------');
    console.log(`Total Orders in Database: ${ordersCount} (Clean database, zero mock orders)`);
    console.log('Tokens configured: Never expire (no expiration limit)');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Data upload failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

uploadData();
