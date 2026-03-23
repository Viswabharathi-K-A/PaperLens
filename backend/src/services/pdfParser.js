const pdfParse = require('pdf-parse');
const fs = require('fs');

async function parsePDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;

  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push({
      content: chunk,
      chunkIndex: chunks.length
    });
    i += chunkSize - overlap;
  }

  return chunks;
}

module.exports = { parsePDF, chunkText };