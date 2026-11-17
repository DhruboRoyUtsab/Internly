import pg from 'pg';
import bcrypt from 'bcrypt';

const { Client } = pg;

const email = process.env.ADMIN_EMAIL?.toLowerCase();
const fullName = process.env.ADMIN_FULL_NAME ?? 'Platform Admin';
const password = process.env.ADMIN_PASSWORD;

// No fallback credentials: the admin password must come from .env only
if (!email || !password) {
  console.error(
    'Missing ADMIN_EMAIL / ADMIN_PASSWORD in .env — refusing to seed an admin without explicit credentials',
  );
  process.exit(1);
}

const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'internly',
});

await client.connect();

const passwordHash = await bcrypt.hash(password, 12);

const result = await client.query(
  `INSERT INTO users (email, full_name, password_hash, role, email_verified, created_at, updated_at)
   VALUES ($1, $2, $3, 'ADMIN', true, NOW(), NOW())
   ON CONFLICT (email) DO NOTHING`,
  [email, fullName, passwordHash],
);

if (result.rowCount === 0) {
  console.log(`admin already exists: ${email}`);
} else {
  console.log(`admin created: ${email}`);
}

await client.end();
