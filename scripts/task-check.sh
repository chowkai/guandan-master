#!/bin/bash
# 任务状态检查脚本
# 用法：./task-check.sh [--report]

TASKS_FILE="/home/zhoukai/openclaw/workspace/tasks/active-tasks.json"
NOW=$(date +%s)
TZ="Asia/Shanghai"

if [ ! -f "$TASKS_FILE" ]; then
    echo "任务文件不存在：$TASKS_FILE"
    exit 1
fi

# 使用 Python 解析 JSON 并检查任务状态
python3 << 'EOF'
import json
import datetime
import sys

TASKS_FILE = "/home/zhoukai/openclaw/workspace/tasks/active-tasks.json"

with open(TASKS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8)))
alerts = []
completed = []
overdue = []

for task in data.get('tasks', []):
    task_id = task.get('id')
    name = task.get('name')
    status = task.get('status')
    due_at_str = task.get('dueAt')
    started_at_str = task.get('startedAt')
    completed_at_str = task.get('completedAt')
    
    if not due_at_str:
        continue
    
    # 解析截止时间
    due_at = datetime.datetime.fromisoformat(due_at_str.replace('Z', '+00:00'))
    due_at_local = due_at.astimezone(datetime.timezone(datetime.timedelta(hours=8)))
    
    # 检查是否完成
    if status == 'completed':
        completed.append(f"✅ {name}")
        continue
    
    # 检查是否超时
    if now > due_at_local:
        overdue.append(f"🔴 {name} (截止：{due_at_local.strftime('%H:%M')})")
        continue
    
    # 检查是否即将到期（1 小时内）
    time_left = (due_at_local - now).total_seconds()
    if time_left < 3600:
        alerts.append(f"🟡 {name} (剩余 {int(time_left/60)} 分钟)")

# 输出结果
if completed:
    print("【完成任务】")
    for item in completed:
        print(f"  {item}")
    print()

if overdue:
    print("【超时任务】")
    for item in overdue:
        print(f"  {item}")
    print()

if alerts:
    print("【即将到期】")
    for item in alerts:
        print(f"  {item}")
    print()

if not completed and not overdue and not alerts:
    print("【任务状态正常】无到期/超时任务")

# 返回状态码
if overdue:
    sys.exit(2)  # 有超时任务
elif alerts:
    sys.exit(1)  # 有即将到期任务
else:
    sys.exit(0)  # 正常
EOF
