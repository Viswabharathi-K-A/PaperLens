const { Worker } = require('bullmq');
const { parsePDF, chunkText } = require('../services/pdfParser');
const { embedBatch } = require('../services/embedder');
const db = require('../db/client');
require('dotenv').config();

new Worker('document-indexing', async (job) => {
  const { documentId, filePath } = job.data;
  console.log(`Processing document: ${documentId}`);

  // Step 1 - Update status to indexing
  await db.query("UPDATE documents SET status='indexing' WHERE id=$1", [documentId]);

  // Step 2 - Parse PDF
  console.log('Parsing PDF...');
  const text = await parsePDF(filePath);

  // Step 3 - Chunk text
  const chunks = chunkText(text);
  console.log(`Created ${chunks.length} chunks`);

  // Step 4 - Embed in batches of 20
  for (let i = 0; i < chunks.length; i += 20) {
    const batch = chunks.slice(i, i + 20);
    const embeddings = await embedBatch(batch.map(c => c.content));

    // Step 5 - Insert chunks into DB
    for (let j = 0; j < batch.length; j++) {
      await db.query(
        `INSERT INTO chunks (document_id, content, embedding, chunk_index)
         VALUES ($1, $2, $3, $4)`,
        [documentId, batch[j].content, JSON.stringify(embeddings[j]), batch[j].chunkIndex]
      );
    }
    console.log(`Inserted chunks ${i} to ${i + batch.length}`);
  }

  // Step 6 - Update status to ready
  await db.query("UPDATE documents SET status='ready' WHERE id=$1", [documentId]);
  console.log(`Document ${documentId} indexed successfully!`);

}, { connection: { url: process.env.REDIS_URL } });

console.log('Worker is running and waiting for jobs...');