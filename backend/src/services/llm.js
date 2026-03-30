require('dotenv').config();
const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateAnswer(question, chunks) {
  // Format chunks as context with source numbers
  const context = chunks.map((c, i) =>
    `[Source ${i + 1}]\n${c.content}`
  ).join('\n\n---\n\n');

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 1024,
    messages: [
      {
        role: 'system',
        content: `You are a helpful research assistant. 
Answer questions using ONLY the provided sources. 
Always cite sources inline using [Source N] notation.
If the answer is not in the sources, say "I could not find this in the document."`
      },
      {
        role: 'user',
        content: `Sources:\n${context}\n\nQuestion: ${question}`
      }
    ]
  });

  return response.choices[0].message.content;
}

module.exports = { generateAnswer };