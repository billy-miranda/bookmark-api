require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/links', linksRoutes);

app.get('/', (req, res) => {
  res.json({
    service: 'bookmarks-api',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      links: 'GET|POST /links (auth required)',
      linkById: 'GET|PUT|DELETE /links/:id (auth required)',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bookmarks-api' });
});

module.exports = app;
