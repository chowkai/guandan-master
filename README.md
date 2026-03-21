# 🃏 掼蛋大师 (Guandan Master)

> 精美的单机版掼蛋扑克游戏 - HTML5 + Python

![Version](https://img.shields.io/badge/version-v1.1-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Released-success.svg)

---

## 🎮 游戏简介

**掼蛋**是一种流行的中国扑克牌游戏，结合了升级和跑得快玩法。本游戏提供：

- ✅ 完整掼蛋规则（核弹 > 同花顺）
- ✅ 3 个难度等级的智能 AI（简单/中等/困难）
- ✅ 精美的中国风 HTML5 游戏界面
- ✅ 单机离线可玩
- ✅ 多端适配（PC/手机/平板）
- ✅ 单击选牌、多种排序、发牌动画
- ✅ 深绿色牌桌、白色卡牌边框、增强阴影
- ✅ 牌面放大 50%（手机端优化）
- ✅ 智能报牌提醒（≤6 张时提醒）

---

## 🚀 快速开始

### 方式一：Web 版（推荐）

```bash
# 克隆项目
git clone https://github.com/chowkai/guandan-master.git
cd guandan-master/src/client

# 启动本地服务器
python3 -m http.server 8080

# 访问 http://localhost:8080
```

### 方式二：命令行版

```bash
cd guandan-master
python3 src/cli.py
```

---

## 📁 项目结构

```
guandan/
├── docs/                  # 项目文档
│   ├── requirements.md    # 需求说明
│   ├── project-plan.md    # 项目计划
│   ├── ai_battle_report.md # AI 测试报告
│   └── week5-summary.md   # 项目总结
├── src/
│   ├── game/              # 游戏核心逻辑
│   │   ├── cards.py       # 卡牌类
│   │   ├── deck.py        # 牌堆类
│   │   ├── player.py      # 玩家类
│   │   ├── rules.py       # 规则判断
│   │   └── game.py        # 游戏主循环
│   ├── ai/                # AI 算法
│   │   ├── ai_base.py     # AI 基类
│   │   ├── easy_ai.py     # 简单 AI
│   │   ├── medium_ai.py   # 中等 AI
│   │   └── hard_ai.py     # 困难 AI
│   └── client/            # HTML5 前端
│       ├── index.html     # 主页面
│       ├── css/
│       │   └── style.css  # 中国风样式
│       └── js/
│           ├── game.js    # 游戏逻辑
│           ├── animation.js # 动画效果
│           └── sound.js   # 音效系统
├── assets/                # 素材资源
│   ├── images/cards/      # 54 张 SVG 卡牌
│   ├── images/ui/         # UI 元素
│   └── animations/        # 动画效果
├── tests/                 # 测试用例
│   ├── test_rules.py      # 规则测试 (26/26 通过)
│   ├── test_ai.py         # AI 测试 (18/18 通过)
│   └── test_ai_battle.py  # AI 对战测试
└── README.md
```

---

## 🎯 功能特性

### 核心功能

- 🃏 **完整牌型判断**：单张、对子、三张、三带二、顺子、连对、钢板、炸弹、核弹、同花顺、四大天王
- 🤖 **智能 AI 对手**：3 个难度等级（简单/中等/困难），AI 对战测试 100 局 100% 完成
- 🎨 **精美 UI 界面**：中国风设计（中国红 + 金色），54 张高清 SVG 卡牌
- 📱 **响应式设计**：PC/平板/手机全端适配
- 🎵 **音效系统**：8 种游戏音效（Web Audio API 实时生成）

### 游戏规则

- 4 人游戏，两两组队
- 2 副牌（108 张），每人 27 张
- 级牌可当百搭（逢人配）
- **核弹（6 张+）> 同花顺**
- 前 3 家出完一局结束
- 打 A 特殊规则（需头游且无人末游）

### 交互特性

- ✅ **单击选牌**：点击选牌，再次取消（非悬停）
- ✅ **多种排序**：按花色/按牌值/智能排序（炸弹优先）
- ✅ **出牌显示**：各玩家出牌显示在各自区域
- ✅ **发牌动画**：新游戏开始时有发牌动画
- ✅ **智能提醒**：剩余≤6 张时提醒一次

---

## 📅 开发历程

| 周次 | 任务 | 状态 | 交付物 |
|------|------|------|--------|
| Week 1 | 核心游戏逻辑 | ✅ 完成 | Python 核心代码 |
| Week 2 | AI 算法开发 | ✅ 完成 | 3 个难度 AI |
| Week 3 | UI 素材设计 | ✅ 完成 | 54 张 SVG 卡牌 |
| Week 4 | HTML5 前端 | ✅ 完成 | Web 游戏界面 |
| Week 5 | 优化测试 | ✅ 完成 | 163 测试用例 100% 通过 |

**项目总计**：
- 开发时间：~149 小时
- 代码行数：~3000 行
- 测试用例：163 个（100% 通过）
- 版本：v1.0（已发布）

---

## 🛠️ 技术栈

### 后端（Python）

```
Python 3.10+
├── 游戏逻辑：纯 Python
├── AI 算法：规则引擎 + 行为树
└── 测试：unittest
```

### 前端（HTML5）

```
HTML5 + CSS3 + JavaScript
├── 界面：原生 HTML/CSS
├── 交互：原生 JavaScript
├── 动画：CSS3 + Canvas
└── 音效：Web Audio API
```

### 素材工具

```
├── 卡牌：SVG (54 张高清)
├── UI：SVG + CSS
└── 动画：CSS3 + SVG
```

---

## 🧪 测试结果

### Python 后端

```bash
# 运行测试
python3 -m pytest tests/ -v

# 结果
test_rules.py:     26/26 ✅
test_ai.py:        18/18 ✅
test_ai_battle.py: 100/100 局 ✅
```

### Web 前端

- 功能测试：15/15 ✅
- 浏览器兼容：Chrome/Firefox/Safari/Edge ✅
- 响应式测试：PC/平板/手机 ✅

---

## 📸 游戏截图

### 游戏界面

![游戏界面](docs/screenshots/game-ui.png)

### 开始画面

![开始画面](docs/screenshots/start-screen.png)

### 手机端

![手机端](docs/screenshots/mobile-view.png)

---

## 🎮 游戏说明

### 基本操作

1. **选牌**：单击卡牌选中（上移 + 高亮），再次单击取消
2. **出牌**：选中后点击"出牌"按钮
3. **排序**：点击排序按钮切换排序方式
4. **提示**：点击"提示"按钮获取 AI 建议
5. **过牌**：点击"过"按钮跳过本轮

### 牌型大小

```
单张：大王 > 小王 > 级牌 > A > K > Q > J > 10 > 9 > ... > 2

炸弹：四大天王 > 10 张核弹 > 9 张 > ... > 6 张核弹 > 同花顺 > 5 张炸弹 > 4 张炸弹
```

### 升级规则

- 头游 + 二游 → 升 3 级
- 头游 + 三游 → 升 2 级
- 头游 + 末游 → 升 1 级
- 打 A 特殊规则：需头游且无人末游

---

## 📖 文档

- [需求说明书](docs/requirements.md)
- [项目计划](docs/project-plan.md)
- [AI 测试报告](docs/ai_battle_report.md)
- [Week 5 总结](docs/week5-summary.md)
- [Bug 报告](docs/week5-bug-report.md)
- [测试报告](docs/week5-test-report.md)

---

## 🐛 已知问题

| 问题 | 优先级 | 计划版本 |
|------|--------|---------|
| 前端牌型验证未集成 | P1 | v1.1 |
| 前端 AI 为简化版 | P1 | v1.1 |
| 缺少出牌历史记录 | P2 | v1.2 |

---

## 🚧 更新日志

### v1.1 (2026-03-20) - 用户体验优化 ✨

**视觉优化**：
- ✅ 卡牌白色边框（3px solid white）
- ✅ 深绿色牌桌背景（#1a472a）
- ✅ 增强卡牌阴影效果
- ✅ 牌面放大 50%（100px → 150px）
- ✅ 字体放大（24px → 36px）
- ✅ 手机端特殊优化（更大尺寸）

**交互优化**：
- ✅ 单击选牌（移除悬停效果）
- ✅ 选中上移 + 高亮显示
- ✅ 多种排序功能（按花色/按牌值/智能排序）
- ✅ 智能排序（炸弹优先）

**游戏流程**：
- ✅ 游戏开始画面（新游戏/设置/帮助）
- ✅ 发牌动画效果
- ✅ 各玩家出牌显示在各自区域
- ✅ 一轮结束后清理出的牌
- ✅ 最后出牌者标识

**报牌提醒**：
- ✅ 移除剩余牌数常显
- ✅ 只剩≤6 张时提醒一次

### v1.0 (2026-03-20) - 正式版

**核心功能**：
- ✅ 完整掼蛋游戏规则
- ✅ 3 个难度等级 AI
- ✅ HTML5 游戏界面
- ✅ 中国风 UI 设计
- ✅ 多端响应式适配
- ✅ 音效系统

**测试覆盖**：
- ✅ 163 个测试用例 100% 通过
- ✅ 4 个浏览器兼容测试
- ✅ 无严重 Bug

---

## 👥 项目团队

- **项目经理**：🦐 虾总管
- **主程开发**：🧑‍💻 代码虾
- **UI 设计**：🎨 画虾

---

## 📄 许可证

MIT License

---

## 🔗 相关链接

- **GitHub 仓库**：https://github.com/chowkai/guandan-master
- **在线演示**：https://chowkai.github.io/guandan-master/ (待部署)
- **问题反馈**：https://github.com/chowkai/guandan-master/issues

---

**版本**: v1.1  
**状态**: ✅ 已发布  
**最后更新**: 2026-03-20  
**下次更新**: v1.2 (待规划)
