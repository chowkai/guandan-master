#!/usr/bin/env python3
"""生成卡牌设计样例 PNG"""

from PIL import Image, ImageDraw, ImageFont

# 卡牌规格
CARD_WIDTH = 80
CARD_HEIGHT = 112
CORNER_RADIUS = 8

# 颜色
COLOR_BLACK = "#000000"
COLOR_RED = "#d32f2f"
COLOR_WHITE = "#ffffff"

# 花色映射
SUITS = {
    '♠': COLOR_BLACK,
    '♥': COLOR_RED,
    '♣': COLOR_BLACK,
    '♦': COLOR_RED,
}

def create_card(rank, suit, is_red=True):
    """创建单张卡牌"""
    # 创建卡牌图像（带阴影）
    card = Image.new('RGBA', (CARD_WIDTH + 10, CARD_HEIGHT + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    
    # 绘制白色背景（圆角矩形）
    draw.rounded_rectangle(
        [(5, 5), (CARD_WIDTH + 5, CARD_HEIGHT + 5)],
        radius=CORNER_RADIUS,
        fill=COLOR_WHITE,
        outline='#cccccc',
        width=1
    )
    
    # 颜色选择
    color = COLOR_RED if is_red else COLOR_BLACK
    
    try:
        # 尝试使用系统字体
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 48)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_medium = ImageFont.load_default()
    
    # 左上角：字 + 花（竖排，字在上，花在下）
    # 文字
    draw.text((13, 13), rank, fill=color, font=font_large, anchor='lt')
    # 花色（在文字下方）
    draw.text((13, 41), suit, fill=color, font=font_small, anchor='lt')
    
    # 中间花色：偏右下（给左上角留空间）
    # 中心点 (40, 56)，向右偏移 8px，向下偏移 4px → (48, 60)
    draw.text((48, 60), suit, fill=color, font=font_medium, anchor='mm')
    
    # 右下角：花 + 字（竖排，花在上，字在下，倒置）
    # 花色
    draw.text((CARD_WIDTH - 13, CARD_HEIGHT - 33), suit, fill=color, font=font_small, anchor='mm')
    # 文字（倒置）
    draw.text((CARD_WIDTH - 13, CARD_HEIGHT - 13), rank, fill=color, font=font_large, anchor='mm')
    
    return card

def create_joker(is_big=True):
    """创建 Joker 卡牌"""
    card = Image.new('RGBA', (CARD_WIDTH + 10, CARD_HEIGHT + 10), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    
    if is_big:
        # 大王：红色渐变
        bg_top = (255, 235, 235)  # #ffebee
        bg_bottom = (255, 205, 210)  # #ffcdd2
        border_color = "#d32f2f"
        text = "大王"
        icon = "👑"
    else:
        # 小王：蓝色渐变
        bg_top = (227, 242, 253)  # #e3f2fd
        bg_bottom = (187, 222, 251)  # #bbdefb
        border_color = "#1976d2"
        text = "小王"
        icon = "👤"
    
    # 绘制渐变背景
    for y in range(CARD_HEIGHT):
        ratio = y / CARD_HEIGHT
        r = int(bg_top[0] + (bg_bottom[0] - bg_top[0]) * ratio)
        g = int(bg_top[1] + (bg_bottom[1] - bg_top[1]) * ratio)
        b = int(bg_top[2] + (bg_bottom[2] - bg_top[2]) * ratio)
        draw.line([(5, 5 + y), (CARD_WIDTH + 5, 5 + y)], fill=(r, g, b, 255))
    
    # 绘制圆角矩形边框
    draw.rounded_rectangle(
        [(5, 5), (CARD_WIDTH + 5, CARD_HEIGHT + 5)],
        radius=CORNER_RADIUS,
        outline=border_color,
        width=2
    )
    
    try:
        font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    except:
        font_text = ImageFont.load_default()
    
    # 绘制图标（使用 emoji 或简单图形）
    # 由于 PIL 对 emoji 支持有限，使用文字代替
    draw.text((CARD_WIDTH // 2 + 5, CARD_HEIGHT // 2 - 10 + 5), icon, fill=border_color, 
              font=font_text, anchor='mm', font_size=60)
    
    # 绘制文字
    draw.text((CARD_WIDTH // 2 + 5, CARD_HEIGHT // 2 + 30 + 5), text, fill=border_color, 
              font=font_text, anchor='mm')
    
    return card

def main():
    # 创建卡牌样例（A/K/Q/J 四张牌）
    cards = [
        ('A', '♥', True),
        ('K', '♠', False),
        ('Q', '♦', True),
        ('J', '♣', False),
    ]
    
    # 创建横向排列的样例图
    sample_width = CARD_WIDTH + 10 + 20  # 卡牌 + 间距
    sample_height = CARD_HEIGHT + 10 + 60  # 卡牌 + 标注空间
    sample = Image.new('RGBA', (sample_width * 4, sample_height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(sample)
    
    try:
        font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        font_label = ImageFont.load_default()
    
    for i, (rank, suit, is_red) in enumerate(cards):
        card = create_card(rank, suit, is_red)
        x = i * sample_width + 5
        y = 5
        sample.paste(card, (x, y), card)
        
        # 添加标注
        label = f"{rank}{suit} - 左上角竖排 | 中间偏右下"
        draw.text((x + 40, CARD_HEIGHT + 25), label, fill="#333333", font=font_label, anchor='mm')
    
    # 保存
    sample.save('docs/design/exports/card-sample.png', 'PNG')
    print("✅ card-sample.png 已生成")
    
    # 创建 Joker 设计图
    joker_width = CARD_WIDTH + 10 + 20
    joker_height = CARD_HEIGHT + 10 + 40
    joker_sample = Image.new('RGBA', (joker_width * 2, joker_height), (255, 255, 255, 255))
    joker_draw = ImageDraw.Draw(joker_sample)
    
    # 小王
    small_joker = create_joker(is_big=False)
    joker_sample.paste(small_joker, (5, 5), small_joker)
    joker_draw.text((CARD_WIDTH // 2 + 10, CARD_HEIGHT + 25), "小王 - 蓝色渐变", fill="#1976d2", font=font_label, anchor='mm')
    
    # 大王
    big_joker = create_joker(is_big=True)
    joker_sample.paste(big_joker, (CARD_WIDTH + 25, 5), big_joker)
    joker_draw.text((CARD_WIDTH + 25 + CARD_WIDTH // 2 + 10, CARD_HEIGHT + 25), "大王 - 红色渐变", fill="#d32f2f", font=font_label, anchor='mm')
    
    # 保存
    joker_sample.save('docs/design/exports/joker-design.png', 'PNG')
    print("✅ joker-design.png 已生成")

if __name__ == '__main__':
    main()
