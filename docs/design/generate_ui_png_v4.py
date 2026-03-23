#!/usr/bin/env python3
"""
掼蛋大师 v4 - 游戏界面 UI 设计稿 PNG 生成器
生成游戏界面的高保真设计稿 PNG 图片（修正玩家布局）
尺寸：750px × 1334px (微信小程序标准)

v4.0 变更：
- 上家：移至左部中央（垂直居中）
- 下家：移至右部中央（垂直居中）
- 对家：保持上部中央
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
    'text_gray': '#666666',
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
    """绘制扑克牌（v3.0 标准扑克比例 1:1.4）"""
    card_width = int(80 * scale)
    card_height = int(112 * scale)  # v3.0: 标准比例 1:1.4
    
    # 牌背景
    bg_color = '#fff9c4' if selected else '#ffffff'
    border_color = '#ffc107' if selected else '#e0e0e0'
    border_width = 3 if selected else 1
    
    # 绘制牌面
    draw.rounded_rectangle(
        [x, y, x + card_width, y + card_height],
        radius=int(8 * scale),
        fill=bg_color,
        outline=border_color,
        width=border_width
    )
    
    # 绘制牌值和花色
    suit_color = COLORS['heart_red'] if is_red else COLORS['spade_black']
    
    if value != '🃏':
        # 左上角（字 + 花竖排）
        font_value = get_font(int(24 * scale))
        font_suit = get_font(int(20 * scale))
        draw.text((x + 8, y + 8), value, fill=suit_color, font=font_value)
        draw.text((x + 8, y + 8 + int(24 * scale)), suit, fill=suit_color, font=font_suit)
        
        # 中间花色
        font_large = get_font(int(40 * scale))
        draw.text((x + card_width//2 - int(20 * scale), y + card_height//2 - int(20 * scale)), 
                  suit, fill=suit_color, font=font_large)
        
        # 右下角（倒置）
        draw.text((x + card_width - int(32 * scale), y + card_height - int(56 * scale)), 
                  value, fill=suit_color, font=font_value)
        draw.text((x + card_width - int(32 * scale), y + card_height - int(32 * scale)), 
                  suit, fill=suit_color, font=font_suit)
    else:
        # 王
        font_large = get_font(int(40 * scale))
        draw.text((x + card_width//2 - 20, y + card_height//2 - 20), '🃏', fill=suit_color, font=font_large)

def draw_ai_avatar(draw, x, y, emoji, bg_color, size=40):
    """绘制 AI 头像"""
    # 圆形背景
    draw.ellipse([x, y, x + size, y + size], fill=bg_color, outline='#ffffff', width=2)
    
    # Emoji
    font = get_font(int(size * 0.6))
    draw.text((x + size//2 - 12, y + size//2 - 12), emoji, fill='#ffffff', font=font)

def draw_player_card(draw, x, y, emoji, emoji_bg, name, remaining_cards, is_low_cards=False):
    """绘制玩家信息卡片（v4.0 样式）"""
    card_width = 140
    card_height = 80
    
    # 背景（PIL 不支持 rgba，使用纯色）
    bg_color = '#f0f0f0'  # 浅灰色背景
    if is_low_cards:
        border_color = COLORS['highlight_yellow']
        border_width = 2
    else:
        border_color = '#2d5a3f'
        border_width = 1
    
    draw.rounded_rectangle(
        [x, y, x + card_width, y + card_height],
        radius=8,
        fill=bg_color,
        outline=border_color,
        width=border_width
    )
    
    # 头像
    draw_ai_avatar(draw, x + 12, y + 12, emoji, emoji_bg, size=40)
    
    # 名称
    font_name = get_font(20, bold=True)
    draw.text((x + 60, y + 18), name, fill=COLORS['text_black'], font=font_name)
    
    # 剩余牌数
    font_remaining = get_font(16)
    draw.text((x + 60, y + 42), f"剩{remaining_cards}张", fill=COLORS['text_gray'], font=font_remaining)

def generate_game_screen_v4():
    """生成游戏界面 PNG（v4 版本 - 修正玩家布局）"""
    print("生成游戏界面 v4（修正玩家布局）...")
    
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
    
    # 2. 对家信息区（上部中央 - 位置不变）
    opponent_y = 110
    draw_player_card(
        draw, 
        WIDTH//2 - 120, opponent_y, 
        "🦉", '#8B4513',  # 猫头鹰 - 保守型
        "对家 AI", 8, 
        is_low_cards=True  # 剩 6 张高亮
    )
    
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
    
    # 4. 上家/下家信息区（v4.0 核心变更 - 左右两侧）
    # 上家（左部中央 - 垂直居中）
    left_player_y = 600  # 垂直居中位置
    draw_player_card(
        draw,
        20, left_player_y,  # 距左边缘 20px
        "🦅", '#FF6B35',  # 老鹰 - 激进型
        "上家 AI", 12,
        is_low_cards=False
    )
    
    # 下家（右部中央 - 垂直居中）
    right_player_y = 600  # 垂直居中位置（与上家对称）
    draw_player_card(
        draw,
        WIDTH - 160, right_player_y,  # 距右边缘 20px
        "🦊", '#FFA500',  # 狐狸 - 平衡型
        "下家 AI", 10,
        is_low_cards=False
    )
    
    # 5. 手牌区域（v3.0 标准扑克比例）
    hand_area_y = 780
    draw.rounded_rectangle([20, hand_area_y, WIDTH - 20, hand_area_y + 180],
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
    btn_area_y = 990
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
    output_path = os.path.join(OUTPUT_DIR, 'game-screen-v3.png')
    img.save(output_path, 'PNG')
    print(f"  已保存：{output_path}")
    
    return output_path

if __name__ == '__main__':
    # 确保输出目录存在
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 60)
    print("掼蛋大师 v4 - 游戏界面 UI 设计稿 PNG 生成器")
    print("=" * 60)
    print("\nv4.0 变更:")
    print("  - 上家：移至左部中央（垂直居中）")
    print("  - 下家：移至右部中央（垂直居中）")
    print("  - 对家：保持上部中央")
    print("=" * 60)
    
    # 生成图片
    game_screen_path = generate_game_screen_v4()
    
    print("=" * 60)
    print("生成完成!")
    print("=" * 60)
    print(f"\n交付物:")
    print(f"  1. {game_screen_path}")
    print()
