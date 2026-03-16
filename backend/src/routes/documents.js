const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Save uploaded files to /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ 
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: req.file.path
  });
});

// GET /api/documents
router.get('/', async (req, res) => {
  res.json({ documents: [] }); // we'll connect DB later
});

module.exports = router;