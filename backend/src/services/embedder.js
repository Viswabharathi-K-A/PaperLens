const { pipeline } = require('@xenova/transformers');

let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    console.log('Loading embedding model...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded!');
  }
  return embedder;
}

async function embedBatch(texts) {
  const embed = await getEmbedder();
  const embeddings = [];

  for (const text of texts) {
    const output = await embed(text, { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
  }

  return embeddings;
}

module.exports = { embedBatch };