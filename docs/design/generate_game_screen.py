#!/usr/bin/env python3
"""生成游戏界面 PNG（v3.0，基于卡牌设计 v2.0）"""

from PIL import Image, ImageDraw, ImageFont

# 屏幕规格
SCREEN_WIDTH = 1920
SCREEN_HEIGHT = 1080

# 卡牌规格
CARD_WIDTH = 80
CARD_HEIGHT = 112

# 颜色
COLOR_BG_TOP = "#1a472a"
COLOR_BG_BOTTOM = "#2d5a3f"
COLOR_WHITE = "#ffffff"
COLOR_BLACK = "#000000"
COLOR_RED = "#d32f2f"
COLOR_GREEN = "#388e3c"
COLOR_BLUE = "#1976d2"
COLOR_YELLOW = "#fbc02d"

def create_gradient_background(width, height):
    """创建渐变背景"""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 解析颜色
    top_rgb = (26, 71, 42)   # #1a472a
    bottom_rgb = (45, 90, 63) # #2d5a3f
    
    for y in range(height):
        ratio = y / height
        r = int(top_rgb[0] + (bottom_rgb[0] - top_rgb[0]) * ratio)
        g = int(top_rgb[1] + (bottom_rgb[1] - top_rgb[1]) * ratio)
        b = int(top_rgb[2] + (bottom_rgb[2] - top_rgb[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    
    return img

def create_card_back():
    """创建卡牌背面"""
    card = Image.new('RGBA', (CARD_WIDTH, CARD_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    
    # 蓝色背景 + 花纹
    draw.rounded_rectangle([(0, 0), (CARD_WIDTH, CARD_HEIGHT)], radius=8, fill="#1976d2")
    draw.rounded_rectangle([(4, 4), (CARD_WIDTH-4, CARD_HEIGHT-4)], radius=6, outline="#ffffff", width=2)
    
    # 中心花纹（简单图案）
    draw.rectangle([(CARD_WIDTH//2-10, CARD_HEIGHT//2-10), (CARD_WIDTH//2+10, CARD_HEIGHT//2+10)], fill="#ffffff")
    
    return card

def create_card_face(rank, suit, is_red=True):
    """创建卡牌正面（简化版）"""
    card = Image.new('RGBA', (CARD_WIDTH, CARD_HEIGHT), (255, 255, 255, 255))
    draw = ImageDraw.Draw(card)
    
    # 白色背景 + 边框
    draw.rounded_rectangle([(0, 0), (CARD_WIDTH, CARD_HEIGHT)], radius=8, fill="#ffffff")
    draw.rounded_rectangle([(2, 2), (CARD_WIDTH-2, CARD_HEIGHT-2)], radius=6, outline="#cccccc", width=1)
    
    color = COLOR_RED if is_red else COLOR_BLACK
    
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
        font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_medium = ImageFont.load_default()
    
    # 左上角：字 + 花（竖排）
    draw.text((8, 8), rank, fill=color, font=font_large, anchor='lt')
    draw.text((8, 32), suit, fill=color, font=font_small, anchor='lt')
    
    # 中间：偏右下
    draw.text((CARD_WIDTH//2 + 8, CARD_HEIGHT//2 + 4), suit, fill=color, font=font_medium, anchor='mm')
    
    return card

def create_button(text, color, x, y, width=120, height=40):
    """创建按钮"""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 按钮背景（圆角矩形）
    draw.rounded_rectangle([(0, 0), (width, height)], radius=8, fill=color)
    draw.rounded_rectangle([(2, 2), (width-2, height-2)], radius=6, outline="#ffffff", width=2)
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        font = ImageFont.load_default()
    
    # 文字
    draw.text((width//2, height//2), text, fill="#ffffff", font=font, anchor='mm')
    
    return img

def main():
    # 创建背景
    screen = create_gradient_background(SCREEN_WIDTH, SCREEN_HEIGHT)
    draw = ImageDraw.Draw(screen)
    
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        font_normal = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        font_title = ImageFont.load_default()
        font_normal = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # === 顶部区域（对手信息）===
    # 半透明背景
    draw.rectangle([(0, 0), (SCREEN_WIDTH, 120)], fill=(0, 0, 0, 128))
    
    # 对手头像（占位）
    draw.ellipse([(60, 20), (120, 80)], fill="#666666")
    draw.text((90, 50), "👤", fill="#ffffff", font=font_normal, anchor='mm')
    
    # 对手昵称
    draw.text((140, 50), "对手玩家", fill="#ffffff", font=font_normal, anchor='lm')
    
    # 剩余牌数
    draw.text((SCREEN_WIDTH - 100, 50), "剩余牌数：15", fill=COLOR_YELLOW, font=font_normal, anchor='rm')
    
    # === 中央区域（游戏区）===
    # 牌堆（左侧）
    card_back = create_card_back()
    screen.paste(card_back, (200, 400), card_back)
    draw.text((240, 540), "牌堆", fill="#ffffff", font=font_small, anchor='mm')
    
    # 出牌区（中央）
    draw.rounded_rectangle([(700, 350), (1220, 730)], radius=16, outline="#ffffff", width=2)
    draw.text((960, 540), "出牌区", fill="#ffffff80", font=font_title, anchor='mm')
    
    # 示例出牌（3 张）
    card1 = create_card_face('5', '♥', True)
    card2 = create_card_face('5', '♦', True)
    card3 = create_card_face('5', '♣', False)
    screen.paste(card1, (850, 480), card1)
    screen.paste(card2, (910, 480), card2)
    screen.paste(card3, (970, 480), card3)
    
    # 最后出牌提示
    draw.rounded_rectangle([(850, 300), (1070, 340)], radius=8, fill=(0, 0, 0, 128))
    draw.text((960, 320), "上家：555", fill=COLOR_YELLOW, font=font_small, anchor='mm')
    
    # === 底部区域（玩家手牌）===
    # 半透明背景渐变
    for y in range(800, SCREEN_HEIGHT):
        ratio = (y - 800) / (SCREEN_HEIGHT - 800)
        alpha = int(128 * (1 - ratio))
        draw.line([(0, y), (SCREEN_WIDTH, y)], fill=(0, 0, 0, alpha))
    
    # 手牌（扇形排列）
    hand_cards = [
        ('3', '♠', False),
        ('4', '♥', True),
        ('6', '♦', True),
        ('7', '♣', False),
        ('9', '♥', True),
        ('10', '♠', False),
        ('J', '♦', True),
        ('Q', '♣', False),
        ('K', '♥', True),
        ('A', '♠', False),
        ('2', '♦', True),
        ('小王', '👤', False),  # 特殊处理
        ('大王', '👑', False),  # 特殊处理
    ]
    
    # 计算手牌位置（居中排列）
    num_cards = len(hand_cards)
    overlap = 20
    total_width = CARD_WIDTH + (num_cards - 1) * (CARD_WIDTH - overlap)
    start_x = (SCREEN_WIDTH - total_width) // 2
    hand_y = 850
    
    for i, (rank, suit, is_red) in enumerate(hand_cards):
        if rank in ['小王', '大王']:
            # Joker 卡牌（简化）
            card = Image.new('RGBA', (CARD_WIDTH, CARD_HEIGHT), (200, 200, 200, 255))
            card_draw = ImageDraw.Draw(card)
            card_draw.rounded_rectangle([(0, 0), (CARD_WIDTH, CARD_HEIGHT)], radius=8, fill="#e3f2fd" if rank == '小王' else "#ffebee")
            card_draw.text((CARD_WIDTH//2, CARD_HEIGHT//2), rank[0], fill=COLOR_BLUE if rank == '小王' else COLOR_RED, font=font_normal, anchor='mm')
        else:
            card = create_card_face(rank, suit, is_red)
        
        x = start_x + i * (CARD_WIDTH - overlap)
        # 轻微扇形效果
        y_offset = int(abs(i - num_cards//2) * 0.5)
        screen.paste(card, (x, hand_y - y_offset), card)
    
    # === 操作按钮区 ===
    button_y = hand_y + CARD_HEIGHT + 20
    button_start_x = (SCREEN_WIDTH - (120 * 3 + 16 * 2)) // 2
    
    # 提示按钮
    hint_btn = create_button("💡 提示", COLOR_BLUE, 0, 0)
    screen.paste(hint_btn, (button_start_x, button_y), hint_btn)
    
    # 出牌按钮
    play_btn = create_button("✅ 出牌", COLOR_GREEN, 0, 0)
    screen.paste(play_btn, (button_start_x + 120 + 16, button_y), play_btn)
    
    # 不出按钮
    pass_btn = create_button("❌ 不出", COLOR_RED, 0, 0)
    screen.paste(pass_btn, (button_start_x + (120 + 16) * 2, button_y), pass_btn)
    
    # === 标注（说明这是设计稿）===
    draw.rounded_rectangle([(20, SCREEN_HEIGHT - 30), (400, SCREEN_HEIGHT - 10)], radius=4, fill=(0, 0, 0, 128))
    draw.text((210, SCREEN_HEIGHT - 20), "游戏界面 UI v3.0 - 基于卡牌设计 v2.0 修正", fill="#ffffff80", font=font_small, anchor='mm')
    
    # 保存
    screen.save('docs/design/exports/game-screen-v2.png', 'PNG')
    print("✅ game-screen-v2.png 已生成")

if __name__ == '__main__':
    main()
