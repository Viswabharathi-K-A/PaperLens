const express = require('express');
const router = express.Router();

// POST /api/query
router.post('/', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  // Placeholder — we'll wire RAG logic here later
  res.json({ answer: `You asked: ${question}` });
});

module.exports = router;