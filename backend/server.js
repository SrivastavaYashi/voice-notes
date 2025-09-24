// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const noteRoutes = require('./routes/notes');
// const path = require('path');

// const app = express();

// // FIX CORS - Add this at the top of your server.js after imports
// app.use(cors({
//   origin: [
//     'https://voice-notes-zeta.vercel.app', // Your Vercel frontend
//     'http://localhost:5173'                 // Local development
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
//   credentials: true
// }));

// // Add this for preflight requests
// app.options('*', cors());

// app.use(express.json());
// app.use('/uploads',express.static(path.join(__dirname, 'uploads')));

// app.use('/api/notes', noteRoutes);

// // Basic route to test if server works
// app.get('/', (req, res) => {
//   res.json({ message: "Server is running!" });
// });


// // connection code :
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("MongoDB Cloud Connected!"))
// .catch(error => console.log("Connection Error:", error));



// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const noteRoutes = require('./routes/notes');
const path = require('path');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://voice-notes-zeta.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/notes', noteRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Voice Notes API is running!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Test API route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is healthy!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
})
.catch((error) => {
  console.log('❌ MongoDB Connection Error:', error.message);
});

// Error handling for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist.`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/notes',
      'POST /api/notes',
      'GET /api/notes/:id',
      'PUT /api/notes/:id',
      'DELETE /api/notes/:id',
      'POST /api/notes/:id/summary'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local URL: http://localhost:${PORT}`);
  console.log(`🌐 Render URL: https://voice-notes-backend-5682.onrender.com`);
});