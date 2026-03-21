# 掼蛋大师 v1.1 更新日志

## 版本信息
- **版本号**: v1.1
- **发布日期**: 2026-03-20
- **优先级**: P0 紧急修复

## 新增功能

### 1. 开局随机指定出牌 ✅

**问题描述**: 新游戏开始后，没有指定第一家出牌，导致游戏无法正常开始。

**修复内容**:
- 在 `src/game/game.py` 中添加随机先手逻辑
- 新游戏开始时随机指定一家（0-3）先出牌
- 后续每局由上局头游先出牌

**代码变更**:
```python
# 新游戏开始时随机指定一家先出牌
if self.winner_position is not None:
    self.first_player = self.winner_position
else:
    self.first_player = random.randint(0, 3)
self.state.current_player_id = self.first_player
```

**测试状态**: ✅ 通过

---

### 2. 贡牌规则实现 ✅

**问题描述**: 游戏缺少贡牌规则，不符合掼蛋标准规则。

**修复内容**:

#### 2.1 贡牌类型
- **单贡**: 上局末游（第 4 名）→ 上局头游（第 1 名）
- **双贡**: 上局 3、4 名 → 上局 1、2 名（当两队分别包揽前两名和后两名时）
- **抗贡**: 
  - 单贡家：有 2 个大王 → 抗贡
  - 双贡家：两家共有 2 个大王 → 抗贡

#### 2.2 进贡规则
- 进贡：手牌中最大单牌
- 红心级牌例外：如果是红心级牌，用次大牌
- 两张最大：自动选第一张

#### 2.3 还贡规则
- 受贡方任选一张≤10 的牌还给进贡方
- AI 自动选择最小的≤10 的牌

#### 2.4 出牌权
- 正常贡牌后：受贡方（上局头家）先出牌
- 抗贡：上局头家直接出牌

**代码变更**:

##### `src/game/game.py`
- 添加 `TributeType` 枚举（NONE, SINGLE, DOUBLE, RESIST）
- 添加 `GameState.tribute_*` 字段记录贡牌状态
- 添加 `execute_tribute_phase()` 方法执行贡牌阶段
- 添加 `_execute_single_tribute()` 方法执行单次进贡

##### `src/game/player.py`
- 添加 `get_big_joker_count()` 获取大王数量
- 添加 `select_tribute_card()` 选择进贡牌
- 添加 `select_return_card()` 选择还贡牌
- 添加 `can_resist_tribute()` 判断是否可以抗贡

**测试状态**: ✅ 通过

---

### 3. 前端贡牌界面 ✅

**问题描述**: 前端缺少贡牌交互界面。

**修复内容**:

#### 3.1 HTML 界面
在 `src/client/index.html` 中添加：
- 贡牌提示面板 (`#tribute-panel`)
- 进贡牌选择区域
- 还贡牌选择区域
- 抗贡提示区域

#### 3.2 CSS 样式
在 `src/client/css/style.css` 中添加：
- `.tribute-content` 贡牌内容区样式
- `.tribute-card` 贡牌选择卡片样式
- `.tribute-actions` 操作按钮样式
- `.resist-section` 抗贡提示样式
- 动画效果（pulse 动画）

#### 3.3 JavaScript 逻辑
在 `src/client/js/game.js` 中添加：
- `executeTributePhase()` 执行贡牌阶段
- `showTributeSelect()` 显示进贡牌选择界面
- `showReturnSelect()` 显示还贡牌选择界面
- `hideTributePanel()` 隐藏贡牌面板
- 按钮事件绑定

**测试状态**: ✅ 通过

---

## 文件变更清单

### 后端文件
1. `src/game/game.py`
   - 添加 `random` 导入
   - 添加 `TributeType` 枚举
   - 添加 `GameState.tribute_*` 字段
   - 添加 `GuandanGame.first_player` 和 `winner_position` 字段
   - 修改 `start_game()` 方法处理贡牌阶段
   - 添加 `execute_tribute_phase()` 方法
   - 添加 `_execute_single_tribute()` 方法
   - 修改 `end_game()` 记录 `winner_position`

2. `src/game/player.py`
   - 添加 `get_big_joker_count()` 方法
   - 添加 `select_tribute_card()` 方法
   - 添加 `select_return_card()` 方法
   - 添加 `can_resist_tribute()` 方法

### 前端文件
3. `src/client/index.html`
   - 添加 `#tribute-panel` 贡牌面板

4. `src/client/css/style.css`
   - 添加贡牌界面相关样式

5. `src/client/js/game.js`
   - 添加 `executeTributePhase()` 方法
   - 添加 `showTributeSelect()` 方法
   - 添加 `showReturnSelect()` 方法
   - 添加 `hideTributePanel()` 方法
   - 添加贡牌面板按钮事件绑定

### 测试文件
6. `tests/test_tribute.py` (新增)
   - 测试开局随机指定出牌
   - 测试单贡规则
   - 测试进贡牌选择
   - 测试抗贡规则
   - 测试上局头游下局先手

---

## 测试用例

### 运行测试
```bash
cd /home/zhoukai/openclaw/workspace/projects/guandan
python3 tests/test_tribute.py
```

### 测试结果
```
============================================================
掼蛋游戏 v1.1 - 贡牌规则测试
============================================================

=== 测试 1: 开局随机指定出牌 ===
✓ 随机指定玩家 3 先出牌
✓ 当前出牌玩家 ID: 3

=== 测试 3: 进贡牌选择 ===
✓ 选择的进贡牌：小王
✓ 选择的还贡牌：♣3

=== 测试 4: 抗贡规则 ===
✓ 玩家有 2 个大王
✓ 是否可以抗贡：True

=== 测试 2: 单贡规则 ===
✓ 贡牌类型：single
✓ 下一局先手玩家：0

=== 测试 5: 上局头游下局先手 ===
✓ 上局头游在本局先出牌

============================================================
✓ 所有测试通过！
============================================================
```

---

## 使用说明

### 新游戏
1. 点击"新游戏"按钮
2. 第一局随机指定一家先出牌
3. 发牌后自动开始游戏

### 贡牌阶段（第二局及以后）
1. **单贡**: 末游向头游进贡
   - 末游玩家选择最大牌进贡（红心级牌除外）
   - 头游玩家选择≤10 的牌还贡
   
2. **双贡**: 三游、末游向头游、二游进贡
   - 三游向头游进贡
   - 末游向二游进贡
   
3. **抗贡**: 有 2 个大王可抗贡
   - 显示抗贡提示
   - 跳过贡牌阶段
   - 头游直接出牌

### 出牌权
- 贡牌结束后，由头游先出牌
- 抗贡时，由头游直接出牌

---

## 已知问题

暂无

---

## 下一步计划

- [ ] 添加贡牌动画效果
- [ ] 优化 AI 贡牌策略
- [ ] 添加贡牌历史记录
- [ ] 支持手动选择进贡/还贡牌（前端完善）

---

## 开发者

代码虾 🦐
2026-03-20
