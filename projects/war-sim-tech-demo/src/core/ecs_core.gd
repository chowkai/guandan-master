## ECS 核心管理器 - GDScript 实现

```gdscript
# src/core/ecs.gd
class_name ECSManager
extends Node

# 组件存储 - 使用数组保证缓存友好
var position_components: Array[PositionComponent] = []
var health_components: Array[HealthComponent] = []
var ai_components: Array[AIComponent] = []
var morale_components: Array[MoraleComponent] = []
var task_components: Array[TaskComponent] = []

# 实体索引 - 快速查找
var entity_to_index: Dictionary = {}
var next_entity_id: int = 0

# 性能统计
var total_entities: int = 0
var update_time_ms: float = 0.0

func _ready():
    print("ECS Manager initialized")

func create_entity() -> int:
    """创建实体，返回实体 ID"""
    var entity_id = next_entity_id
    next_entity_id += 1
    
    # 创建组件
    var index = position_components.size()
    position_components.append(PositionComponent.new())
    health_components.append(HealthComponent.new())
    ai_components.append(AIComponent.new())
    morale_components.append(MoraleComponent.new())
    task_components.append(TaskComponent.new())
    
    # 建立索引
    entity_to_index[entity_id] = index
    total_entities += 1
    
    return entity_id

func remove_entity(entity_id: int):
    """移除实体"""
    if entity_id in entity_to_index:
        var index = entity_to_index[entity_id]
        
        # 标记为删除 (实际删除可以批量处理)
        health_components[index].is_alive = false
        
        total_entities -= 1

func get_all_entities() -> Array:
    """获取所有实体 ID"""
    return entity_to_index.keys()

func _process(delta: float):
    """性能监控"""
    var start_time = Time.get_ticks_usec()
    
    # 系统更新会在各自的 System 中实现
    
    var end_time = Time.get_ticks_usec()
    update_time_ms = (end_time - start_time) / 1000.0
    
    # 性能日志
    if Engine.get_physics_frames() % 60 == 0:
        print("Entities: %d, Update: %.2f ms, FPS: %d" % [
            total_entities, 
            update_time_ms, 
            Engine.get_frames_per_second()
        ])
```

---

## 组件定义

```gdscript
# src/components/position_component.gd
class_name PositionComponent
extends RefCounted

var position: Vector3 = Vector3.ZERO
var rotation: Vector3 = Vector3.ZERO
var scale: Vector3 = Vector3.ONE
var velocity: Vector3 = Vector3.ZERO

func set_position(x: float, y: float, z: float):
    position = Vector3(x, y, z)

func move(delta: float):
    position += velocity * delta
```

```gdscript
# src/components/health_component.gd
class_name HealthComponent
extends RefCounted

var current_health: int = 100
var max_health: int = 100
var is_alive: bool = true
var is_wounded: bool = false

func take_damage(amount: int):
    current_health -= amount
    if current_health <= 0:
        is_alive = false
    elif current_health < max_health * 0.5:
        is_wounded = true

func heal(amount: int):
    current_health = mini(current_health + amount, max_health)
    is_wounded = current_health < max_health * 0.5
```

```gdscript
# src/components/ai_component.gd
class_name AIComponent
extends RefCounted

enum AIState { IDLE, MOVING, COMBAT, FLEEING, RESTING }

var current_state: AIState = AIState.IDLE
var current_task: Task = null
var last_decision_time: float = 0.0
var decision_frequency: float = 1.0  # 秒

func set_task(task: Task):
    current_task = task
    current_state = AIState.MOVING

func update_state(new_state: AIState):
    current_state = new_state
```

```gdscript
# src/components/morale_component.gd
class_name MoraleComponent
extends RefCounted

var morale: int = 80  # 0-100
var panic: int = 0    # 0-100
var cohesion: int = 100  # 凝聚力

func add_panic(amount: int):
    panic = mini(panic + amount, 100)
    morale = maxi(morale - amount, 0)

func reduce_panic(amount: int):
    panic = maxi(panic - amount, 0)

func is_routed() -> bool:
    return morale < 30 or panic > 80 or cohesion < 20
```

```gdscript
# src/components/task_component.gd
class_name TaskComponent
extends RefCounted

enum TaskType { MOVE, ATTACK, DEFEND, RETREAT, RESUPPLY }

var current_task_type: TaskType = TaskType.MOVE
var target_position: Vector3 = Vector3.ZERO
var target_entity: int = -1
var priority: int = 0
var is_completed: bool = false

func set_move_task(pos: Vector3, prio: int = 0):
    current_task_type = TaskType.MOVE
    target_position = pos
    priority = prio
    is_completed = false

func set_attack_task(entity_id: int, prio: int = 0):
    current_task_type = TaskType.ATTACK
    target_entity = entity_id
    priority = prio
    is_completed = false
```

---

## 使用示例

```gdscript
# 创建 10 万单位测试
func spawn_100k_units():
    var ecs = ECSManager.new()
    
    var start_time = Time.get_ticks_usec()
    
    for i in range(100000):
        var entity_id = ecs.create_entity()
        
        # 设置位置 (随机分布)
        var pos_comp = ecs.position_components[ecs.entity_to_index[entity_id]]
        pos_comp.set_position(
            randf_range(-5000, 5000),
            0,
            randf_range(-5000, 5000)
        )
        
        # 设置 AI 状态
        var ai_comp = ecs.ai_components[ecs.entity_to_index[entity_id]]
        ai_comp.set_task(Task.new())
    
    var end_time = Time.get_ticks_usec()
    var creation_time = (end_time - start_time) / 1000000.0
    
    print("创建 10 万单位耗时：%.2f 秒" % creation_time)
    print("内存占用：%.2f MB" % (Memory.get_static_memory_usage() / 1024.0 / 1024.0))
```
