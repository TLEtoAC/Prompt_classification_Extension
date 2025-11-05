# ChatGPT Prompt Complexity Evaluator

A Chrome extension that evaluates the complexity of your ChatGPT prompts in real-time using Google Gemini AI and stores results in Supabase PostgreSQL.

## Features

- 🤖 Real-time prompt complexity evaluation using Gemini 2.5 Flash
- 🎨 Visual badge showing complexity level (Low/Medium/High)
- 💾 Automatic storage of evaluations in Supabase PostgreSQL database
- 📊 Detailed logging for debugging

## Prerequisites

- Node.js (v14 or higher)
- Chrome browser
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Supabase account ([Sign up here](https://supabase.com))

## Installation

### 1. Supabase Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the following schema:

```sql
CREATE TABLE prompt_evaluations (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  complexity VARCHAR(10) NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complexity ON prompt_evaluations(complexity);
CREATE INDEX idx_timestamp ON prompt_evaluations(timestamp);
```

4. Get your database credentials from **Project Settings → Database**:
   - Host
   - Database name
   - User
   - Password
   - Port

### 2. Backend Setup

```bash
cd backend
npm install
```

Update `backend/db.js` with your Supabase credentials:

```javascript
const pool = new Pool({
  user: "postgres",
  host: "db.YOUR_PROJECT_REF.supabase.co",
  database: "postgres",
  password: "YOUR_PASSWORD",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});
```

Start the backend server:

```bash
npm start
```

Server will run on `http://localhost:3000`

### 3. Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `chatgpt-complexity-evaluator-gemini` folder
5. Click the extension icon and enter your Gemini API key

## Usage

1. Go to [ChatGPT](https://chat.openai.com)
2. Type a prompt in the input box
3. Press Enter to send
4. See the complexity badge appear in the bottom-right corner
5. Check your Supabase database for stored results

## Database Schema

```sql
CREATE TABLE prompt_evaluations (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  complexity VARCHAR(10) NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Complexity Levels

- **Low**: Simple questions or basic requests
- **Medium**: Moderate reasoning or structured tasks
- **High**: Complex multi-step reasoning or technical design

## Debugging

### Extension Logs
1. Go to `chrome://extensions/`
2. Click "service worker" under the extension
3. Check console for `[BACKGROUND]`, `[API]`, and `[DB]` logs

### Backend Logs
Check terminal where `npm start` is running for:
- Database connection status
- Incoming API requests
- Query execution times
- Error details

## Project Structure

```
promptclass_Extension/
├── chatgpt-complexity-evaluator-gemini/
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Background service worker
│   ├── content.js             # Content script for ChatGPT
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup logic
│   └── styles.css             # Badge styling
├── backend/
│   ├── server.js              # Express API server
│   ├── db.js                  # Database connection
│   ├── package.json           # Node dependencies
│   └── schema.sql             # Database schema
└── README.md
```

## API Endpoints

### POST /api/save-complexity
Saves prompt evaluation to Supabase database

**Request Body:**
```json
{
  "prompt": "string",
  "complexity": "Low|Medium|High",
  "reason": "string",
  "timestamp": "ISO 8601 string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "prompt": "...",
    "complexity": "Low",
    "reason": "...",
    "timestamp": "..."
  }
}
```

## Troubleshooting

### Extension not working
- Ensure Gemini API key is saved in extension popup
- Check service worker console for errors
- Reload extension after code changes
- Verify API key has access to gemini-2.5-flash model

### Database not saving
- Verify backend server is running on port 3000
- Check Supabase database is accessible
- Verify credentials in `db.js` are correct
- Check backend terminal for connection errors
- Ensure table `prompt_evaluations` exists

### Connection timeout errors
- Check firewall/antivirus settings
- Verify Supabase project is active
- Try using Supabase connection pooler (port 6543)
- Check network connectivity

### API errors
- Verify Gemini API key is valid
- Check internet connection
- Ensure API key has proper permissions
- Check browser console for detailed error messages

## Technologies Used

- **Frontend**: Chrome Extension (Manifest V3)
- **AI**: Google Gemini 2.5 Flash API
- **Backend**: Node.js, Express
- **Database**: Supabase PostgreSQL
- **Libraries**: pg, cors

## Environment Variables (Optional)

Create `.env` file in backend folder:

```env
DB_USER=postgres
DB_HOST=db.YOUR_PROJECT_REF.supabase.co
DB_NAME=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_PORT=5432
PORT=3000
```

## License

MIT

## Author

Your Name
