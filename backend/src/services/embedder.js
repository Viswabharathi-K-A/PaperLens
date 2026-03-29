require('dotenv').config();

async function embedBatch(texts) {
  const embeddings = [];

  for (const text of texts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: [text] }),
          signal: controller.signal
        }
      );
      clearTimeout(timeout);

      const embedding = await response.json();
      const flat = Array.isArray(embedding[0]) ? embedding[0] : embedding;
      embeddings.push(flat);

    } catch (err) {
      clearTimeout(timeout);
      console.error('Embedding error:', err.message);
      throw err;
    }
  }

  return embeddings;
}

module.exports = { embedBatch };