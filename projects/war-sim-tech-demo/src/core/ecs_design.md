# ECS 框架核心 - Godot 4.x

## 架构设计

```
ECS (Entity Component System)
├── Entity (实体) - 唯一 ID
├── Component (组件) - 纯数据
│   ├── PositionComponent
│   ├── HealthComponent
│   ├── AIComponent
│   ├── MoraleComponent
│   └── TaskComponent
└── System (系统) - 纯逻辑
    ├── MovementSystem
    ├── CombatSystem
    ├── AISystem
    ├── MoraleSystem
    └── LODSystem
```

## 性能目标

- 10 万单位创建时间 < 5 秒
- 内存占用 < 2 GB
- 更新频率 60 FPS

## 实现计划

1. 定义组件数据结构
2. 实现 ECS 核心管理器
3. 实现各系统逻辑
4. 性能测试
