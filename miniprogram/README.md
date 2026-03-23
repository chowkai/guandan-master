# 掼蛋微信小程序

经典的掼蛋扑克游戏微信小程序版本。

## 技术栈

- **框架**: 微信小程序原生
- **语言**: TypeScript
- **UI**: 微信小程序原生组件 + 自定义组件

## 项目结构

```
guandan-miniprogram/
├── app.ts                 # 小程序入口
├── app.json               # 小程序配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── tsconfig.json          # TypeScript 配置
├── pages/                 # 页面
│   ├── index/             # 主页面
│   └── game/              # 游戏页面
├── components/            # 自定义组件
│   ├── card/              # 卡牌组件
│   ├── player/            # 玩家组件
│   ├── button/            # 按钮组件
│   ├── hand-area/         # 手牌区组件
│   └── play-area/         # 出牌区组件
├── utils/                 # 工具函数
├── styles/                # 全局样式
├── typings/               # 类型定义
└── assets/                # 静态资源
```

## 快速开始

### 1. 环境准备

- 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 使用微信扫码登录

### 2. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `guandan-miniprogram` 目录
4. 填写 AppID (测试可选"测试号")
5. 点击"导入"

### 3. 运行

- 点击"编译"按钮即可在模拟器中预览
- 点击"预览"可在真机上测试

## 核心组件

### Card 卡牌组件

- 支持 4 种花色 + 王牌
- 可选尺寸：80×112px / 70×98px
- 选中/出牌动画

### Player 玩家组件

- 头像 + 名称 + 剩牌角标
- 支持 4 个位置
- 地主标识

### HandArea 手牌区

- 5 行网格布局 (5×5)
- 点击选牌
- 出牌动画

### PlayArea 出牌区

- 当前出牌显示
- 历史记录 (可折叠)
- 牌型识别

## 开发文档

- [小程序开发指南](../docs/development/miniprogram-setup.md)
- [组件库文档](../docs/development/component-library.md)
- [手牌区布局实现](../docs/development/hand-area-layout.md)

## 色彩规范

```css
/* 主色调 */
--deep-green: #1a472a;     /* 牌桌背景 */
--light-green: #2d5a3f;    /* 边框/强调 */
--active-green: #34c759;   /* 成功/可出牌 */

/* 辅助色 */
--white: #ffffff;
--yellow: #ffc107;
--red: #d32f2f;
--gray: #8a8a8a;
```

## 游戏规则

掼蛋是一种起源于江苏淮安的扑克游戏，采用两副牌进行游戏：

- **玩家数**: 4 人 (两两一组)
- **牌数**: 108 张 (两副牌)
- **每人手牌**: 27 张

### 牌型大小

从大到小：
1. 四大天王 (双王)
2. 炸弹 (4 张相同)
3. 其他牌型 (单张、对子、顺子等)

### 升级规则

- 从 2 开始打，依次升级到 A
- 先过完牌的一方获胜
- 获胜方根据对手剩余牌数决定升级级数

## 下一步

- ✅ Phase 3.2: 微信小程序框架 (当前)
- ⏳ Phase 3.3: 卡牌系统
- ⏳ Phase 3.4: 游戏逻辑
- ⏳ Phase 3.5: P2P 联机

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue。
