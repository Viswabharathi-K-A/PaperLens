const express = require('express');
const multer = require('multer');
const { Queue } = require('bullmq');
const db = require('../db/client');
require('dotenv').config();

const router = express.Router();

// Queue setup
const indexQueue = new Queue('document-indexing', {
  connection: { url: process.env.REDIS_URL }
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // Save to DB
  const result = await db.query(
    "INSERT INTO documents (filename, status) VALUES ($1, 'pending') RETURNING *",
    [req.file.originalname]
  );
  const doc = result.rows[0];

  // Add to queue
  await indexQueue.add('index', {
    documentId: doc.id,
    filePath: req.file.path
  });

  res.json({ id: doc.id, status: 'pending', message: 'File uploaded, indexing started' });
});

// GET /api/documents
router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
  res.json({ documents: result.rows });
});

module.exports = router;