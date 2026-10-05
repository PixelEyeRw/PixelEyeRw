import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const DEV_USERS = [
  { name: 'Jordan Vance', email: 'jordan@studio.test', role: 'Operations Manager', title: 'Operations Manager', capacityMax: 24, password: 'pass' },
  { name: 'Elena Rossi', email: 'elena@studio.test', role: 'Account Manager', title: 'Editorial Lead', capacityMax: 22, password: 'pass' },
  { name: 'Marcus Thorne', email: 'marcus@studio.test', role: 'Account Manager', title: 'Performance Marketing', capacityMax: 28, password: 'pass' },
  { name: 'Sam Producer', email: 'sam@studio.test', role: 'Production', title: 'Video Editor', capacityMax: 20, password: 'pass' },
  { name: 'Avery Blake', email: 'avery@studio.test', role: 'Director', title: 'Director', capacityMax: 24, password: 'pass' },
];

try {
  for (const user of DEV_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, title, capacity_max)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, title = EXCLUDED.title, capacity_max = EXCLUDED.capacity_max`,
      [user.name, user.email, passwordHash, user.role, user.title, user.capacityMax]
    );
  }
  console.log(`Seeded ${DEV_USERS.length} development users.`);
} catch (error) {
  console.error('User seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
