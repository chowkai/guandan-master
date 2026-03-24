#!/usr/bin/env python3
"""
掼蛋大师 v5 - 游戏界面 UI 设计稿 PNG 生成器
生成游戏界面的高保真设计稿 PNG 图片（手牌区优化 - 多列网格布局）
尺寸：750px × 1334px (微信小程序标准)

v5.0 变更：
- 手牌区：多列网格布局（5 列×6 行）
- 所有牌同时可见，无需滚动
- 直接点击选牌，操作简化
- 符合理牌习惯（同花色一列）
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 配置
WIDTH = 750
HEIGHT = 1334
OUTPUT_DIR = '/home/zhoukai/openclaw/workspace/docs/design/exports'

# 颜色定义
COLORS = {
    'bg_dark_green': '#1a472a',
    'bg_light_green': '#2d5a3f',
    'bg_white': '#ffffff',
    'text_white': '#ffffff',
    'text_black': '#000000',
    'text_gray': '#666666',
    'highlight_yellow': '#ffc107',
    'spade_black': '#000000',
    'heart_red': '#d32f2f',
}

def get_font(size, bold=False):
    """获取字体"""
    font_paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    ]
    
    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    
    return ImageFont.load_default()

def draw_card(draw, x, y, value, suit, is_red=False, selected=False, scale=1.0):
    """绘制扑克牌"""
    card_width = int(60 * scale)
    card_height = int(84 * scale)
    
    bg_color = '#fff9c4' if selected else '#ffffff'
    border_color = '#ffc107' if selected else '#e0e0e0'
    border_width = 3 if selected else 1
    
    draw.rounded_rectangle(
        [x, y, x + card_width, y + card_height],
        radius=int(6 * scale),
        fill=bg_color,
        outline=border_color,
        width=border_width
    )
    
    suit_color = COLORS['heart_red'] if is_red else COLORS['spade_black']
    
    if value != 'JOKER':
        font_value = get_font(int(18 * scale))
        font_suit = get_font(int(14 * scale))
        draw.text((x + 6, y + 6), value, fill=suit_color, font=font_value)
        draw.text((x + 6, y + 6 + int(18 * scale)), suit, fill=suit_color, font=font_suit)
        
        font_large = get_font(int(30 * scale))
        draw.text((x + card_width//2 - int(15 * scale), y + card_height//2 - int(15 * scale)), 
                  suit, fill=suit_color, font=font_large)
    else:
        font_large = get_font(int(24 * scale))
        joker_text = "大王" if is_red else "小王"
        draw.text((x + card_width//2 - 12, y + card_height//2 - 12), joker_text, fill=suit_color, font=font_large)

def draw_ai_avatar(draw, x, y, emoji, bg_color, size=40):
    """绘制 AI 头像"""
    draw.ellipse([x, y, x + size, y + size], fill=bg_color, outline='#ffffff', width=2)
    font = get_font(int(size * 0.6))
    draw.text((x + size//2 - 12, y + size//2 - 12), emoji, fill='#ffffff', font=font)

def draw_player_card(draw, x, y, emoji, emoji_bg, name, remaining_cards, is_low_cards=False):
    """绘制玩家信息卡片"""
    card_width = 120
    card_height = 70
    
    bg_color = '#f0f0f0'
    border_color = COLORS['highlight_yellow'] if is_low_cards else '#2d5a3f'
    border_width = 2 if is_low_cards else 1
    
    draw.rounded_rectangle(
        [x, y, x + card_width, y + card_height],
        radius=8,
        fill=bg_color,
        outline=border_color,
        width=border_width
    )
    
    draw_ai_avatar(draw, x + 10, y + 10, emoji, emoji_bg, size=35)
    
    font_name = get_font(16, bold=True)
    font_remaining = get_font(14)
    draw.text((x + 50, y + 15), name, fill=COLORS['text_black'], font=font_name)
    draw.text((x + 50, y + 35), f"剩{remaining_cards}张", fill=COLORS['text_gray'], font=font_remaining)

def draw_hand_grid(draw, start_x, start_y, hand_cards, selected_indices=None):
    """绘制手牌网格（5 列×6 行）"""
    if selected_indices is None:
        selected_indices = []
    
    columns = {
        '♠': [],
        '♥': [],
        '♦': [],
        '♣': [],
        'JOKER': []
    }
    
    for card in hand_cards:
        value, suit, is_red = card
        if value == 'JOKER':
            columns['JOKER'].append(card)
        else:
            columns[suit].append(card)
    
    card_order = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3']
    for suit in columns:
        columns[suit].sort(key=lambda c: card_order.index(c[0]) if c[0] in card_order else 999)
    
    column_headers = ['♠', '♥', '♦', '♣', '🃏']
    column_colors = [COLORS['spade_black'], COLORS['heart_red'], COLORS['heart_red'], 
                     COLORS['spade_black'], COLORS['highlight_yellow']]
    
    card_width = 60
    card_height = 84
    col_spacing = 12
    row_spacing = -15
    
    for i, header in enumerate(column_headers):
        header_x = start_x + i * (card_width + col_spacing)
        header_y = start_y - 25
        
        draw.rounded_rectangle(
            [header_x - 5, header_y - 18, header_x + card_width + 5, header_y + 5],
            radius=4,
            fill='#2d5a3f',
            outline=column_colors[i],
            width=1
        )
        
        font = get_font(16)
        draw.text((header_x + (card_width - 10)//2, header_y - 16), 
                  header, fill=COLORS['text_white'], font=font)
    
    for col_idx, (suit, cards) in enumerate(columns.items()):
        col_x = start_x + col_idx * (card_width + col_spacing)
        
        for row_idx, card in enumerate(cards):
            if row_idx >= 6:
                break
            
            value, card_suit, is_red = card
            card_y = start_y + row_idx * (card_height + row_spacing)
            
            card_index = hand_cards.index(card)
            selected = card_index in selected_indices
            
            draw_card(draw, col_x, card_y, value, card_suit if card_suit else '🃏', 
                     is_red or value == 'JOKER', selected, scale=1.0)

def generate_game_screen_v5():
    """生成游戏界面 PNG（v5 版本 - 手牌区网格布局）"""
    print("生成游戏界面 v5（手牌区网格布局）...")
    
    img = Image.new('RGB', (WIDTH, HEIGHT), COLORS['bg_dark_green'])
    draw = ImageDraw.Draw(img)
    
    font_small = get_font(18)
    font_medium = get_font(24, bold=True)
    
    # 1. 顶部信息栏
    top_bar_height = 70
    draw.rectangle([0, 0, WIDTH, top_bar_height], fill='#1a472a')
    
    draw.rounded_rectangle([15, 15, 60, 60], radius=8, fill='#4a6a5a')
    draw.text((28, 20), "⏸", fill=COLORS['text_white'], font=get_font(28))
    
    draw.text((WIDTH - 140, 20), "第 3 局", fill=COLORS['text_white'], font=font_small)
    draw.text((WIDTH - 120, 42), "2 : 1", fill=COLORS['text_white'], font=font_medium)
    
    # 2. 对家信息区
    opponent_y = 85
    draw_player_card(draw, WIDTH//2 - 100, opponent_y, "🦉", '#8B4513', "对家 AI", 8, is_low_cards=True)
    
    # 3. 出牌区域
    play_area_y = 170
    draw.rounded_rectangle([WIDTH//2 - 240, play_area_y, WIDTH//2 + 240, play_area_y + 110],
                          radius=12, fill='#333333', outline=COLORS['highlight_yellow'], width=2)
    
    draw.text((WIDTH//2 - 220, play_area_y + 12), "第 8 轮 | 上家：同花顺", 
              fill=COLORS['text_white'], font=font_small)
    
    cards_x = WIDTH//2 - 150
    cards_y = play_area_y + 40
    for i, (value, suit, is_red) in enumerate([('A','♠',False), ('K','♠',False), ('Q','♠',False), ('J','♠',False), ('10','♠',False)]):
        draw_card(draw, cards_x + i * 60, cards_y, value, suit, is_red, scale=0.5)
    
    # 4. 上家/下家信息区
    left_player_y = 520
    right_player_y = 520
    
    draw_player_card(draw, 15, left_player_y, "🦅", '#FF6B35', "上家 AI", 12, is_low_cards=False)
    draw_player_card(draw, WIDTH - 135, right_player_y, "🦊", '#FFA500', "下家 AI", 10, is_low_cards=False)
    
    # 5. 手牌区域（v5.0 核心变更 - 多列网格布局）
    hand_area_y = 680
    grid_start_x = WIDTH//2 - 180
    grid_start_y = hand_area_y
    
    draw.rounded_rectangle([grid_start_x - 15, grid_start_y - 30, 
                           grid_start_x + 5 * 72 + 3, grid_start_y + 6 * 69 - 15],
                          radius=10, fill='#224433', outline='#3d6a53', width=2)
    
    hand_cards = [
        ('A','♠',False), ('K','♠',False), ('Q','♠',False), ('J','♠',False),
        ('A','♥',True), ('K','♥',True), ('Q','♥',True), ('J','♥',True), ('10','♥',True),
        ('A','♦',True), ('K','♦',True), ('Q','♦',True), ('J','♦',True), ('10','♦',True),
        ('A','♣',False), ('K','♣',False), ('Q','♣',False), ('J','♣',False),
        ('JOKER','',True), ('JOKER','',False),
    ]
    
    selected_indices = [4, 5]
    
    draw_hand_grid(draw, grid_start_x, grid_start_y, hand_cards, selected_indices)
    
    # 6. 操作按钮区
    btn_area_y = hand_area_y + 6 * 69 + 20
    btn_width = 90
    btn_height = 50
    btn_spacing = 15
    
    btn1_x = WIDTH//2 - btn_width - btn_spacing - btn_width//2
    btn2_x = WIDTH//2 - btn_width//2
    btn3_x = WIDTH//2 + btn_spacing + btn_width//2
    
    draw.rounded_rectangle([btn1_x, btn_area_y, btn1_x + btn_width, btn_area_y + btn_height],
                          radius=8, fill='#1976d2', outline='#42a5f5', width=2)
    draw.text((btn1_x + 15, btn_area_y + 15), "💡提示", fill=COLORS['text_white'], font=get_font(18))
    
    draw.rounded_rectangle([btn2_x, btn_area_y, btn2_x + btn_width, btn_area_y + btn_height],
                          radius=8, fill='#388e3c', outline=COLORS['highlight_yellow'], width=2)
    draw.text((btn2_x + 15, btn_area_y + 15), "✅出牌", fill=COLORS['text_white'], font=get_font(18))
    
    draw.rounded_rectangle([btn3_x, btn_area_y, btn3_x + btn_width, btn_area_y + btn_height],
                          radius=8, fill='#d32f2f', outline='#ef5350', width=2)
    draw.text((btn3_x + 15, btn_area_y + 15), "❌不出", fill=COLORS['text_white'], font=get_font(18))
    
    # 7. 底部指示条
    draw.rectangle([WIDTH//2 - 40, HEIGHT - 25, WIDTH//2 + 40, HEIGHT - 18], 
                   fill='#6a8a7a', outline=None)
    
    output_path = os.path.join(OUTPUT_DIR, 'game-screen-v4.png')
    img.save(output_path, 'PNG')
    print(f"  已保存：{output_path}")
    
    return output_path

if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 60)
    print("掼蛋大师 v5 - 游戏界面 UI 设计稿 PNG 生成器")
    print("=" * 60)
    print("\nv5.0 变更:")
    print("  - 手牌区：多列网格布局（5 列×6 行）")
    print("  - 所有牌同时可见，无需滚动")
    print("  - 直接点击选牌，操作简化")
    print("=" * 60)
    
    game_screen_path = generate_game_screen_v5()
    
    print("=" * 60)
    print("生成完成!")
    print("=" * 60)
    print(f"\n交付物:")
    print(f"  1. {game_screen_path}")
    print()
