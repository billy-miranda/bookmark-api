const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All link routes require auth
router.use(authMiddleware);

// GET /links — list user's links, optional ?tag= & q= (search title)
router.get('/', (req, res) => {
  const { tag, q } = req.query;
  let sql = 'SELECT id, url, title, tags, created_at FROM links WHERE user_id = ?';
  const params = [req.user.id];

  if (tag) {
    sql += " AND (',' || tags || ',') LIKE ?";
    params.push('%,' + tag + ',%');
  }
  if (q) {
    sql += ' AND (title LIKE ? OR url LIKE ?)';
    const like = '%' + q + '%';
    params.push(like, like);
  }
  sql += ' ORDER BY created_at DESC';

  const links = db.prepare(sql).all(...params);
  const parsed = links.map((row) => ({
    ...row,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  }));
  res.json(parsed);
});

// GET /links/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT id, url, title, tags, created_at FROM links WHERE id = ? AND user_id = ?').get(
    req.params.id,
    req.user.id
  );
  if (!row) return res.status(404).json({ error: 'Link not found' });
  res.json({
    ...row,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  });
});

// POST /links
router.post('/', (req, res) => {
  const { url, title, tags } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  const tagStr = Array.isArray(tags) ? tags.join(',') : typeof tags === 'string' ? tags : '';
  const result = db
    .prepare('INSERT INTO links (user_id, url, title, tags) VALUES (?, ?, ?, ?)')
    .run(req.user.id, url, title || null, tagStr);
  const row = db.prepare('SELECT id, url, title, tags, created_at FROM links WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({
    ...row,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  });
});

// PUT /links/:id
router.put('/:id', (req, res) => {
  const { url, title, tags } = req.body;
  const existing = db.prepare('SELECT id FROM links WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Link not found' });
  const tagStr = tags !== undefined
    ? (Array.isArray(tags) ? tags.join(',') : typeof tags === 'string' ? tags : '')
    : null;
  db.prepare(
    'UPDATE links SET url = COALESCE(?, url), title = COALESCE(?, title), tags = COALESCE(?, tags) WHERE id = ?'
  ).run(url ?? null, title ?? null, tagStr, req.params.id);
  const row = db.prepare('SELECT id, url, title, tags, created_at FROM links WHERE id = ?').get(req.params.id);
  res.json({
    ...row,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
  });
});

// DELETE /links/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM links WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Link not found' });
  res.status(204).send();
});

module.exports = router;
