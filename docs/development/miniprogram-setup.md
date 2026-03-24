# 微信小程序开发指南

## 环境准备

### 1. 安装微信开发者工具

- 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
- 选择稳定版 (Stable Build)
- 支持平台：Windows / macOS / Linux

### 2. 配置开发环境

1. 打开微信开发者工具
2. 使用微信扫码登录
3. 导入项目：选择 `guandan-miniprogram` 目录
4. 填写 AppID (测试可选"测试号")
5. 项目配置：
   - 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书：✓ 勾选 (开发环境)
   - 启用 ES6 转 ES5：✓ 勾选
   - 增强编译：✓ 勾选

## 项目结构

```
guandan-miniprogram/
├── app.ts                 # 小程序入口文件
├── app.json               # 小程序全局配置
├── app.wxss               # 全局样式入口
├── project.config.json    # 项目配置文件
├── sitemap.json           # 搜索索引配置
├── tsconfig.json          # TypeScript 配置
├── typings/               # 类型定义
│   └── index.d.ts         # 全局类型声明
├── pages/                 # 页面目录
│   ├── index/             # 主页面
│   │   ├── index.ts
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   └── game/              # 游戏页面
│       ├── game.ts
│       ├── game.wxml
│       ├── game.wxss
│       └── game.json
├── components/            # 自定义组件目录
│   ├── card/              # 卡牌组件
│   ├── player/            # 玩家组件
│   ├── button/            # 按钮组件
│   ├── hand-area/         # 手牌区组件
│   └── play-area/         # 出牌区组件
├── utils/                 # 工具函数
│   └── card-utils.ts      # 卡牌工具
├── styles/                # 全局样式
│   ├── variables.wxss     # CSS 变量
│   └── global.wxss        # 全局样式
└── assets/                # 静态资源
    └── default-avatar.png # 默认头像
```

## 开发流程

### 1. 启动开发服务器

1. 微信开发者工具 → 导入项目
2. 自动编译 TypeScript 为 JavaScript
3. 点击"编译"按钮预览效果

### 2. 调试

- **模拟器调试**: 在开发者工具中直接调试
- **真机调试**: 
  1. 点击"预览"生成二维码
  2. 微信扫码在手机上调试
  3. 可在开发者工具查看手机日志

### 3. 构建

1. 点击"工具" → "构建 npm"
2. 生成 `miniprogram_dist/` 目录
3. 上传代码前确保构建成功

## TypeScript 配置

### tsconfig.json 说明

```json
{
  "compilerOptions": {
    "target": "ES2015",           // 编译目标
    "module": "ESNext",           // 模块系统
    "strict": true,               // 严格模式
    "esModuleInterop": true,      // ES 模块互操作
    "baseUrl": ".",               // 基础路径
    "paths": {                    // 路径别名
      "@/*": ["./*"],
      "@components/*": ["components/*"]
    }
  }
}
```

### 类型定义

在 `typings/index.d.ts` 中定义全局类型：

```typescript
interface ICard {
  suit: string;
  value: string;
}

interface IPlayer {
  playerId: string;
  playerName: string;
  // ...
}
```

## 样式规范

### CSS 变量

所有色彩和尺寸使用 CSS 变量定义在 `styles/variables.wxss`:

```css
page {
  /* 主色调 */
  --deep-green: #1a472a;
  --light-green: #2d5a3f;
  --active-green: #34c759;
  
  /* 字体大小 */
  --font-size-xs: 24rpx;
  --font-size-sm: 28rpx;
  --font-size-md: 32rpx;
  
  /* 间距 */
  --spacing-xs: 8rpx;
  --spacing-sm: 16rpx;
  --spacing-md: 24rpx;
}
```

### 响应式设计

使用 rpx 单位 (responsive pixel):
- 750rpx = 屏幕宽度
- 自动适配不同屏幕尺寸

## 组件开发

### 组件结构

每个组件包含 4 个文件:

```
component-name/
├── component-name.ts      # 组件逻辑
├── component-name.wxml    # 组件模板
├── component-name.wxss    # 组件样式
└── component-name.json    # 组件配置
```

### 组件注册

在 `component-name.json` 中声明:

```json
{
  "component": true,
  "usingComponents": {}
}
```

### 组件使用

在页面或其他组件的 JSON 中引用:

```json
{
  "usingComponents": {
    "card": "/components/card/card",
    "player": "/components/player/player"
  }
}
```

## 常见问题

### 1. TypeScript 编译错误

- 确保安装了 `miniprogram-api-typings`
- 检查 `tsconfig.json` 配置
- 重启微信开发者工具

### 2. 样式不生效

- 检查样式文件是否正确引入
- 确认 CSS 变量作用域
- 清除缓存重新编译

### 3. 组件不显示

- 检查 `component: true` 是否设置
- 确认组件路径正确
- 查看控制台错误信息

## 性能优化

### 1. 图片优化

- 使用 WebP 格式
- 压缩图片大小
- 使用 CDN 加载大图

### 2. 分包加载

大型项目使用分包:

```json
{
  "subPackages": [
    {
      "root": "pages/sub",
      "pages": ["page1/page1", "page2/page2"]
    }
  ]
}
```

### 3. 数据优化

- 避免大数据 setData
- 使用局部更新
- 减少渲染层级

## 发布流程

1. 代码审查
2. 真机测试
3. 上传代码 (开发者工具 → 上传)
4. 提交审核
5. 等待审核通过
6. 发布上线

## 参考资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)
