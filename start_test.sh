#!/bin/bash
# 掼蛋游戏 v1.3 - 快速测试启动脚本
# UI 全面重构版本

echo "======================================"
echo "  掼蛋大师 v1.3 - 测试服务器"
echo "  UI 全面重构 + 开局 BUG 修复"
echo "======================================"
echo ""
echo "启动 HTTP 服务器..."
echo "访问地址：http://localhost:8000/src/client/"
echo ""
echo "测试重点:"
echo "  1. 开局流程 - 等待发牌完成后再出牌"
echo "  2. 牌面设计 - 大字体 (48px) + 简洁设计"
echo "  3. 桌面布局 - 两行手牌 + 固定尺寸"
echo "  4. 响应式 - 手机端优化"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 进入项目目录
cd "$(dirname "$0")"

# 启动 Python HTTP 服务器
python3 -m http.server 8000
