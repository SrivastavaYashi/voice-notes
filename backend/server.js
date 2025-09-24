require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const noteRoutes = require('./routes/notes');
const path = require('path');

const app = express();

// FIX CORS - Add this at the top of your server.js after imports
app.use(cors({
  origin: [
    'https://voice-notes-zeta.vercel.app', // Your Vercel frontend
    'http://localhost:5173'                 // Local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Add this for preflight requests
app.options('*', cors());

app.use(express.json());
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));

app.use('/api/notes', noteRoutes);

// Basic route to test if server works
app.get('/', (req, res) => {
  res.json({ message: "Server is running!" });
});


// connection code :
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Cloud Connected!"))
.catch(error => console.log("Connection Error:", error));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});