# ChatGPT Prompt Complexity Evaluator

A Chrome extension that evaluates the complexity of your ChatGPT prompts in real-time using Google Gemini AI and stores results in PostgreSQL.

## Features

- 🤖 Real-time prompt complexity evaluation using Gemini 2.5 Flash
- 🎨 Visual badge showing complexity level (Low/Medium/High)
- 💾 Automatic storage of evaluations in PostgreSQL database
- 📊 Detailed logging for debugging

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Chrome browser
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## Installation

### 1. Database Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE prompt_complexity;
\q

# Run schema
cd backend
psql -U postgres -d prompt_complexity -f schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Update server.js with your PostgreSQL credentials
# Edit lines 10-14:
# user: 'your_username',
# password: 'your_password',

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
5. Check your database for stored results

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
Check terminal where `npm start` is running for database operations

## Project Structure

```
promptclass_Extension/
├── chatgpt-complexity-evaluator-gemini/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   └── styles.css
├── backend/
│   ├── server.js
│   ├── package.json
│   └── schema.sql
└── README.md
```

## API Endpoints

### POST /api/save-complexity
Saves prompt evaluation to database

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
- Ensure Gemini API key is saved
- Check service worker console for errors
- Reload extension after code changes

### Database not saving
- Verify backend server is running on port 3000
- Check PostgreSQL is running
- Verify database credentials in `server.js`
- Check backend terminal for error logs

### API errors
- Verify Gemini API key is valid
- Check internet connection
- Ensure API key has access to gemini-2.5-flash model

## Technologies Used

- **Frontend**: Chrome Extension (Manifest V3)
- **AI**: Google Gemini 2.5 Flash API
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Libraries**: pg, cors



