const express = require('express');
const Note = require('../models/Note');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const {generateSummary } = require('../utils/aiHelpers');

const router = express.Router();


// Configure multer for audio files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads folder if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Save with timestamp + original name
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check if file is audio
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST create new note with REAL transcript from browser
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const { title, transcript } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    const note = new Note({
      title: title || 'Untitled Note',
      audioPath: req.file.path,
      transcript: transcript, // Use real transcript from browser
      summary: '' // Will be generated later
    });

    await note.save();
    
    console.log(`✅ Note saved with real transcript: ${note._id}`);
    res.status(201).json(note);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update note (edit transcript)
router.put('/:id', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    // Add this check to see what's happening:
    console.log('Received transcript:', transcript);
    console.log('Note ID:', req.params.id);

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.transcript = transcript;
    note.isEdited = true;
    note.summary = '';
    note.updatedAt = Date.now();

    await note.save();
    
    // Send JSON response, not HTML
    res.json({ 
      message: 'Note updated successfully',
      note: note 
    });
    
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Delete the audio file from server
    if (note.audioPath && fs.existsSync(note.audioPath)) {
      fs.unlinkSync(note.audioPath);
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST generate summary with Gemini AI (same as before)
router.post('/:id/summary', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.transcript) {
      return res.status(400).json({ message: 'Transcript not available' });
    }

    const summary = await generateSummary(note.transcript);
    
    note.summary = summary;
    await note.save();

    res.json({ 
      summary: summary,
      message: 'Summary generated using Google Gemini AI'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;