# 服务器搭建指南

本文档描述如何在腾讯云服务器上部署信令服务器。

## 前置条件

- 腾讯云服务器（Ubuntu 20.04+）
- 已配置 SSH 访问
- 域名（可选，用于 HTTPS）

## 1. 服务器环境确认

### 1.1 SSH 连接测试

```bash
# 使用密钥连接（推荐）
ssh -i /path/to/your-key.pem ubuntu@<服务器公网 IP>

# 或使用密码连接
ssh ubuntu@<服务器公网 IP>
```

### 1.2 Ubuntu 版本确认

```bash
# 查看系统版本
lsb_release -a

# 或
cat /etc/os-release

# 建议版本：Ubuntu 20.04 LTS 或 22.04 LTS
```

### 1.3 网络连通性测试

```bash
# 测试外网连通性
ping -c 4 www.baidu.com

# 测试 DNS 解析
nslookup www.baidu.com

# 测试端口连通性
curl -I https://www.baidu.com
```

### 1.4 防火墙规则确认

```bash
# 查看防火墙状态
sudo ufw status

# 如需开放端口（示例）
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # 信令服务器

# 启用防火墙
sudo ufw enable
```

### 腾讯云安全组配置

在腾讯云控制台配置安全组规则：

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入「云服务器」→「安全组」
3. 添加入站规则：
   - TCP 22 (SSH)
   - TCP 80 (HTTP)
   - TCP 443 (HTTPS)
   - TCP 3000 (信令服务器)

## 2. Node.js 环境安装

### 2.1 安装 Node.js (v18+ LTS)

```bash
# 方法一：使用 NodeSource（推荐）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 方法二：使用 NVM（适合多版本管理）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18
```

### 2.2 验证安装

```bash
# 查看 Node.js 版本
node --version  # 应显示 v18.x.x

# 查看 npm 版本
npm --version   # 应显示 8.x.x 或更高
```

### 2.3 安装 PM2

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 验证安装
pm2 --version

# 配置开机自启
pm2 startup
# 按提示执行生成的命令
pm2 save
```

### 2.4 环境变量配置

```bash
# 编辑环境变量文件
sudo nano /etc/environment

# 添加以下内容（如需要）
NODE_ENV=production
```

## 3. 信令服务器部署

### 3.1 上传代码

```bash
# 在服务器上创建目录
mkdir -p ~/signaling-server
cd ~/signaling-server

# 方式一：使用 Git
git clone <你的代码仓库> .

# 方式二：使用 SCP 从本地上传
# 在本地执行：
scp -r signaling-server/* ubuntu@<服务器 IP>:~/signaling-server/
```

### 3.2 安装依赖

```bash
cd ~/signaling-server
npm install --production
```

### 3.3 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
nano .env
```

推荐生产环境配置：

```bash
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
ALLOWED_ORIGINS=https://yourdomain.com
MAX_CONNECTIONS=100
HEARTBEAT_INTERVAL=30000
```

### 3.4 使用 PM2 启动

```bash
# 启动服务
pm2 start ecosystem.config.js --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs signaling-server

# 实时监控
pm2 monit
```

### 3.5 常用 PM2 命令

```bash
# 重启服务
pm2 restart signaling-server

# 停止服务
pm2 stop signaling-server

# 删除服务
pm2 delete signaling-server

# 查看详细信息
pm2 show signaling-server

# 保存当前进程列表（开机自启）
pm2 save

# 查看启动脚本配置
pm2 startup
```

### 3.6 日志管理

```bash
# 日志文件位置
~/signaling-server/logs/

# 查看实时日志
pm2 logs signaling-server --lines 100

# 清空日志
pm2 flush signaling-server
```

## 4. 验证部署

### 4.1 健康检查

```bash
# 本地测试
curl http://localhost:3000/health

# 远程测试
curl http://<服务器 IP>:3000/health
```

预期响应：

```json
{
  "status": "ok",
  "timestamp": "2026-03-23T10:00:00.000Z",
  "connections": 0,
  "uptime": 123.456
}
```

### 4.2 状态检查

```bash
curl http://<服务器 IP>:3000/status
```

### 4.3 WebSocket 测试

使用 WebSocket 客户端工具（如 wscat）测试：

```bash
# 安装 wscat
npm install -g wscat

# 连接测试
wscat -c ws://<服务器 IP>:3000/ws
```

## 5. 故障排查

### 5.1 服务无法启动

```bash
# 查看 PM2 日志
pm2 logs signaling-server --err

# 检查端口占用
sudo netstat -tulpn | grep 3000

# 检查 Node.js 版本
node --version
```

### 5.2 无法远程访问

```bash
# 检查防火墙
sudo ufw status

# 检查安全组（腾讯云控制台）
# 确认 3000 端口已开放

# 测试本地监听
netstat -tulpn | grep 3000
```

### 5.3 内存不足

```bash
# 查看内存使用
free -h

# 查看 PM2 进程内存
pm2 monit

# 调整 PM2 内存限制（ecosystem.config.js）
# max_memory_restart: '500M'
```

## 6. 性能优化

### 6.1 系统优化

```bash
# 增加文件描述符限制
ulimit -n 65535

# 永久生效
echo "ulimit -n 65535" >> ~/.bashrc
```

### 6.2 Node.js 优化

```bash
# 设置最大内存（根据服务器配置）
export NODE_OPTIONS="--max-old-space-size=512"
```

## 7. 备份与恢复

### 7.1 备份

```bash
# 备份代码
tar -czf signaling-server-backup-$(date +%Y%m%d).tar.gz ~/signaling-server

# 备份 PM2 配置
pm2 save
```

### 7.2 恢复

```bash
# 解压备份
tar -xzf signaling-server-backup-YYYYMMDD.tar.gz

# 恢复 PM2 配置
pm2 resurrect
```

## 8. 监控与告警

### 8.1 PM2 内置监控

```bash
# 实时监控
pm2 monit

# 生成监控数据
pm2 dump
```

### 8.2 系统监控

```bash
# 安装 htop
sudo apt install htop

# 查看系统资源
htop
```

### 8.3 日志轮转

PM2 默认配置已包含日志轮转，如需自定义：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    // ...
    max_size: '10M',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
```

## 9. 安全建议

1. **使用 HTTPS**：参考 `https-setup.md`
2. **限制 CORS**：在 `.env` 中配置 `ALLOWED_ORIGINS`
3. **定期更新**：`npm update` 和 `apt upgrade`
4. **监控日志**：定期检查异常访问
5. **备份配置**：定期备份 `.env` 和 PM2 配置

## 附录：完整部署脚本

```bash
#!/bin/bash
# deploy.sh - 一键部署脚本

set -e

echo "=== 信令服务器部署脚本 ==="

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 创建目录
mkdir -p ~/signaling-server
cd ~/signaling-server

# 安装依赖
npm install --production

# 配置环境
cp .env.example .env

# 启动服务
pm2 start ecosystem.config.js --env production
pm2 save

echo "=== 部署完成 ==="
echo "健康检查：curl http://localhost:3000/health"
echo "查看日志：pm2 logs signaling-server"
```

---

**文档版本**: 1.0  
**最后更新**: 2026-03-23  
**维护者**: dev-agent
