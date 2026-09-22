import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const DEV_USERS = [
  { name: 'Jordan Vance', email: 'jordan@studio.test', role: 'Operations Manager', title: 'Operations Manager', password: 'pass' },
  { name: 'Elena Rossi', email: 'elena@studio.test', role: 'Account Manager', title: 'Editorial Lead', password: 'pass' },
  { name: 'Marcus Thorne', email: 'marcus@studio.test', role: 'Account Manager', title: 'Performance Marketing', password: 'pass' },
  { name: 'Sam Producer', email: 'sam@studio.test', role: 'Production', title: 'Video Editor', password: 'pass' },
  { name: 'Avery Blake', email: 'avery@studio.test', role: 'Director', title: 'Director', password: 'pass' },
];

try {
  for (const user of DEV_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, title)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, title = EXCLUDED.title`,
      [user.name, user.email, passwordHash, user.role, user.title]
    );
  }
  console.log(`Seeded ${DEV_USERS.length} development users.`);
} catch (error) {
  console.error('User seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
