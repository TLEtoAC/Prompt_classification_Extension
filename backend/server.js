const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'prompt_complexity',
  password: 'Sagar@123',
  port: 5432,
});

console.log('🚀 Server starting...');
console.log('📊 Database config:', {
  user: 'postgres',
  host: 'localhost',
  database: 'prompt_complexity',
  port: 5432
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

app.post('/api/save-complexity', async (req, res) => {
  console.log('\n📥 Received request to /api/save-complexity');
  console.log('Request body:', req.body);
  
  const { prompt, complexity, reason, timestamp } = req.body;
  
  console.log('📝 Extracted data:');
  console.log('  - Prompt:', prompt?.substring(0, 50) + '...');
  console.log('  - Complexity:', complexity);
  console.log('  - Reason:', reason);
  console.log('  - Timestamp:', timestamp);
  
  try {
    console.log('💾 Attempting to insert into database...');
    const result = await pool.query(
      'INSERT INTO prompt_evaluations (prompt, complexity, reason, timestamp) VALUES ($1, $2, $3, $4) RETURNING *',
      [prompt, complexity, reason, timestamp]
    );
    console.log('✅ Database insert successful');
    console.log('Inserted record:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('\n✅ Server running on port 3000');
  console.log('🔗 API endpoint: http://localhost:3000/api/save-complexity');
  console.log('⏳ Waiting for requests...\n');
});
