# HTTPS 配置指南

本文档描述如何使用 Let's Encrypt 为信令服务器配置 HTTPS 加密。

## 为什么需要 HTTPS？

1. **数据安全**: 加密传输，防止中间人攻击
2. **用户信任**: 浏览器显示安全锁标志
3. **WebSocket 安全**: WSS (WebSocket Secure) 需要 HTTPS
4. **SEO 优化**: 搜索引擎优先收录 HTTPS 网站
5. **合规要求**: 部分场景强制要求 HTTPS

## 方案选择

### 推荐方案：Let's Encrypt + Certbot + Nginx

- ✅ 免费证书（90 天有效期，自动续期）
- ✅ 广泛支持
- ✅ 自动化程度高
- ✅ 社区活跃

### 备选方案

- **腾讯云 SSL 证书**: 免费 1 年，需手动续期
- **商业证书**: 付费，有效期长，适合企业

## 前置条件

- ✅ 已备案的域名（如需要）
- ✅ 域名 DNS 解析到服务器
- ✅ 服务器 80/443 端口开放
- ✅ Nginx 已安装

## 1. 安装 Nginx

```bash
# 更新软件源
sudo apt update

# 安装 Nginx
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 验证安装
nginx -v
systemctl status nginx
```

### 配置 Nginx 基础

```bash
# 编辑默认配置
sudo nano /etc/nginx/sites-available/default
```

基础配置示例：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

测试配置：

```bash
# 测试配置语法
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

## 2. 安装 Certbot

```bash
# 安装 Certbot 和 Nginx 插件
sudo apt install -y certbot python3-certbot-nginx

# 验证安装
certbot --version
```

## 3. 申请 SSL 证书

### 方式一：自动配置（推荐）

```bash
# 自动申请并配置 HTTPS
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

按提示操作：

1. 输入邮箱地址（用于续期通知）
2. 同意服务条款
3. 选择是否重定向 HTTP → HTTPS（建议选 2）

### 方式二：仅申请证书

```bash
# 仅申请证书，手动配置
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

证书文件位置：

```
/etc/letsencrypt/live/yourdomain.com/fullchain.pem
/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

## 4. 配置 HTTPS

### 完整 Nginx 配置示例

```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # ACME challenge 用于证书续期
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 强制跳转到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 日志
    access_log /var/log/nginx/yourdomain_access.log;
    error_log /var/log/nginx/yourdomain_error.log;

    # 反向代理到信令服务器
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket 专用配置
    location /ws {
        proxy_pass http://localhost:3000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket 长连接
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 静态资源（如有）
    location /static {
        alias /var/www/yourdomain/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

## 5. 配置自动续期

Let's Encrypt 证书有效期 90 天，需自动续期。

### 测试自动续期

```bash
# 干运行测试（不实际续期）
sudo certbot renew --dry-run
```

### 查看续期任务

Certbot 会自动添加 systemd timer 或 cron 任务：

```bash
# 查看 systemd timer
systemctl list-timers | grep certbot

# 或查看 cron 任务
sudo cat /etc/cron.d/certbot
```

### 手动续期

```bash
# 手动续期所有证书
sudo certbot renew

# 续期后重载 Nginx
sudo systemctl reload nginx
```

### 续期钩子（可选）

创建续期后自动重载 Nginx 的钩子：

```bash
sudo nano /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
```

```bash
#!/bin/bash
systemctl reload nginx
```

```bash
# 添加执行权限
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
```

## 6. 验证 HTTPS

### 浏览器访问

```
https://yourdomain.com
https://yourdomain.com/health
wss://yourdomain.com/ws
```

### 命令行测试

```bash
# 测试 HTTPS
curl -I https://yourdomain.com

# 测试健康检查
curl https://yourdomain.com/health

# 查看证书信息
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### 在线工具

- [SSL Labs](https://www.ssllabs.com/ssltest/): 详细的 SSL 安全测试
- [Why No Padlock](https://www.whynopadlock.com/): 检查混合内容问题

## 7. WebSocket Secure (WSS)

### 前端连接示例

```javascript
// 使用 WSS 连接
const ws = new WebSocket('wss://yourdomain.com/ws');

ws.onopen = () => {
  console.log('Connected securely via WSS');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

### Nginx WSS 配置要点

确保 Nginx 配置中包含：

```nginx
# WebSocket 升级头
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";

# 足够的超时时间
proxy_read_timeout 86400s;
proxy_send_timeout 86400s;
```

## 8. 故障排查

### 证书问题

```bash
# 查看证书状态
sudo certbot certificates

# 查看证书详细信息
sudo cat /etc/letsencrypt/live/yourdomain.com/cert.pem | openssl x509 -noout -dates
```

### Nginx 问题

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

### 防火墙问题

```bash
# 检查端口
sudo netstat -tulpn | grep -E ':(80|443)'

# 检查 UFW
sudo ufw status

# 开放端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 腾讯云安全组

确认安全组规则已开放：
- TCP 80 (HTTP)
- TCP 443 (HTTPS)

## 9. 腾讯云 SSL 证书（备选）

如使用腾讯云免费 SSL 证书：

### 申请证书

1. 登录 [腾讯云 SSL 证书控制台](https://console.cloud.tencent.com/ssl)
2. 点击「申请免费证书」
3. 填写域名信息
4. 完成域名验证（DNS 或文件验证）
5. 下载证书文件

### 配置证书

```bash
# 创建证书目录
sudo mkdir -p /etc/nginx/ssl

# 上传证书文件
# 将下载的证书上传到 /etc/nginx/ssl/
```

修改 Nginx 配置：

```nginx
ssl_certificate /etc/nginx/ssl/yourdomain_bundle.crt;
ssl_certificate_key /etc/nginx/ssl/yourdomain.key;
```

## 10. 安全加固建议

### 1. 禁用旧协议

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
```

### 2. HSTS 头

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 3. 定期更新

```bash
# 更新系统和软件
sudo apt update && sudo apt upgrade -y

# 更新 Certbot
sudo apt install --only-upgrade certbot python3-certbot-nginx
```

### 4. 监控证书过期

```bash
# 创建监控脚本
sudo nano /usr/local/bin/check-ssl-expiry.sh
```

```bash
#!/bin/bash
DOMAIN="yourdomain.com"
EXPIRY=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -enddate)
echo "Certificate for $DOMAIN expires: $EXPIRY"
```

### 5. 备份配置

```bash
# 备份 Nginx 配置
sudo tar -czf nginx-backup-$(date +%Y%m%d).tar.gz /etc/nginx

# 备份证书
sudo tar -czf ssl-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt
```

## 附录：完整部署脚本

```bash
#!/bin/bash
# https-setup.sh - 一键 HTTPS 配置脚本

set -e

DOMAIN="yourdomain.com"
EMAIL="your@email.com"

echo "=== HTTPS 配置脚本 ==="

# 安装 Nginx
sudo apt update
sudo apt install -y nginx python3-certbot-nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 申请证书
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# 重载 Nginx
sudo systemctl reload nginx

echo "=== HTTPS 配置完成 ==="
echo "访问：https://$DOMAIN"
echo "证书自动续期已配置"
```

---

**文档版本**: 1.0  
**最后更新**: 2026-03-23  
**维护者**: dev-agent
