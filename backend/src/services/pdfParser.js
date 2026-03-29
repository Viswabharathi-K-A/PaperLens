const { PdfReader } = require('pdfreader');

async function parsePDF(filePath) {
  return new Promise((resolve, reject) => {
    let fullText = '';

    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(fullText);
      } else if (item.text) {
        fullText += item.text + ' ';
      }
    });
  });
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