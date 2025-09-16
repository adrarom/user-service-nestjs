import { execSync } from 'child_process';
import { join } from 'path';
import { DataSource } from 'typeorm';

// Ensure test database is set up before running tests
const setupTestDB = async () => {
  // You can add any test database setup/teardown logic here
  // For example, creating test database, running migrations, etc.
};

// Run the setup
setupTestDB().catch((error) => {
  console.error('Test database setup failed:', error);
  process.exit(1);
});
