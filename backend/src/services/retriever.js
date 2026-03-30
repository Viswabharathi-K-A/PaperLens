const db = require('../db/client');
const { embedBatch } = require('./embedder');

async function retrieveChunks(question, documentId, topK = 5) {
  // Step 1 - Embed the question
  const questionEmbeddings = await embedBatch([question]);
  const questionVector = questionEmbeddings[0];

  // Step 2 - Vector similarity search
  const vectorResults = await db.query(
    `SELECT id, content, chunk_index,
      1 - (embedding <=> $1::vector) AS score
     FROM chunks
     WHERE document_id = $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [JSON.stringify(questionVector), documentId, topK]
  );

  return vectorResults.rows;
}

module.exports = { retrieveChunks };