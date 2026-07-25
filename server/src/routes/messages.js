const express = require('express');
const { getDb, queryAll, queryOne, run } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取收件箱
router.get('/inbox', authMiddleware, async (req, res) => {
  await getDb();
  const messages = queryAll(`
    SELECT m.*, u.username as from_username, u.avatar as from_avatar
    FROM messages m
    JOIN users u ON m.from_user_id = u.id
    WHERE m.to_user_id = ?
    ORDER BY m.created_at DESC
  `, [req.user.id]);
  res.json(messages);
});

// 获取发件箱
router.get('/sent', authMiddleware, async (req, res) => {
  await getDb();
  const messages = queryAll(`
    SELECT m.*, u.username as to_username, u.avatar as to_avatar
    FROM messages m
    JOIN users u ON m.to_user_id = u.id
    WHERE m.from_user_id = ?
    ORDER BY m.created_at DESC
  `, [req.user.id]);
  res.json(messages);
});

// 获取未读消息数
router.get('/unread-count', authMiddleware, async (req, res) => {
  await getDb();
  const row = queryOne(
    'SELECT COUNT(*) as count FROM messages WHERE to_user_id = ? AND is_read = 0',
    [req.user.id]
  );
  res.json({ count: row ? row.count : 0 });
});

// 获取与某用户的对话
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  await getDb();
  const messages = queryAll(`
    SELECT m.*, u1.username as from_username, u2.username as to_username
    FROM messages m
    JOIN users u1 ON m.from_user_id = u1.id
    JOIN users u2 ON m.to_user_id = u2.id
    WHERE (m.from_user_id = ? AND m.to_user_id = ?)
       OR (m.from_user_id = ? AND m.to_user_id = ?)
    ORDER BY m.created_at ASC
  `, [req.user.id, req.params.userId, req.params.userId, req.user.id]);

  // 标记为已读
  run(
    'UPDATE messages SET is_read = 1 WHERE to_user_id = ? AND from_user_id = ? AND is_read = 0',
    [req.user.id, req.params.userId]
  );

  res.json(messages);
});

// 发送私信
router.post('/', authMiddleware, async (req, res) => {
  const { toUserId, content } = req.body;
  if (!toUserId || !content) {
    return res.status(400).json({ error: '接收者和内容为必填项' });
  }
  if (toUserId === req.user.id) {
    return res.status(400).json({ error: '不能给自己发私信' });
  }

  await getDb();
  const toUser = queryOne('SELECT id FROM users WHERE id = ?', [toUserId]);
  if (!toUser) {
    return res.status(404).json({ error: '接收者不存在' });
  }

  const result = run(
    'INSERT INTO messages (from_user_id, to_user_id, content) VALUES (?, ?, ?)',
    [req.user.id, toUserId, content]
  );

  const message = queryOne(
    'SELECT m.*, u.username as from_username FROM messages m JOIN users u ON m.from_user_id = u.id WHERE m.id = ?',
    [result.lastInsertRowid]
  );

  res.status(201).json(message);
});

// 发送邮件联系（模拟）
router.post('/email', authMiddleware, async (req, res) => {
  const { toUserId, subject, content } = req.body;
  if (!toUserId || !subject || !content) {
    return res.status(400).json({ error: '接收者、主题和内容为必填项' });
  }

  await getDb();
  const toUser = queryOne('SELECT email, username FROM users WHERE id = ?', [toUserId]);
  if (!toUser) {
    return res.status(404).json({ error: '接收者不存在' });
  }

  res.json({ message: `邮件已发送至 ${toUser.username}` });
});

module.exports = router;