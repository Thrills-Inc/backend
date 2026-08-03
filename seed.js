import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function runSeed() {
  // Create connection using your credentials
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true, // Required to execute multiple SQL statements at once
    ssl: { rejectUnauthorized: false } // Required for Aiven Cloud connection
  });

  try {
    console.log('Connected to Aiven MySQL database.');

    // Read SQL file
    const sqlFilePath = path.join(process.cwd(), 'database_seed.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Seeding database...');
    await connection.query(sql);
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.end();
  }
}

runSeed();