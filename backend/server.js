const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🚀 Server starting...");
console.log("📊 Database pool initialized (will connect on first query)...");

app.post("/api/save-complexity", async (req, res) => {
  console.log("\n📥 Received request to /api/save-complexity");
  console.log("Request body:", req.body);

  const { prompt, complexity, reason, timestamp } = req.body;

  console.log("📝 Extracted data:");
  console.log("  - Prompt:", prompt?.substring(0, 50) + "...");
  console.log("  - Complexity:", complexity);
  console.log("  - Reason:", reason);
  console.log("  - Timestamp:", timestamp);

  try {
    console.log("💾 Attempting to connect to database...");
    const startConnect = Date.now();
    const client = await pool.connect();
    const connectTime = Date.now() - startConnect;
    console.log(`✅ Connected in ${connectTime}ms`);
    
    try {
      console.log("💾 Executing INSERT query...");
      const startQuery = Date.now();
      const result = await client.query(
        "INSERT INTO prompt_evaluations (prompt, complexity, reason, timestamp) VALUES ($1, $2, $3, $4) RETURNING *",
        [prompt, complexity, reason, timestamp]
      );
      const queryTime = Date.now() - startQuery;
      console.log(`✅ Query executed in ${queryTime}ms`);
      console.log("Inserted record ID:", result.rows[0].id);
      res.json({ success: true, data: result.rows[0] });
    } finally {
      console.log("🔓 Releasing client back to pool");
      client.release();
    }
  } catch (error) {
    console.error("\n❌ Database operation failed:");
    console.error("  Error name:", error.name);
    console.error("  Error message:", error.message);
    console.error("  Error code:", error.code);
    if (error.stack) {
      console.error("  Stack trace:", error.stack.split("\n").slice(0, 3).join("\n"));
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("\n✅ Server running on port 3000");
  console.log("🔗 API endpoint: http://localhost:3000/api/save-complexity");
  console.log("⏳ Waiting for requests...\n");
});
