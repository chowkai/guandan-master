# GitHub 配置指南

## 📋 当前状态

- ✅ 本地 Git 仓库已初始化
- ✅ 代码已提交（首次 commit）
- ⚠️ GitHub 推送需要配置认证

---

## 🔑 方案一：使用 Personal Access Token（推荐）

### 步骤 1: 生成 Token

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 填写说明（如：guandan-project）
4. 勾选权限：
   - ✅ `repo` (Full control of private repositories)
5. 点击 "Generate token"
6. **复制 Token**（只显示一次，格式如：`ghp_xxxxxxxxxxxx`）

### 步骤 2: 创建仓库

访问：https://github.com/new
- 仓库名：`guandan-master`
- 可见性：Private（推荐）或 Public
- 点击 "Create repository"

### 步骤 3: 推送代码

```bash
cd /home/zhoukai/openclaw/workspace/projects/guandan

# 关联远程仓库（替换 YOUR_TOKEN 为实际 token）
git remote add origin https://YOUR_TOKEN@github.com/32413303/guandan-master.git

# 推送
git push -u origin main
```

---

## 🔑 方案二：使用 SSH Key（长期方便）

### 步骤 1: 生成 SSH Key

```bash
ssh-keygen -t ed25519 -C "32413303@qq.com"
# 一路回车即可
```

### 步骤 2: 添加 SSH Key 到 GitHub

1. 查看公钥：`cat ~/.ssh/id_ed25519.pub`
2. 复制内容
3. 访问：https://github.com/settings/keys
4. 点击 "New SSH key"
5. 粘贴公钥，保存

### 步骤 3: 创建仓库并推送

```bash
# 创建仓库（手动在 GitHub 创建 guandan-master）

# 关联远程
git remote add origin git@github.com:32413303/guandan-master.git

# 推送
git push -u origin main
```

---

## 🤖 方案三：我帮你自动化配置

如果你把生成的 **Personal Access Token** 发给我，我可以：
1. 自动创建 GitHub 仓库
2. 自动推送代码
3. 配置好所有东西

**Token 格式**：`ghp_xxxxxxxxxxxxxxxxxxxx`

---

## 📞 推荐做法

**最快方式**：
1. 你现在去 https://github.com/settings/tokens 生成一个 Token
2. 把 Token 发给我（QQ 消息）
3. 我立即完成推送

**安全提示**：
- Token 只显示一次，请妥善保存
- 可以设置过期时间（建议 30-90 天）
- 随时可以在 GitHub 撤销 Token

---

**等你 Token 或确认哪种方案！** 🦐
