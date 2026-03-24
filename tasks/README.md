# 任务追踪系统

**创建日期**: 2026-03-23  
**用途**: 追踪所有进行中的任务，确保主动汇报和结果回报

---

## 📁 文件结构

```
tasks/
├── README.md              ← 你在这里（使用说明）
├── active-tasks.json      ← 当前活跃任务
├── completed-tasks.json   ← 已完成任务归档
└── task-archives/         ← 历史任务详细记录
```

---

## 📋 active-tasks.json 结构

```json
{
  "meta": {
    "created": "2026-03-23T07:02:00+08:00",
    "lastUpdated": "2026-03-23T07:02:00+08:00",
    "timezone": "Asia/Shanghai"
  },
  "tasks": [
    {
      "id": "task-001",
      "name": "任务名称",
      "project": "项目名",
      "assignee": "负责人 (main/design-agent/dev-agent/qa-agent)",
      "status": "pending|in-progress|completed|blocked|failed",
      "priority": "P0|P1|P2",
      "description": "任务描述",
      "estimatedMinutes": 30,
      "startedAt": "2026-03-23T08:00:00+08:00",
      "dueAt": "2026-03-23T12:00:00+08:00",
      "completedAt": null,
      "deliverables": ["交付物 1", "交付物 2"],
      "result": "完成结果/失败原因",
      "blockers": ["前置任务 id"]
    }
  ]
}
```

---

## 🔄 任务流转

```
pending → in-progress → completed
                      → failed
                      → blocked
```

### 状态说明

| 状态 | 说明 | 行动 |
|------|------|------|
| `pending` | 等待开始 | 分配后可启动 |
| `in-progress` | 进行中 | 追踪进展 |
| `completed` | 已完成 | 归档 + 汇报 |
| `failed` | 失败 | 记录原因 + 重新规划 |
| `blocked` | 阻塞 | 解决阻塞后继续 |

---

## 📢 主动汇报触发

### 必须汇报的情况

1. **任务完成** → 立即汇报 + 交付物
2. **任务失败** → 立即汇报 + 失败原因 + 已尝试方案
3. **任务超时** → 立即汇报 + 原因 + 新期限
4. **遇到阻塞** → 立即汇报 + 需要支持
5. **提前完成** → 立即汇报
6. **到期前 1 小时** → 提醒用户

### 汇报模板

```
【任务完成】task-001
任务：掼蛋 Phase 2 - 原型设计
状态：✅ 完成
实际耗时：XX 分钟
交付物：
- [链接/文件]
- [链接/文件]
测试结果：N/A
下一步：[建议]
待确认事项：[有/无]
  - 事项 1：[描述 + 选项 + 建议 + 影响 + 截止时间]
  - 事项 2：...
```

**待确认事项检查清单**（任务完成后必填）:
- [ ] 本任务是否有未决的技术决策？
- [ ] 是否有影响后续任务的依赖事项？
- [ ] 是否有产品方向的选择题？
- [ ] 是否有风险需要用户知悉？

---

## 🛠️ 工具

### 检查任务状态

```bash
./scripts/task-check.sh          # 检查状态
./scripts/task-check.sh --report # 生成报告
```

### 添加新任务

编辑 `active-tasks.json`，添加任务对象。

### 更新任务状态

编辑 `active-tasks.json`，修改对应任务的 `status` 字段。

---

## 📊 时间评估

参考 `../agents/ai-performance-baseline.md` 进行任务时间评估。

**公式**: `总耗时 = 基准时间 × 复杂度系数 + 50% Buffer`

---

## 📈 持续改进

每次任务完成后：
1. 记录实际耗时
2. 对比评估时间
3. 偏差 >50% 时更新基准文档

**校准周期**: 每周审查一次

---

**维护人**: main (PM)  
**最后更新**: 2026-03-23
