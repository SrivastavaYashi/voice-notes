# Voice Notes AI

> Record, transcribe, and summarize voice notes with AI.

## 🚀 Quick Start

bash
# Backend
cd backend
npm install
echo "MONGODB_URI=your_string" > .env
echo "GEMINI_API_KEY=your_key" >> .env
npm run dev

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev

🛠️ Tech Stack
Frontend: React + Vite

Backend: Node.js + Express

Database: MongoDB Atlas

AI: Google Gemini API


📱 Features
🎤 Browser voice recording

📝 Real-time transcription

🤖 AI-powered summaries

💾 Cloud storage



🔌 API
POST /api/notes - Create voice note
PUT /api/notes/:id - Edit transcript
POST /api/notes/:id/summary - Generate summary

⚙️ Environment
MONGODB_URI=your_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
