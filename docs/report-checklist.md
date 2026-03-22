# 汇报检查清单 - Report Checklist

**创建日期**: 2026-03-22  
**目的**: 防止虚假汇报、确保交付物可验证

---

## 📋 汇报前必须执行的检查

### 1. 时间检查

```bash
# 检查当前时间
date "+%Y-%m-%d %H:%M:%S"
```

**验证**:
- [ ] 是否在截止时间前 30 分钟开始准备？
- [ ] 是否准时汇报（误差不超过 5 分钟）？

---

### 2. 交付物验证

```bash
# 检查文件是否存在
ls -la docs/design/competitive-analysis.md
ls -la docs/design/prototype.md
ls -la docs/design/ui-design.md
```

**验证**:
- [ ] 汇报"完成"的任务，对应文件必须存在
- [ ] 文件大小 > 0（不是空文件）
- [ ] 文件修改时间是最近的

---

### 3. Git 提交验证

```bash
# 检查最近提交
git log --since="2 hours ago" --oneline
git status
```

**验证**:
- [ ] 交付物是否已 Git 提交？
- [ ] 提交信息是否清晰？
- [ ] 工作目录是否干净（无未提交变更）？

---

### 4. 记忆文件同步

```bash
# 检查记忆文件
ls -la memory/projects/guandan/progress.md
git status memory/
```

**验证**:
- [ ] 记忆文件是否已更新？
- [ ] 进展百分比是否准确？
- [ ] 风险问题是否如实记录？

---

## 🚫 禁止行为

### 禁止 1: 无交付物汇报完成

```
❌ 错误：
"竞品分析 ✅ 已完成"
(但没有文件)

✅ 正确：
"竞品分析 ✅ 已完成
交付物：docs/design/competitive-analysis.md
Git: 7012774"
```

---

### 禁止 2: 夸大进度

```
❌ 错误：
"Phase 2 进展 60%"
(实际只有 10%)

✅ 正确：
"Phase 2 进展 10%
- 竞品分析：初稿完成 (20%)
- 原型设计：未开始 (0%)
..."
```

---

### 禁止 3: 模糊描述

```
❌ 错误：
"进展顺利"
"一切正常"

✅ 正确：
"竞品分析：完成 3 个产品分析
原型设计：进行中 (70%)
技术选型：未开始"
```

---

## 📝 汇报模板

### 每日站会模板

```markdown
## 📊 今日完成

| 任务 | 状态 | 完成度 | 交付物 |
|------|------|--------|--------|
| 竞品分析 | ✅ | 100% | [链接] |
| 原型设计 | 🟡 | 70% | [链接] |

## 📅 明日计划

| 任务 | 负责人 | 预计完成 |
|------|--------|----------|
| 原型设计 | UI 设计师 | 12:00 |

## 🚨 风险与问题

| 问题 | 状态 | 措施 |
|------|------|------|
| 无 | - | - |
```

---

## 🔧 自动化脚本

### 汇报前检查脚本

```bash
#!/bin/bash
# scripts/check-report.sh

echo "=== 汇报前检查 ==="

# 1. 检查时间
echo "当前时间：$(date "+%H:%M")"

# 2. 检查交付物
echo "=== 交付物检查 ==="
for file in docs/design/*.md; do
  if [ -f "$file" ]; then
    echo "✅ $file ($(wc -c < $file) bytes)"
  else
    echo "❌ $file 不存在"
  fi
done

# 3. 检查 Git
echo "=== Git 状态 ==="
git log --since="2 hours ago" --oneline
git status --short

# 4. 检查记忆文件
echo "=== 记忆文件 ==="
ls -la memory/projects/guandan/progress.md
```

---

**执行**: 每次汇报前必须运行此检查  
**记录**: 检查结果附在汇报中

---

**创建时间**: 2026-03-22 20:35  
**负责人**: PM (AI)
