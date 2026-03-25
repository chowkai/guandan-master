# Git 远程仓库配置检查清单

**创建日期**: 2026-03-25  
**问题根因**: workspace 根目录 Git 仓库未配置 remote，导致所有提交都在本地  
**改进措施**: 建立定期检查机制

---

## ⚠️ 问题回顾

2026-03-25 发现：
- workspace 根目录有 Git 仓库（20+ 提交）
- 但 `.git/config` 中没有 `[remote]` 配置
- 所有代码都在本地，未推送到 GitHub
- 一旦机器故障，所有代码丢失

---

## ✅ 检查清单

### 新项目初始化时

- [ ] `git init` 初始化仓库
- [ ] `git remote add origin <URL>` 配置远程仓库
- [ ] `git remote -v` 验证配置
- [ ] 创建 `.gitignore`
- [ ] 首次提交并推送

### 每日 Heartbeat 检查

- [ ] `git remote -v` 确认 remote 配置存在
- [ ] `git status` 检查未提交文件
- [ ] `git log --oneline -3` 确认最新提交
- [ ] 如有未推送提交，执行 `git push`

### 任务完成时

- [ ] 所有代码已 `git add` + `git commit`
- [ ] 已 `git push` 到远程
- [ ] 在任务文档中记录提交 hash

---

## 🔧 自动化检查脚本

```bash
#!/bin/bash
# scripts/check-git-remote.sh

echo "=== Git 远程仓库检查 ==="

# 检查 remote 配置
if ! git remote -v | grep -q origin; then
    echo "❌ 错误：未配置远程仓库！"
    echo "请执行：git remote add origin <URL>"
    exit 1
fi

echo "✅ 远程仓库配置正常"
git remote -v

# 检查未提交文件
uncommitted=$(git status --porcelain | wc -l)
if [ "$uncommitted" -gt 0 ]; then
    echo "⚠️  警告：有 $uncommitted 个未提交文件"
    git status --short
else
    echo "✅ 无未提交文件"
fi

# 检查未推送提交
ahead=$(git status | grep "Your branch is ahead" | wc -l)
if [ "$ahead" -gt 0 ]; then
    echo "⚠️  警告：有未推送的提交"
    echo "请执行：git push"
    git status
else
    echo "✅ 所有提交已推送"
fi
```

---

## 📋 恢复步骤（如再次发生）

1. **检查 remote 配置**
   ```bash
   git remote -v
   ```

2. **添加 remote（如缺失）**
   ```bash
   git remote add origin <URL>
   ```

3. **推送所有提交**
   ```bash
   git push -u origin master
   ```

4. **验证 GitHub 仓库**
   - 访问 GitHub 确认提交已同步
   - 检查提交数量和最新提交

---

## 📊 责任分工

| 角色 | 职责 |
|------|------|
| PM (main) | 每日 Heartbeat 检查 remote 配置 |
| 开发 | 任务完成后立即提交 + 推送 |
| 测试 | 验收前确认代码已推送 |

---

**维护人**: main (PM)  
**下次审查**: 2026-04-01
