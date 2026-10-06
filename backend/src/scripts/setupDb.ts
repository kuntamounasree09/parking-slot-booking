import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

async function setupDatabase() {
  console.log('🔄 Initializing PostgreSQL database tables from schema.sql...');

  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ schema.sql not found at ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ Database schema applied successfully! All tables created.');
  } catch (error: any) {
    console.error('❌ Error executing schema:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
