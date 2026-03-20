require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('express-async-errors');
const db = require('./db/client');

const app = express();
app.use(cors());
app.use(express.json());

// Routes 
const documentsRouter = require('./routes/documents');
const queryRouter = require('./routes/query');
app.use('/api/documents', documentsRouter);
app.use('/api/query', queryRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});