Voice Notes Project

A simple full-stack project to create and manage voice notes. It includes frontend (React) and backend (Node.js + Express) with REST APIs and GenAI APIs for transcription + summarization with browser recording feature.

Setup Instructions
  Clone the repository
    git clone https://github.com/YOUR_USERNAME/voice-notes.git
    cd voice-notes-app

 Backend setup
   Go to backend folder:  cd backend
   Install dependencies:  npm install
   
Create .env file and add environment variables:
MONGODB_URI=your connection string
GEMINI_API_KEY=your api key
PORT=5000

Start the backend server:npm run dev



Frontend setup

Go to frontend folder:

cd ../frontend


Install dependencies:

npm install


Start the React app:

npm run dev




 Using the App

Open your browser at http://localhost:PORT

You can record,add title,edit,delete,generate summary

All notes are stored and fetched via the backend server APIs.



🛠️ Tech Stack
Frontend	   React, Vite, Axios
Backend	     Node.js, Express, Multer
Database	   MongoDB Atlas
AI	Google   Gemini API
Speech	     Web Speech API





💡 How It Works
Record voice in browser → Auto-transcribe using Web Speech API

Save to MongoDB with audio file storage

Edit transcripts or generate AI summaries with Gemini

Manage notes with full CRUD operations



API Overview
POST    /api/notes              # Create voice note
PUT     /api/notes/:id          # Edit transcript  
DELETE  /api/notes/:id          # Delete note
POST    /api/notes/:id/summary  # AI summary
