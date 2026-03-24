/**
 * WebRTC 信令服务器
 * 处理 WebSocket 连接，转发 SDP 和 ICE 候选
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS) || 100;
const HEARTBEAT_INTERVAL = parseInt(process.env.HEARTBEAT_INTERVAL) || 30000;

// 日志工具
const logger = {
  info: (msg) => log('INFO', msg),
  warn: (msg) => log('WARN', msg),
  error: (msg) => log('ERROR', msg),
  debug: (msg) => log('DEBUG', msg)
};

function log(level, msg) {
  const levels = ['error', 'warn', 'info', 'debug'];
  if (levels.indexOf(level.toLowerCase()) <= levels.indexOf(LOG_LEVEL)) {
    console.log(`[${new Date().toISOString()}] [${level}] ${msg}`);
  }
}

// Express 应用
const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: clients.size,
    uptime: process.uptime()
  });
});

// 状态端点
app.get('/status', (req, res) => {
  res.json({
    version: '1.0.0',
    connections: clients.size,
    maxConnections: MAX_CONNECTIONS,
    environment: process.env.NODE_ENV || 'development'
  });
});

// 创建 HTTP 服务器
const server = http.createServer(app);

// WebSocket 服务器
const wss = new WebSocket.Server({ server, path: '/ws' });

// 客户端管理
const clients = new Map(); // clientId -> { ws, roomId, lastHeartbeat }
const rooms = new Map(); // roomId -> Set<clientId>

// 生成客户端 ID
function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 心跳检查
const heartbeatInterval = setInterval(() => {
  const now = Date.now();
  clients.forEach((client, id) => {
    if (now - client.lastHeartbeat > HEARTBEAT_INTERVAL * 2) {
      logger.warn(`Client ${id} timeout, disconnecting`);
      client.ws.terminate();
    } else {
      client.ws.ping();
    }
  });
}, HEARTBEAT_INTERVAL);

wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  
  // 检查连接数限制
  if (clients.size >= MAX_CONNECTIONS) {
    ws.close(1013, 'Server too busy');
    return;
  }

  logger.info(`Client connected: ${clientId} (total: ${clients.size + 1})`);

  // 注册客户端
  clients.set(clientId, {
    ws,
    roomId: null,
    lastHeartbeat: Date.now()
  });

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    timestamp: new Date().toISOString()
  }));

  // 处理消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(clientId, message);
    } catch (err) {
      logger.error(`Invalid message from ${clientId}: ${err.message}`);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  // 处理心跳
  ws.on('pong', () => {
    const client = clients.get(clientId);
    if (client) {
      client.lastHeartbeat = Date.now();
    }
  });

  // 处理断开
  ws.on('close', () => {
    handleDisconnect(clientId);
  });

  // 处理错误
  ws.on('error', (err) => {
    logger.error(`WebSocket error for ${clientId}: ${err.message}`);
    handleDisconnect(clientId);
  });
});

// 处理消息
function handleMessage(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  const { type, payload } = message;

  switch (type) {
    case 'heartbeat':
      client.lastHeartbeat = Date.now();
      ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
      break;

    case 'join':
      handleJoin(clientId, payload);
      break;

    case 'leave':
      handleLeave(clientId, payload);
      break;

    case 'offer':
    case 'answer':
    case 'ice-candidate':
      handleSignaling(clientId, message);
      break;

    default:
      logger.warn(`Unknown message type: ${type}`);
  }
}

// 加入房间
function handleJoin(clientId, { roomId }) {
  const client = clients.get(clientId);
  if (!client) return;

  // 离开旧房间
  if (client.roomId) {
    handleLeave(clientId, { roomId: client.roomId });
  }

  // 加入新房间
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(clientId);
  client.roomId = roomId;

  logger.info(`Client ${clientId} joined room ${roomId}`);

  // 通知房间内其他客户端
  broadcastToRoom(roomId, {
    type: 'user-joined',
    payload: { clientId, roomId }
  }, clientId);

  // 返回房间成员列表
  const members = Array.from(rooms.get(roomId));
  client.ws.send(JSON.stringify({
    type: 'join-success',
    payload: { roomId, members }
  }));
}

// 离开房间
function handleLeave(clientId, { roomId }) {
  const client = clients.get(clientId);
  if (!client || !rooms.has(roomId)) return;

  rooms.get(roomId).delete(clientId);
  client.roomId = null;

  logger.info(`Client ${clientId} left room ${roomId}`);

  // 通知房间内其他客户端
  broadcastToRoom(roomId, {
    type: 'user-left',
    payload: { clientId, roomId }
  });

  // 清理空房间
  if (rooms.get(roomId).size === 0) {
    rooms.delete(roomId);
  }
}

// 信令消息转发
function handleSignaling(clientId, message) {
  const client = clients.get(clientId);
  if (!client || !client.roomId) return;

  const { type, payload } = message;
  const { targetId } = payload;

  if (!targetId) {
    // 广播给房间内所有人
    broadcastToRoom(client.roomId, {
      type,
      payload: { ...payload, from: clientId }
    }, clientId);
  } else {
    // 发送给特定目标
    const target = clients.get(targetId);
    if (target && target.roomId === client.roomId) {
      target.ws.send(JSON.stringify({
        type,
        payload: { ...payload, from: clientId }
      }));
    }
  }
}

// 处理断开
function handleDisconnect(clientId) {
  const client = clients.get(clientId);
  if (!client) return;

  logger.info(`Client disconnected: ${clientId}`);

  // 离开房间
  if (client.roomId) {
    handleLeave(clientId, { roomId: client.roomId });
  }

  // 清理客户端
  clients.delete(clientId);
}

// 广播到房间
function broadcastToRoom(roomId, message, excludeId = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  const data = JSON.stringify(message);
  room.forEach(clientId => {
    if (clientId !== excludeId) {
      const client = clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  });
}

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  clearInterval(heartbeatInterval);
  
  clients.forEach((client) => {
    client.ws.close(1001, 'Server shutting down');
  });
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// 启动服务器
server.listen(PORT, () => {
  logger.info(`Signaling server started on port ${PORT}`);
  logger.info(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, wss };
