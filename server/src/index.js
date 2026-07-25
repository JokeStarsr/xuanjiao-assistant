const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const missionsRoutes = require('./routes/missions');
const translateRoutes = require('./routes/translate');
const messagesRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'build')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/messages', messagesRoutes);

// 前端 SPA 路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});