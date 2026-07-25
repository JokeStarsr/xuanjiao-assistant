const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, queryAll, queryOne, run } = require('../db');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  const { username, email, password, church, bio } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: '用户名、邮箱和密码为必填项' });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度需在2-20个字符之间' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: '密码长度至少8位' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  await getDb();
  const existing = queryOne('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
  if (existing) {
    return res.status(409).json({ error: '用户名或邮箱已被注册，请直接登录' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = run(
    'INSERT INTO users (username, email, password, church, bio) VALUES (?, ?, ?, ?, ?)',
    [username, email, hashedPassword, church || '', bio || '']
  );

  const token = jwt.sign(
    { id: result.lastInsertRowid, username, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: result.lastInsertRowid,
      username,
      email,
      church: church || '',
      bio: bio || '',
      avatar: '',
      is_worker: 0
    }
  });
});

// 登录
router.post('/login', async (req, res) => {
  const { account, password, remember } = req.body;

  if (!account || !password) {
    return res.status(400).json({ error: '请输入账号和密码' });
  }

  await getDb();
  const user = queryOne(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [account, account]
  );

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const expiresIn = remember ? '30d' : '7d';
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      church: user.church,
      bio: user.bio,
      avatar: user.avatar,
      is_worker: user.is_worker
    }
  });
});

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res) => {
  await getDb();
  const user = queryOne(
    'SELECT id, username, email, church, bio, avatar, is_worker, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

// 更新用户信息
router.put('/me', authMiddleware, async (req, res) => {
  const { church, bio, avatar, is_worker } = req.body;
  await getDb();

  const updates = [];
  const params = [];

  if (church !== undefined) { updates.push('church = ?'); params.push(church); }
  if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
  if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
  if (is_worker !== undefined) { updates.push('is_worker = ?'); params.push(is_worker ? 1 : 0); }

  if (updates.length > 0) {
    params.push(req.user.id);
    run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const user = queryOne(
    'SELECT id, username, email, church, bio, avatar, is_worker, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json(user);
});

module.exports = router;