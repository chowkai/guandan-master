# 掼蛋项目组 - 工具软件配置方案

**版本**: v1.0  
**生效日期**: 2026-03-21  
**维护人**: DevOps-Agent

---

## 📋 工具配置原则

1. **必要性** - 只配置必需工具
2. **专业性** - 各岗位专业工具
3. **易用性** - 快速上手
4. **可维护** - 易于更新和管理

---

## 🛠️ 基础工具 (全员必备)

### 1. Node.js + npm

**用途**: 项目运行环境

**版本**: Node.js 18+ / npm 9+

**安装**:
```bash
# 下载
https://nodejs.org/

# 验证
node -v
npm -v
```

**使用规范**:
- 所有项目使用统一 Node 版本
- 使用 npm 管理依赖
- 定期更新依赖

---

### 2. Git

**用途**: 版本控制

**版本**: Git 2.40+

**安装**:
```bash
# Ubuntu/Debian
sudo apt install git

# macOS
brew install git

# 验证
git --version
```

**使用规范**:
- 每次提交必须有清晰信息
- 禁止直接 push 到 main
- 使用 PR/MR 流程

---

### 3. VS Code

**用途**: 代码编辑

**版本**: 最新稳定版

**安装**:
```bash
# 下载
https://code.visualstudio.com/
```

**必备插件**:
```
□ Svelte for VS Code
□ ESLint
□ Prettier
□ GitLens
□ Live Server
□ Path Intellisense
```

---

### 4. Chrome/Edge 浏览器

**用途**: 测试调试

**版本**: 最新稳定版

**必备扩展**:
```
□ Vue.js devtools
□ React Developer Tools
□ Lighthouse
□ JSON Viewer
□ ColorZilla
```

---

## 🎨 UI-Agent 工具

### 1. Figma (在线)

**用途**: UI/UX 设计

**版本**: 免费版

**地址**: https://figma.com

**使用场景**:
- UI 设计稿
- 原型设计
- 团队协作
- 设计系统

**使用规范**:
```
1. 每个项目创建独立 Figma 文件
2. 使用组件库保持设计一致
3. 导出切图到项目 assets/目录
4. 设计稿链接记录到文档
```

---

### 2. Adobe Color

**用途**: 配色方案

**地址**: https://color.adobe.com/

**使用场景**:
- 配色方案设计
- 色彩对比度检查
- 导出配色代码

---

### 3. IconFont (阿里图标库)

**用途**: 图标资源

**地址**: https://www.iconfont.cn/

**使用场景**:
- 项目图标
- 自定义图标
- SVG 导出

---

### 4. TinyPNG

**用途**: 图片压缩

**地址**: https://tinypng.com/

**使用场景**:
- 图片优化
- 减小文件体积
- 保持质量

---

## 💻 Dev-Agent 工具

### 1. Vite

**用途**: 构建工具

**版本**: 5.0+

**安装**:
```bash
npm install -D vite
```

**使用场景**:
- 本地开发服务器
- 生产环境打包
- 热重载

**使用规范**:
```bash
# 开发
npm run dev

# 打包
npm run build

# 预览
npm run preview
```

---

### 2. ESLint

**用途**: 代码规范检查

**安装**:
```bash
npm install -D eslint
```

**配置**:
```javascript
// .eslintrc.js
module.exports = {
  env: { browser: true, es2021: true },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn'
  }
}
```

**使用规范**:
```bash
# 检查
npm run lint

# 自动修复
npm run lint:fix
```

---

### 3. Prettier

**用途**: 代码格式化

**安装**:
```bash
npm install -D prettier
```

**使用规范**:
```bash
# 格式化
npx prettier --write "src/**/*.{js,svelte}"
```

---

### 4. Svelte Devtools

**用途**: Svelte 调试

**安装**: Chrome 扩展

**使用场景**:
- 组件状态查看
- 事件追踪
- 性能分析

---

## 🧪 QA-Agent 工具

### 1. Playwright

**用途**: 自动化测试

**安装**:
```bash
npm install -D @playwright/test
npx playwright install
```

**使用场景**:
- E2E 测试
- 回归测试
- 性能测试

**测试示例**:
```javascript
// tests/e2e/game.spec.js
import { test, expect } from '@playwright/test';

test('开新局', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("新游戏")');
  await expect(page.locator('.my-hand .card')).toHaveCount(27);
});
```

---

### 2. Lighthouse

**用途**: 性能测试

**安装**: Chrome 内置

**使用场景**:
- 性能评分
- SEO 检查
- 可访问性检查

**使用规范**:
```
每次发布前执行:
1. Chrome DevTools → Lighthouse
2. 运行性能测试
3. 评分 ≥ 90 分
4. 记录到测试报告
```

---

### 3. Postman

**用途**: API 测试

**地址**: https://www.postman.com/

**使用场景**:
- API 接口测试
- 接口文档
- 自动化测试

---

## 📊 PM-Agent 工具

### 1. Trello

**用途**: 任务管理

**地址**: https://trello.com/

**使用场景**:
- 任务看板
- 进度追踪
- 团队协作

**看板结构**:
```
待办 | 进行中 | 审查中 | 已完成
```

**使用规范**:
```
1. 每个需求创建一个卡片
2. 卡片包含:
   - 需求描述
   - 验收标准
   - 负责人
   - 截止日期
3. 每日更新卡片状态
```

---

### 2. Notion

**用途**: 文档管理

**地址**: https://www.notion.so/

**使用场景**:
- 需求文档
- 会议纪要
- 知识库
- 项目 Wiki

---

### 3. Lucidchart

**用途**: 流程图/架构图

**地址**: https://www.lucidchart.com/

**使用场景**:
- 流程图
- 架构图
- 时序图
- ER 图

---

## 🚀 DevOps-Agent 工具

### 1. GitHub Actions

**用途**: CI/CD

**配置**:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
```

**使用场景**:
- 自动构建
- 自动测试
- 自动部署

---

### 2. Docker

**用途**: 容器化部署

**安装**:
```bash
# Ubuntu
sudo apt install docker.io

# 验证
docker --version
```

**使用场景**:
- 环境一致性
- 快速部署
- 服务隔离

---

### 3. Nginx

**用途**: Web 服务器

**安装**:
```bash
sudo apt install nginx
```

**使用场景**:
- 静态文件服务
- 反向代理
- 负载均衡

---

## 📈 监控工具 (可选)

### 1. Sentry

**用途**: 错误监控

**地址**: https://sentry.io/

**使用场景**:
- 前端错误追踪
- 性能监控
- 用户行为分析

---

### 2. Google Analytics

**用途**: 用户分析

**地址**: https://analytics.google.com/

**使用场景**:
- 用户行为
- 流量分析
- 转化率

---

## 📋 工具使用规范

### 1. 工具安装清单

**位置**: `docs/tools/INSTALL-CHECKLIST.md`

**内容**:
```markdown
# 工具安装清单

## 基础工具
- [ ] Node.js 18+
- [ ] Git 2.40+
- [ ] VS Code
- [ ] Chrome

## UI-Agent
- [ ] Figma 账号
- [ ] Adobe Color
- [ ] IconFont

## Dev-Agent
- [ ] Vite 5.0+
- [ ] ESLint
- [ ] Prettier

## QA-Agent
- [ ] Playwright
- [ ] Lighthouse

## PM-Agent
- [ ] Trello 账号
- [ ] Notion 账号

## DevOps-Agent
- [ ] GitHub Actions
- [ ] Docker
```

---

### 2. 工具培训

**新 Agent 入职流程**:
```
1. 阅读工具配置文档
2. 安装基础工具
3. 安装岗位工具
4. 工具使用培训
5. 工具使用考核
```

---

### 3. 工具更新

**更新周期**:
- 基础工具：每月检查更新
- 开发工具：每季度检查更新
- 设计工具：每半年检查更新

**更新流程**:
```
1. 检查新版本
2. 评估兼容性
3. 测试环境更新
4. 生产环境更新
5. 更新文档
```

---

## 📊 工具效果评估

### 评估指标

| 工具 | 评估指标 | 目标值 |
|------|---------|--------|
| Figma | 设计稿产出速度 | +30% |
| Playwright | 测试覆盖率 | >80% |
| Trello | 任务完成率 | >90% |
| GitHub Actions | 构建成功率 | 100% |

### 评估周期

- 每周：工具使用情况
- 每月：工具效果评估
- 每季度：工具优化调整

---

## 🎯 立即行动

### 第一阶段 (本周内)

**全员**:
- [ ] 安装基础工具
- [ ] 配置 VS Code 插件
- [ ] 注册 Trello 账号

**UI-Agent**:
- [ ] 注册 Figma 账号
- [ ] 收集图标资源

**Dev-Agent**:
- [ ] 安装 Vite
- [ ] 配置 ESLint

**QA-Agent**:
- [ ] 安装 Playwright
- [ ] 编写测试用例

**PM-Agent**:
- [ ] 创建 Trello 看板
- [ ] 创建 Notion 文档

**DevOps-Agent**:
- [ ] 配置 GitHub Actions
- [ ] 准备 Docker 配置

---

### 第二阶段 (下周内)

- [ ] 工具使用培训
- [ ] 工具效果评估
- [ ] 优化配置

---

**负责人**: DevOps-Agent  
**完成日期**: 2026-03-28
