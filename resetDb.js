const { Client } = require('pg');

async function resetDatabase() {
  // Connect to 'postgres' database to perform operations
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Somethinglmao',
    port: 5432,
  });

  try {
    await client.connect();
    
    // Terminate existing connections to the forum database
    await client.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = 'forum'
      AND pid <> pg_backend_pid()
    `);
    
    // Drop and recreate the database
    await client.query('DROP DATABASE IF EXISTS forum');
    await client.query('CREATE DATABASE forum');
    
    console.log('Database reset successful!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDatabase(); 