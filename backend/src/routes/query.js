const express = require('express');
const { retrieveChunks } = require('../services/retriever');
const router = express.Router();

router.post('/', async (req, res) => {
  const { question, documentId } = req.body;

  if (!question) return res.status(400).json({ error: 'Question is required' });
  if (!documentId) return res.status(400).json({ error: 'documentId is required' });

  console.log(`Query: "${question}" on document: ${documentId}`);

  const chunks = await retrieveChunks(question, documentId);

  res.json({
    question,
    chunks: chunks.map(c => ({
      content: c.content,
      score: c.score,
      chunkIndex: c.chunk_index
    }))
  });
});

module.exports = router;