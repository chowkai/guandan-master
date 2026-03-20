# 掼蛋大师 - HTML5 前端客户端

## 目录结构

```
client/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式表（中国风设计）
├── js/
│   ├── game.js         # 游戏主逻辑
│   ├── animation.js    # 动画效果模块
│   └── sound.js        # 音效模块（Web Audio API）
├── sounds/
│   └── README.md       # 音效说明
└── README.md           # 本文件
```

## 快速开始

### 方法 1：直接打开

直接在浏览器中打开 `index.html` 文件即可运行。

### 方法 2：使用本地服务器（推荐）

```bash
# 使用 Python
cd /home/zhoukai/openclaw/workspace/projects/guandan/src/client
python3 -m http.server 8080

# 使用 Node.js
npx serve .

# 然后访问 http://localhost:8080
```

## 功能特性

### ✅ 已完成

1. **HTML 结构设计**
   - 响应式布局（PC/手机/平板）
   - 中国风视觉风格
   - 四个玩家区域（上、下、左、右）
   - 中央出牌显示区
   - 底部控制区

2. **CSS 样式**
   - 中国红 + 金色配色方案
   - 传统纹样装饰
   - 卡牌样式（支持 SVG）
   - 响应式适配（@media queries）
   - 动画效果（过渡、关键帧）

3. **游戏逻辑**
   - 完整的游戏状态管理
   - 牌堆创建和洗牌
   - 发牌系统
   - 玩家手牌管理
   - 出牌流程控制
   - AI 自动出牌（简化版）
   - 胜负判定

4. **动画效果**
   - 发牌动画
   - 出牌动画
   - 卡牌选择高亮
   - 胜利庆祝粒子效果
   - 淡入淡出过渡

5. **音效系统**
   - Web Audio API 实时生成
   - 出牌、胜利、不要等音效
   - 音量控制
   - 开关控制

6. **用户交互**
   - 卡牌点击选择
   - 出牌/不要按钮
   - 整理手牌
   - 提示功能
   - 设置面板
   - 帮助面板

## 技术栈

- **HTML5** - 语义化结构
- **CSS3** - Flexbox/Grid布局，动画
- **JavaScript (ES6+)** - 原生 JS，无依赖
- **Web Audio API** - 音效生成
- **SVG** - 卡牌素材

## 响应式断点

```css
/* 桌面端 */
@media (min-width: 1025px) { ... }

/* 平板 */
@media (max-width: 1024px) { ... }

/* 手机 */
@media (max-width: 768px) { ... }

/* 小手机 */
@media (max-width: 480px) { ... }
```

## 游戏操作

### 桌面端

- **选择卡牌**: 点击卡牌
- **出牌**: 选择后点击"出牌"按钮
- **不要**: 点击"不要"按钮
- **整理**: 点击"整理"按钮排序手牌
- **提示**: 点击"提示"获取建议

### 移动端

操作方式相同，针对触摸屏优化。

## 设置选项

- **AI 难度**: 简单/中等/困难
- **音效**: 开/关
- **动画**: 开/关
- **卡牌大小**: 滑动条调节

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 移动端浏览器（iOS Safari, Chrome Mobile）

## 性能优化

1. **CSS 动画优先**: 使用 CSS transitions 和 animations
2. **事件委托**: 手牌区域使用事件委托
3. **局部更新**: 只更新变化的 DOM 元素
4. **防抖节流**: 频繁操作使用防抖
5. **资源懒加载**: 卡牌图片按需加载

## 待改进功能

### 短期（Week 4 内）

- [ ] 完整的牌型验证逻辑
- [ ] 更智能的 AI 出牌
- [ ] 记牌器功能
- [ ] 出牌历史记录
- [ ] 游戏回放

### 中期

- [ ] 联机对战（WebSocket）
- [ ] 用户账户系统
- [ ] 战绩统计
- [ ] 成就系统
- [ ] 更多音效和背景音乐

### 长期

- [ ] 3D 卡牌效果
- [ ] 虚拟现实支持
- [ ] AI 训练系统
- [ ] 赛事模式

## 开发调试

### 调试模式

在浏览器控制台访问：

```javascript
// 访问游戏实例
window.guandanGame

// 访问动画管理器
window.animationManager

// 访问音效管理器
window.soundManager

// 查看游戏状态
window.guandanGame.state
```

### 测试命令

```bash
# 检查语法
npx eslint js/*.js

# 格式化代码
npx prettier --write "js/*.js" "css/*.css"
```

## 代码规范

- 使用 ES6+ 语法
- 类名使用 PascalCase
- 函数和变量使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 中文注释
- 每个类/函数都有 JSDoc 注释

## 联系

- **开发者**: 代码虾 🧑‍💻
- **项目**: 掼蛋大师 (Guandan Master)
- **版本**: v1.0 (Web 版)

---

**祝你游戏愉快！** 🃏
