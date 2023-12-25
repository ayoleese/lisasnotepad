const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');
const notesData = require('./db/db.json');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// navigates to notes.html
app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, 'public/notes.html')));
// GET all notes to page
app.get('/api/notes', (req, res) => res.json(notesData));

// post notes
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            id: uuid(),
            title,
            text,
        };

        // Push the new notes into the existing array
        notesData.push(newNote);

        // Write the updated array to the JSON file
        fs.writeFile('./db/db.json', JSON.stringify(notesData), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error writing to JSON file' });
            }

            console.log('Note has been written to JSON file');

            // Send the updated array as a response
            res.json(notesData);
        });
    } else {
        res.status(500).json({ error: 'Error in posting note' });
    }
});

//delete notes
app.delete('/api/notes/:id', (req, res) => {
    const noteIdToDelete = req.params.id;
  
    const deletedNoteIndex = notesData.findIndex((note) => note.id === noteIdToDelete);
  
    if (deletedNoteIndex !== -1) {
      notesData.splice(deletedNoteIndex, 1);
      res.json({ message: 'Note deleted successfully', notes: notesData });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  });

app.listen(PORT, () =>
  console.log(`Server listening at http://localhost:${PORT}`)
);
