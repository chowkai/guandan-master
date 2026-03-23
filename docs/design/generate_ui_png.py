#!/usr/bin/env python3
"""
掼蛋大师 v3 - UI 设计稿 PNG 生成器
生成主界面和游戏界面的高保真设计稿 PNG 图片
尺寸：750px × 1334px (微信小程序标准)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 配置
WIDTH = 750
HEIGHT = 1334
OUTPUT_DIR = '/home/zhoukai/openclaw/workspace/projects/guandan/docs/design/exports'

# 颜色定义
COLORS = {
    'bg_dark_green': '#1a472a',      # 牌桌背景 - 深绿色
    'bg_light_green': '#2d5a3f',     # 浅绿色
    'bg_white': '#ffffff',
    'bg_semi_white': 'rgba(255, 255, 255, 0.95)',
    'bg_semi_black': 'rgba(0, 0, 0, 0.5)',
    'text_white': '#ffffff',
    'text_black': '#000000',
    'text_gray': '#4a4a4a',
    'highlight_yellow': '#ffc107',   # 高亮/提醒
    'card_bg': '#ffffff',
    'card_border': '#e0e0e0',
    'spade_black': '#000000',
    'heart_red': '#d32f2f',
}

def get_font(size, bold=False):
    """获取字体（使用系统字体）"""
    # 尝试使用系统字体
    font_paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/TTF/DejaVuSans.ttf',
    ]
    
    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    
    # 回退到默认字体
    return ImageFont.load_default()

def draw_card(draw, x, y, value, suit, is_red=False, selected=False, scale=1.0):
    """绘制扑克牌"""
    card_width = int(80 * scale)
    card_height = int(150 * scale)
    
    # 牌背景
    bg_color = '#fff9c4' if selected else '#ffffff'
    border_color = '#ffc107' if selected else '#e0e0e0'
    border_width = 3 if selected else 1
    
    # 绘制牌面
    draw.rounded_rectangle(
        [x, y, x + card_width, y + card_height],
        radius=8,
        fill=bg_color,
        outline=border_color,
        width=border_width
    )
    
    # 绘制牌值
    font = get_font(int(24 * scale))
    suit_color = COLORS['heart_red'] if is_red else COLORS['spade_black']
    
    # 左上角
    draw.text((x + 8, y + 8), f"{value}{suit}", fill=suit_color, font=font)
    
    # 中央花色
    font_large = get_font(int(40 * scale))
    draw.text((x + card_width//2 - 15, y + card_height//2 - 20), suit, fill=suit_color, font=font_large)

def draw_ai_avatar(draw, x, y, emoji, bg_color, size=40):
    """绘制 AI 头像"""
    # 圆形背景
    draw.ellipse([x, y, x + size, y + size], fill=bg_color, outline='#ffffff', width=2)
    
    # Emoji
    font = get_font(int(size * 0.6))
    draw.text((x + size//2 - 12, y + size//2 - 12), emoji, fill='#ffffff', font=font)

def generate_main_screen():
    """生成主界面 PNG"""
    print("生成主界面...")
    
    # 创建图像
    img = Image.new('RGB', (WIDTH, HEIGHT), COLORS['bg_dark_green'])
    draw = ImageDraw.Draw(img)
    
    font_title = get_font(48, bold=True)
    font_button = get_font(36, bold=True)
    font_button_sub = get_font(20)
    
    # 1. 标题区域
    title_y = 200
    draw.text((WIDTH//2 - 180, title_y), "掼蛋大师 v3", fill=COLORS['text_white'], font=font_title)
    
    # 2. 主按钮 - 开始游戏
    btn_y = 400
    btn_width = 400
    btn_height = 100
    btn_x = (WIDTH - btn_width) // 2
    
    # 按钮背景（圆角矩形）
    draw.rounded_rectangle(
        [btn_x, btn_y, btn_x + btn_width, btn_y + btn_height],
        radius=16,
        fill=COLORS['bg_dark_green'],
        outline=COLORS['bg_light_green'],
        width=3
    )
    
    # 按钮文字
    draw.text((WIDTH//2 - 100, btn_y + 25), "开始游戏", fill=COLORS['text_white'], font=font_button)
    
    # 3. 次要按钮 - P2P 联机
    btn2_y = btn_y + btn_height + 30
    draw.rounded_rectangle(
        [btn_x, btn2_y, btn_x + btn_width, btn2_y + 80],
        radius=12,
        fill=COLORS['bg_white'],
        outline='#8a8a8a',
        width=2
    )
    draw.text((WIDTH//2 - 80, btn2_y + 20), "P2P 联机", fill=COLORS['bg_dark_green'], font=font_button)
    
    # 4. 设置按钮（右下角）
    settings_x = WIDTH - 100
    settings_y = HEIGHT - 200
    draw.ellipse([settings_x, settings_y, settings_x + 60, settings_y + 60], 
                 fill='#4a6a5a', outline=None)
    font_settings = get_font(32)
    draw.text((settings_x + 15, settings_y + 10), "⚙️", font=font_settings)
    
    # 保存
    output_path = os.path.join(OUTPUT_DIR, 'main-screen.png')
    img.save(output_path, 'PNG')
    print(f"  已保存：{output_path}")
    
    return output_path

def generate_game_screen():
    """生成游戏界面 PNG（v2 版本）"""
    print("生成游戏界面...")
    
    # 创建图像
    img = Image.new('RGB', (WIDTH, HEIGHT), COLORS['bg_dark_green'])
    draw = ImageDraw.Draw(img)
    
    font_small = get_font(20)
    font_medium = get_font(28, bold=True)
    font_large = get_font(36, bold=True)
    
    # 1. 顶部信息栏
    top_bar_height = 88
    draw.rectangle([0, 0, WIDTH, top_bar_height], fill='#1a472a')
    
    # 暂停按钮
    draw.rounded_rectangle([20, 20, 80, 80], radius=10, fill='#4a6a5a')
    draw.text((38, 28), "⏸️", font=get_font(32))
    
    # 局数/比分
    draw.text((WIDTH - 180, 25), "第 3 局", fill=COLORS['text_white'], font=font_small)
    draw.text((WIDTH - 150, 50), "2 : 1", fill=COLORS['text_white'], font=font_medium)
    
    # 2. 对家信息区（简化版 + 剩 6 张提醒）
    opponent_y = 110
    draw.rounded_rectangle([WIDTH//2 - 120, opponent_y, WIDTH//2 + 120, opponent_y + 70],
                          radius=10, fill='#f0f0f0', outline=COLORS['bg_light_green'], width=2)
    
    # AI 头像（猫头鹰 - 保守型）
    draw_ai_avatar(draw, WIDTH//2 - 100, opponent_y + 15, "🦉", '#8B4513', size=40)
    draw.text((WIDTH//2 - 50, opponent_y + 20), "对家 AI", fill=COLORS['text_black'], font=font_medium)
    
    # 剩 6 张角标
    draw.ellipse([WIDTH//2 + 70, opponent_y + 15, WIDTH//2 + 100, opponent_y + 45], 
                 fill=COLORS['highlight_yellow'], outline=None)
    draw.text((WIDTH//2 + 78, opponent_y + 20), "🔔", font=get_font(24))
    
    # 3. 出牌区域（可折叠多轮）
    play_area_y = 210
    
    # 第 8 轮（展开 - 当前轮）
    draw.rounded_rectangle([WIDTH//2 - 300, play_area_y, WIDTH//2 + 300, play_area_y + 140],
                          radius=14, fill='#333333', outline=COLORS['highlight_yellow'], width=3)
    
    # 轮次信息
    draw.text((WIDTH//2 - 280, play_area_y + 15), "第 8 轮  |  上家：同花顺  ▼", 
              fill=COLORS['text_white'], font=font_small)
    
    # 出的牌（5 张同花顺）
    cards_x = WIDTH//2 - 180
    cards_y = play_area_y + 50
    for i, (value, suit, is_red) in enumerate([('A','♠',False), ('K','♠',False), ('Q','♠',False), ('J','♠',False), ('10','♠',False)]):
        draw_card(draw, cards_x + i * 75, cards_y, value, suit, is_red, scale=0.6)
    
    # 第 7 轮（折叠）
    round2_y = play_area_y + 155
    draw.rounded_rectangle([WIDTH//2 - 300, round2_y, WIDTH//2 + 300, round2_y + 55],
                          radius=10, fill='#333333', outline=COLORS['bg_light_green'], width=1)
    draw.text((WIDTH//2 - 280, round2_y + 18), "第 7 轮  |  对家：炸弹  ▶", 
              fill=COLORS['text_white'], font=font_small)
    
    # 第 6 轮（折叠）
    round3_y = round2_y + 65
    draw.rounded_rectangle([WIDTH//2 - 300, round3_y, WIDTH//2 + 300, round3_y + 55],
                          radius=10, fill='#333333', outline=COLORS['bg_light_green'], width=1)
    draw.text((WIDTH//2 - 280, round3_y + 18), "第 6 轮  |  下家：顺子  ▶", 
              fill=COLORS['text_white'], font=font_small)
    
    # 4. 上家/下家信息区（简化版）
    # 上家
    left_y = 520
    draw_ai_avatar(draw, 30, left_y, "🦅", '#FF6B35', size=40)  # 老鹰 - 激进型
    draw.text((80, left_y + 10), "上家 AI", fill=COLORS['text_white'], font=font_medium)
    
    # 下家
    right_y = 590
    draw_ai_avatar(draw, 30, right_y, "🦊", '#FFA500', size=40)  # 狐狸 - 平衡型
    draw.text((80, right_y + 10), "下家 AI", fill=COLORS['text_white'], font=font_medium)
    
    # 5. 手牌区域
    hand_area_y = 680
    draw.rounded_rectangle([20, hand_area_y, WIDTH - 20, hand_area_y + 200],
                          radius=12, fill='#224433')
    
    # 绘制手牌（13 张示例）
    cards_start_x = 40
    cards_y = hand_area_y + 25
    hand_cards = [
        ('A','♠',False), ('K','♠',False), ('Q','♥',True), ('J','♦',True),
        ('10','♣',False), ('9','♠',False), ('8','♥',True), ('7','♦',True),
        ('6','♣',False), ('5','♠',False), ('4','♥',True), ('3','♦',True),
        ('🃏','',False)  # 王
    ]
    
    for i, (value, suit, is_red) in enumerate(hand_cards):
        selected = (i == 1 or i == 2)  # 模拟选中第 2、3 张牌
        draw_card(draw, cards_start_x + i * 55, cards_y, value, suit if suit else '🃏', is_red or value=='🃏', selected, scale=0.7)
    
    # 6. 操作按钮区
    btn_area_y = 910
    btn_width = 100
    btn_height = 60
    btn_spacing = 20
    
    # 提示按钮
    btn1_x = WIDTH//2 - btn_width - btn_spacing - btn_width//2
    draw.rounded_rectangle([btn1_x, btn_area_y, btn1_x + btn_width, btn_area_y + btn_height],
                          radius=10, fill=COLORS['bg_dark_green'], outline=COLORS['bg_light_green'], width=2)
    draw.text((btn1_x + 25, btn_area_y + 18), "提示", fill=COLORS['text_white'], font=get_font(24))
    
    # 出牌按钮（亮起状态）
    btn2_x = WIDTH//2 - btn_width//2
    draw.rounded_rectangle([btn2_x, btn_area_y, btn2_x + btn_width, btn_area_y + btn_height],
                          radius=10, fill=COLORS['bg_light_green'], outline=COLORS['highlight_yellow'], width=2)
    draw.text((btn2_x + 25, btn_area_y + 18), "出牌", fill=COLORS['text_white'], font=get_font(24))
    
    # 撤销按钮
    btn3_x = WIDTH//2 + btn_spacing + btn_width//2
    draw.rounded_rectangle([btn3_x, btn_area_y, btn3_x + btn_width, btn_area_y + btn_height],
                          radius=10, fill=COLORS['bg_dark_green'], outline=COLORS['bg_light_green'], width=2)
    draw.text((btn3_x + 25, btn_area_y + 18), "撤销", fill=COLORS['text_white'], font=get_font(24))
    
    # 7. 底部指示条
    draw.rectangle([WIDTH//2 - 50, HEIGHT - 30, WIDTH//2 + 50, HEIGHT - 20], 
                   fill='#6a8a7a', outline=None)
    
    # 保存
    output_path = os.path.join(OUTPUT_DIR, 'game-screen.png')
    img.save(output_path, 'PNG')
    print(f"  已保存：{output_path}")
    
    return output_path

def generate_design_source_link():
    """生成设计源文件链接（文本文件）"""
    print("生成设计源文件链接...")
    
    content = """# 掼蛋大师 v3 - 设计源文件

**版本**: v2.0  
**创建日期**: 2026-03-23  
**设计师**: design-agent

---

## 设计工具

由于环境限制，无法直接创建 Figma/Sketch 源文件。

**推荐方案**:
1. 使用导出的 PNG 图片作为参考
2. 在 Figma 中导入 PNG 作为底图
3. 按照 `ui-game-screen-v2.md` 和 `layout-analysis.md` 中的标注重建

---

## Figma 重建指南

### 1. 创建画布
- 尺寸：750px × 1334px
- 背景色：#1a472a

### 2. 导入参考图
- 导入 `main-screen.png` 作为主界面参考
- 导入 `game-screen.png` 作为游戏界面参考

### 3. 使用标注文档
- 参考 `ui-game-screen-v2.md` 中的详细标注
- 参考 `layout-analysis.md` 中的布局分析

### 4. 组件库
按照 `component-library.md` 创建可复用组件：
- 按钮（主按钮/次要按钮/操作按钮/图标按钮）
- 扑克牌组件
- 信息卡片
- 出牌区域

---

## 在线设计工具链接

### Figma
- 网址：https://www.figma.com
- 免费计划：支持 3 个项目
- 协作功能：支持多人实时协作

### Canva
- 网址：https://www.canva.com
- 免费计划：基础功能可用
- 模板丰富

---

## 导出 PNG 说明

当前导出的 PNG 图片已保存在：
- `exports/main-screen.png` - 主界面
- `exports/game-screen.png` - 游戏界面

如需可编辑源文件，请在 Figma/Canva 中参考上述文档重建。

---

**生成时间**: 2026-03-23
"""
    
    output_path = os.path.join(OUTPUT_DIR, 'design-source.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  已保存：{output_path}")
    
    return output_path

if __name__ == '__main__':
    # 确保输出目录存在
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 60)
    print("掼蛋大师 v3 - UI 设计稿 PNG 生成器")
    print("=" * 60)
    
    # 生成图片
    main_screen_path = generate_main_screen()
    game_screen_path = generate_game_screen()
    design_source_path = generate_design_source_link()
    
    print("=" * 60)
    print("生成完成!")
    print("=" * 60)
    print(f"\n交付物:")
    print(f"  1. {main_screen_path}")
    print(f"  2. {game_screen_path}")
    print(f"  3. {design_source_path}")
    print()
