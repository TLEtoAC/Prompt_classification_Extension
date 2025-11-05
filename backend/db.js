const { Pool } = require("pg");

console.log('\n🔧 Database Configuration:');
console.log('  User: postgres');
console.log('  Host: db.elsjbpgtfjabfkkfnusi.supabase.co');
console.log('  Database: postgres');
console.log('  Port: 5432');
console.log('  SSL: enabled (rejectUnauthorized: false)');

const pool = new Pool({
  user: "postgres",
  host: "db.elsjbpgtfjabfkkfnusi.supabase.co",
  database: "postgres",
  password: "sagarisgrea",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('✅ Pool: New client connected');
});

pool.on('acquire', () => {
  console.log('🔓 Pool: Client acquired from pool');
});

pool.on('remove', () => {
  console.log('🗑️  Pool: Client removed from pool');
});

pool.on('error', (err) => {
  console.error('❌ Pool error:', err.message);
});

console.log('📊 Connection pool initialized\n');

module.exports = pool;
