import React, { useState, useEffect } from 'react';
import { getNotes, createNote, updateNote, deleteNote, generateSummary } from './services/api';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  // Load notes from backend
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await getNotes();
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported. Please use Chrome.');
      return;
    }

    setIsRecording(true);
    setTranscript('');
    setTitle('');

    const speechRecognition = new window.webkitSpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US';

    speechRecognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        
        // Auto-generate title from first few words
        if (!title && finalTranscript.trim()) {
          const words = finalTranscript.trim().split(' ');
          const generatedTitle = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
          setTitle(generatedTitle);
        }
      }
    };

    speechRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    speechRecognition.onend = () => {
      setIsRecording(false);
    };

    speechRecognition.start();
    setRecognition(speechRecognition);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  const saveNote = async () => {
    if (!title.trim()) {
      alert('Please add a title for your note');
      return;
    }

    if (!transcript.trim()) {
      alert('Please record some audio first');
      return;
    }

    try {
      // Create a mock audio file (since we're using browser transcription)
      const audioBlob = new Blob([], { type: 'audio/webm' });
      
      // Prepare form data as your backend expects
      const formData = new FormData();
      formData.append('title', title);
      formData.append('transcript', transcript); // Send real transcript from browser
      formData.append('audio', audioBlob, 'voice-recording.webm');

      // Create note in backend
      const response = await createNote(formData);
      
      // Reset form and refresh notes
      setTitle('');
      setTranscript('');
      fetchNotes();
      
      alert('Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note. Please check if backend is running.');
    }
  };

  const handleEdit = async (noteId, newTranscript) => {
    try {
      // Update note transcript - this will trigger isEdited=true and clear summary
      await updateNote(noteId, { transcript: newTranscript });
      fetchNotes(); // Refresh to get updated state
      alert('Note updated! Summary button is now enabled.');
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Error updating note');
    }
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
        fetchNotes();
        alert('Note deleted!');
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note');
      }
    }
  };

  const handleGenerateSummary = async (noteId) => {
    try {
      // Call your Gemini AI summary endpoint
      await generateSummary(noteId);
      fetchNotes(); // Refresh to get the generated summary
      alert('AI Summary generated!');
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Error generating summary. Please try again.');
    }
  };

  return (
    <div className="app">
      <div className="white-container">
        <h1>Voice Notes</h1>
        
        <button 
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {/* Current Recording Section */}
        {(isRecording || transcript) && (
          <div className="current-recording">
            <input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
            />
            
            {transcript && (
              <div className="transcript-preview">
                <p>{transcript}</p>
              </div>
            )}
            
            <button onClick={saveNote} className="save-button">
              Save Note
            </button>
          </div>
        )}

        {/* Saved Notes List */}
        <div className="notes-list">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onGenerateSummary={handleGenerateSummary}
            />
          ))}
        </div>

        {notes.length === 0 && !isRecording && (
          <div className="empty-state">
            <p>No notes yet. Click "Start Recording" to create your first voice note!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Note Card Component
const NoteCard = ({ note, onEdit, onDelete, onGenerateSummary }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.transcript);

  const handleSave = () => {
    if (editText.trim() && editText !== note.transcript) {
      onEdit(note._id, editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(note.transcript);
    setIsEditing(false);
  };

  // Check if Generate Summary button should be enabled
  const isSummaryButtonEnabled = !note.summary || note.isEdited;

  return (
    <div className="note-container">
      <h3>{note.title}</h3>
      
      {isEditing ? (
        <div className="edit-section">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows="3"
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <p>{note.transcript}</p>
      )}
      
      <div className="button-row">
        <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
        <button onClick={() => onDelete(note._id)} className="delete-btn">Delete</button>
        <button 
          onClick={() => onGenerateSummary(note._id)}
          disabled={!isSummaryButtonEnabled}
          className={`summary-btn ${!isSummaryButtonEnabled ? 'disabled' : ''}`}
        >
          Generate Summary
        </button>
      </div>

      {note.summary && (
        <div className="summary">
          <strong>AI Summary:</strong> {note.summary}
        </div>
      )}

      <div className="note-meta">
        <small>Created: {new Date(note.createdAt).toLocaleDateString()}</small>
        {note.updatedAt !== note.createdAt && (
          <small> • Updated: {new Date(note.updatedAt).toLocaleDateString()}</small>
        )}
      </div>
    </div>
  );
};

export default App;
