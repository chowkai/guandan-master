# 掼蛋大师 v1.2 更新日志

## 版本信息
- **版本号**: v1.2
- **发布日期**: 2026-03-20
- **优先级**: P0 紧急

## 新增功能

### 1. 开局随机指定出牌 ✅

**问题**: 新游戏开始后，没有指定第一家出牌

**修复内容**:
- 第一局游戏：随机指定一家先出牌（`random.randint(0, 3)`）
- 后续每局：由上局头游先出牌（贡牌后由进贡方出牌）

**修改文件**:
- `src/game/game.py` - `start_game()` 方法

---

### 2. 贡牌规则实现 ✅

**完整的贡牌规则**:

#### 单贡
- 上局末游（第 4 名）→ 上局头游（第 1 名）
- 进贡：手牌中最大单牌
- 红心级牌例外：如果是红心级牌，用次大牌
- 两张最大：自动选第一张

#### 双贡
- 上局 3、4 名 → 上局 1、2 名
- 两人都要进贡
- 最大牌给头家，次大给二游

#### 还贡
- 受贡方任选一张≤10 的牌还给进贡方
- AI 自动选择最小的≤10 的牌

#### 抗贡
- 单贡家：有 2 个大王 → 抗贡
- 双贡家：两家共有 2 个大王 → 抗贡
- 抗贡：跳过贡牌阶段，上局头家直接出牌

#### 出牌权（重要！）
- **正常贡牌后**: **进贡方**（上局头家的进贡者）先出牌
- **抗贡**: 上局头家先出牌

**举例**:
- 上局：A 头游，B 二游，C 三游，D 末游
- 贡牌：D → A（单贡）
- 出牌权：**D（进贡方）** 先出牌

**修改文件**:
- `src/game/game.py` - `execute_tribute_phase()` 方法
- `src/game/player.py` - `select_tribute_card()`, `select_return_card()` 方法

---

### 3. 贡牌动画 ✅

**动画流程**:
1. 显示贡牌提示："末游 D 向头游 A 进贡"
2. 进贡牌从进贡方区域飞出 → 受贡方区域（玩家可见是什么牌）
3. 显示还贡提示："A 向 D 还贡"
4. 还贡牌从受贡方区域飞出 → 进贡方区域（玩家可见是什么牌）
5. 显示抗贡提示（如抗贡）
6. 游戏开始

**实现**:
- `tributeAnimation()` 函数：进贡动画（金色边框，顺时针旋转）
- `returnTributeAnimation()` 函数：还贡动画（红色边框，逆时针旋转）
- 进贡牌、还贡牌都要显示给所有玩家看

**修改文件**:
- `src/client/js/animation.js` - 新增 `tributeAnimation()`, `returnTributeAnimation()` 方法
- `src/client/js/game.js` - 新增 `executeTributePhase()`, `executeSingleTribute()`, `playTributeAnimation()` 等方法
- `src/client/css/style.css` - 新增贡牌动画样式

---

## 测试用例

### 后端测试
创建了完整的单元测试文件：`tests/test_tribute.py`

**测试覆盖**:
- ✅ 进贡牌选择（最大牌、跳过红心级牌、对子选第一张）
- ✅ 还贡牌选择（最小≤10 的牌、无牌可还）
- ✅ 抗贡判断（2 个大王抗贡、1 个大王不能抗贡）
- ✅ 单贡流程
- ✅ 双贡流程
- ✅ 抗贡流程
- ✅ 先手玩家选择（第一局随机、后续局头游先手）

**运行测试**:
```bash
cd /home/zhoukai/openclaw/workspace/projects/guandan
python3 -m unittest tests.test_tribute -v
```

**测试结果**: 13 个测试全部通过 ✅

---

## 文件修改清单

### 后端 (Python)
1. `src/game/game.py`
   - 修改 `start_game()`: 第一局随机先手
   - 修改 `execute_tribute_phase()`: 完整贡牌逻辑 + 出牌权确定

2. `src/game/player.py`
   - 修改 `select_tribute_card()`: 进贡牌选择逻辑（排除红心级牌）
   - 保留 `select_return_card()`: 还贡牌选择逻辑

3. `tests/test_tribute.py` (新增)
   - 完整的贡牌规则单元测试

### 前端 (JavaScript + CSS)
1. `src/client/js/animation.js`
   - 新增 `tributeAnimation()`: 进贡动画
   - 新增 `returnTributeAnimation()`: 还贡动画

2. `src/client/js/game.js`
   - 修改 `GameState`: 新增 `previousRankings` 字段
   - 修改 `startNewGame()`: 检查是否需要贡牌
   - 新增 `executeTributePhase()`: 贡牌阶段主逻辑
   - 新增 `executeSingleTribute()`: 单次进贡流程
   - 新增 `selectTributeCard()`: 前端进贡牌选择
   - 新增 `selectReturnCard()`: 前端还贡牌选择
   - 新增 `playTributeAnimation()`: 播放进贡动画
   - 新增 `playReturnTributeAnimation()`: 播放还贡动画
   - 新增 `startGameAfterTribute()`: 贡牌后开始游戏
   - 新增 `sleep()`: 辅助函数
   - 修改 `gameOver()`: 保存排名供下局使用

3. `src/client/css/style.css`
   - 新增 `.tribute-message`: 贡牌提示样式
   - 新增 `.tribute-card-anim`: 贡牌动画卡牌样式
   - 新增 `@keyframes tributeMessageFade`: 贡牌消息动画

---

## 使用说明

### 开始新游戏
1. 第一局：系统随机指定一家先出牌
2. 后续局：自动进入贡牌阶段

### 贡牌阶段
1. 系统自动判断贡牌类型（单贡/双贡/抗贡）
2. 自动执行进贡和还贡（带动画）
3. 贡牌结束后，由进贡方先出牌（抗贡则由头游先出）

### 查看动画
- 确保浏览器启用了动画（默认启用）
- 可在设置中关闭动画以提升性能

---

## 已知问题

无

---

## 下一步计划

- [ ] 添加人类玩家手动选择进贡牌/还贡牌的选项
- [ ] 优化 AI 进贡/还贡策略
- [ ] 添加贡牌历史记录
- [ ] 支持悔棋功能

---

## 作者

代码虾 🧑‍💻

---

**版本历史**:
- v1.2 (2026-03-20): 开局随机 + 贡牌规则 + 贡牌动画
- v1.1 (2026-03-19): 基础游戏功能
- v1.0 (2026-03-18): 初始版本
