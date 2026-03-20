# 🃏 掼蛋大师 (Guandan Master)

> 精美的单机版掼蛋扑克游戏

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow.svg)

---

## 🎮 游戏简介

**掼蛋**是一种流行的中国扑克牌游戏，结合了升级和跑得快玩法。本游戏提供：

- ✅ 完整掼蛋规则
- ✅ 3 个难度等级的智能 AI
- ✅ 精美的 HTML5 游戏界面
- ✅ 单机离线可玩
- ✅ 多端适配（PC/手机/平板）

---

## 🚀 快速开始

### 环境要求

- Python 3.10+
- 现代浏览器（Chrome/Firefox/Safari）

### 安装运行

```bash
# 克隆项目
cd /home/zhoukai/openclaw/workspace/projects/guandan

# 安装依赖
pip install -r requirements.txt

# 启动游戏（命令行版）
python src/game/main.py

# 启动 Web 版
python src/server/app.py
# 访问 http://localhost:8000
```

---

## 📁 项目结构

```
guandan/
├── docs/              # 项目文档
├── src/               # 源代码
│   ├── game/          # 游戏核心逻辑
│   ├── ai/            # AI 算法
│   ├── server/        # 后端服务
│   └── client/        # 前端界面
├── assets/            # 素材资源
├── tests/             # 测试用例
└── README.md
```

---

## 🎯 功能特性

### 核心功能

- 🃏 完整牌型判断（单张、对子、顺子、炸弹、核弹等）
- 🤖 智能 AI 对手（简单/中等/困难）
- 🎨 精美卡牌素材
- 📱 响应式设计

### 游戏规则

- 4 人游戏，两两组队
- 2 副牌（108 张），每人 27 张
- 级牌可当百搭（逢人配）
- 炸弹/核弹/同花顺特殊规则

---

## 📅 开发计划

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 核心游戏逻辑 | 🔴 未开始 |
| Phase 2 | AI 算法开发 | ⚪ 等待中 |
| Phase 3 | UI 素材设计 | ⚪ 等待中 |
| Phase 4 | HTML5 前端 | ⚪ 等待中 |
| Phase 5 | 优化测试 | ⚪ 等待中 |

---

## 🛠️ 技术栈

- **后端**: Python 3.10+
- **前端**: HTML5 + CSS3 + JavaScript
- **AI**: 规则引擎 + 策略算法
- **素材**: SVG/PNG

---

## 📝 文档

- [需求说明书](docs/requirements.md)
- [项目计划](docs/project-plan.md)
- [技术规格](docs/tech-spec.md)

---

## 👥 项目团队

- **项目经理**: 🦐 虾总管
- **主程开发**: 🧑‍💻 代码虾
- **UI 设计**: 🎨 画虾

---

## 📄 许可证

MIT License

---

**状态**: 开发中  
**版本**: v0.1.0  
**最后更新**: 2026-03-20
