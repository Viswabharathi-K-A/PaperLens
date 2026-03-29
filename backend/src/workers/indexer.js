const { Worker } = require('bullmq');
const { parsePDF, chunkText } = require('../services/pdfParser');
const { embedBatch } = require('../services/embedder');
const db = require('../db/client');
require('dotenv').config();

new Worker('document-indexing', async (job) => {
  const { documentId, filePath } = job.data;
  console.log(`Processing document: ${documentId}`);

  await db.query("UPDATE documents SET status='indexing' WHERE id=$1", [documentId]);

  console.log('Parsing PDF...');
  const rawText = await parsePDF(filePath);
  const text = rawText.replace(/\0/g, '');

  const chunks = chunkText(text);
  console.log(`Created ${chunks.length} chunks`);

  for (let i = 0; i < chunks.length; i += 20) {
    const batch = chunks.slice(i, i + 20);
    const embeddings = await embedBatch(batch.map(c => c.content));

    for (let j = 0; j < batch.length; j++) {
      const cleanContent = batch[j].content.replace(/\0/g, '');
      await db.query(
        `INSERT INTO chunks (document_id, content, embedding, chunk_index)
         VALUES ($1, $2, $3::vector, $4)`,
        [documentId, cleanContent, JSON.stringify(embeddings[j]), batch[j].chunkIndex]
      );
    }
    console.log(`Embedded and inserted chunks ${i} to ${i + batch.length}`);
  }

  await db.query("UPDATE documents SET status='ready' WHERE id=$1", [documentId]);
  console.log(`Document ${documentId} indexed successfully!`);

}, { 
  connection: { url: process.env.REDIS_URL },
  concurrency: 1
});

console.log('Worker is running and waiting for jobs...');