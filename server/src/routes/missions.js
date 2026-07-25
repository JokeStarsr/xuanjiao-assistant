const express = require('express');
const { getDb, queryAll, queryOne, run } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取所有宣教地列表（用于地图标记）
router.get('/', async (req, res) => {
  await getDb();
  const { search } = req.query;
  let missions;
  if (search) {
    missions = queryAll(
      'SELECT * FROM missions WHERE name LIKE ? OR country LIKE ? OR region LIKE ?',
      [`%${search}%`, `%${search}%`, `%${search}%`]
    );
  } else {
    missions = queryAll('SELECT * FROM missions ORDER BY country, name');
  }
  res.json(missions);
});

// 获取单个宣教地详情
router.get('/:id', async (req, res) => {
  await getDb();
  const mission = queryOne('SELECT * FROM missions WHERE id = ?', [req.params.id]);
  if (!mission) {
    return res.status(404).json({ error: '宣教地不存在' });
  }
  try {
    mission.embassy_info = JSON.parse(mission.embassy_info || '{}');
  } catch (e) {
    mission.embassy_info = {};
  }
  res.json(mission);
});

// 获取宣教地的经历见证
router.get('/:id/testimonies', async (req, res) => {
  await getDb();
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const testimonies = queryAll(`
    SELECT t.*, u.username, u.avatar
    FROM testimonies t
    JOIN users u ON t.user_id = u.id
    WHERE t.mission_id = ?
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `, [req.params.id, parseInt(limit), offset]);

  const totalRow = queryOne(
    'SELECT COUNT(*) as count FROM testimonies WHERE mission_id = ?',
    [req.params.id]
  );

  res.json({ testimonies, total: totalRow ? totalRow.count : 0, page: parseInt(page), limit: parseInt(limit) });
});

// 添加经历见证
router.post('/:id/testimonies', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容为必填项' });
  }

  await getDb();
  const mission = queryOne('SELECT id FROM missions WHERE id = ?', [req.params.id]);
  if (!mission) {
    return res.status(404).json({ error: '宣教地不存在' });
  }

  const result = run(
    'INSERT INTO testimonies (mission_id, user_id, title, content) VALUES (?, ?, ?, ?)',
    [req.params.id, req.user.id, title, content]
  );

  const testimony = queryOne(
    'SELECT t.*, u.username FROM testimonies t JOIN users u ON t.user_id = u.id WHERE t.id = ?',
    [result.lastInsertRowid]
  );

  res.status(201).json(testimony);
});

// 更新经历见证
router.put('/:id/testimonies/:testimonyId', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  await getDb();
  const testimony = queryOne('SELECT * FROM testimonies WHERE id = ?', [req.params.testimonyId]);
  if (!testimony) {
    return res.status(404).json({ error: '记录不存在' });
  }
  if (testimony.user_id !== req.user.id) {
    return res.status(403).json({ error: '只能编辑自己的内容' });
  }

  run(
    "UPDATE testimonies SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?",
    [title || testimony.title, content || testimony.content, req.params.testimonyId]
  );

  res.json({ message: '更新成功' });
});

// 删除经历见证
router.delete('/:id/testimonies/:testimonyId', authMiddleware, async (req, res) => {
  await getDb();
  const testimony = queryOne('SELECT * FROM testimonies WHERE id = ?', [req.params.testimonyId]);
  if (!testimony) {
    return res.status(404).json({ error: '记录不存在' });
  }
  if (testimony.user_id !== req.user.id) {
    return res.status(403).json({ error: '只能删除自己的内容' });
  }

  run('DELETE FROM testimonies WHERE id = ?', [req.params.testimonyId]);
  res.json({ message: '删除成功' });
});

// 获取宣教地的注意事项
router.get('/:id/tips', async (req, res) => {
  await getDb();
  const tips = queryAll(`
    SELECT t.*, u.username
    FROM tips t
    JOIN users u ON t.user_id = u.id
    WHERE t.mission_id = ?
    ORDER BY t.created_at DESC
  `, [req.params.id]);
  res.json(tips);
});

// 添加注意事项
router.post('/:id/tips', authMiddleware, async (req, res) => {
  const { category, content } = req.body;
  if (!category || !content) {
    return res.status(400).json({ error: '分类和内容为必填项' });
  }

  await getDb();
  const result = run(
    'INSERT INTO tips (mission_id, user_id, category, content) VALUES (?, ?, ?, ?)',
    [req.params.id, req.user.id, category, content]
  );

  const tip = queryOne(
    'SELECT t.*, u.username FROM tips t JOIN users u ON t.user_id = u.id WHERE t.id = ?',
    [result.lastInsertRowid]
  );

  res.status(201).json(tip);
});

// 删除注意事项
router.delete('/:id/tips/:tipId', authMiddleware, async (req, res) => {
  await getDb();
  const tip = queryOne('SELECT * FROM tips WHERE id = ?', [req.params.tipId]);
  if (!tip) {
    return res.status(404).json({ error: '记录不存在' });
  }
  if (tip.user_id !== req.user.id) {
    return res.status(403).json({ error: '只能删除自己的内容' });
  }

  run('DELETE FROM tips WHERE id = ?', [req.params.tipId]);
  res.json({ message: '删除成功' });
});

// 获取宣教地同工列表
router.get('/:id/workers', async (req, res) => {
  await getDb();
  const workers = queryAll(
    'SELECT id, username, church, bio, avatar FROM users WHERE is_worker = 1'
  );
  res.json(workers);
});

module.exports = router;