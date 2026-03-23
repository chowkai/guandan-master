#!/usr/bin/env python3
"""
掼蛋大师 v3 - 卡牌设计详解 PNG 生成器
生成标准扑克比例（1:1.4）的卡牌设计图，展示花字布局
尺寸：800px × 600px (放大展示)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 配置
CARD_WIDTH = 80
CARD_HEIGHT = 112  # 1:1.4 比例
SCALE = 3.0  # 放大 3 倍展示细节
OUTPUT_DIR = '/home/zhoukai/openclaw/workspace/projects/guandan/docs/design/exports'

# 颜色定义
COLORS = {
    'bg_light': '#f5f5f5',
    'bg_white': '#ffffff',
    'bg_selected': '#fff9c4',
    'card_border': '#e0e0e0',
    'card_border_selected': '#ffc107',
    'heart_red': '#d32f2f',
    'spade_black': '#212121',
    'text_black': '#000000',
    'text_gray': '#666666',
}

def get_font(size, bold=False):
    """获取字体（使用系统字体）"""
    font_paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/TTF/DejaVuSans.ttf',
    ]
    
    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    
    return ImageFont.load_default()

def draw_card_v3(draw, x, y, value, suit, is_red, selected=False, scale=1.0, show_annotations=False):
    """绘制 v3 版本扑克牌（标准比例 1:1.4）"""
    card_width = int(CARD_WIDTH * scale)
    card_height = int(CARD_HEIGHT * scale)
    
    # 牌背景
    bg_color = COLORS['bg_selected'] if selected else COLORS['bg_white']
    border_color = COLORS['card_border_selected'] if selected else COLORS['card_border']
    border_width = int(3 * scale) if selected else int(2 * scale)
    
    # 绘制牌面
    draw.rounded_rectangle(
        [x, y, x + card_width, y + card_height],
        radius=int(8 * scale),
        fill=bg_color,
        outline=border_color,
        width=border_width
    )
    
    # 颜色
    suit_color = COLORS['heart_red'] if is_red else COLORS['spade_black']
    
    # 字体大小
    corner_value_size = int(24 * scale)
    corner_suit_size = int(20 * scale)
    center_suit_size = int(40 * scale)
    
    font_value = get_font(corner_value_size, bold=True)
    font_suit = get_font(corner_suit_size)
    font_center = get_font(center_suit_size)
    
    # 左上角：字 + 花（竖排）
    corner_margin = int(8 * scale)
    draw.text((x + corner_margin, y + corner_margin), value, fill=suit_color, font=font_value)
    draw.text((x + corner_margin + 2, y + corner_margin + corner_value_size + int(2 * scale)), 
              suit, fill=suit_color, font=font_suit)
    
    # 中间：大花色图标
    center_x = x + card_width // 2
    center_y = y + card_height // 2
    draw.text((center_x - center_suit_size//2, center_y - center_suit_size//2), 
              suit, fill=suit_color, font=font_center)
    
    # 右下角：字 + 花（倒置竖排）
    # 需要旋转文字，这里简化处理：先绘制到临时图像再旋转
    corner_text = f"{suit}\n{value}"
    draw.text((x + card_width - corner_margin - corner_value_size, 
               y + card_height - corner_margin - corner_value_size * 2), 
              value, fill=suit_color, font=font_value)
    draw.text((x + card_width - corner_margin - corner_suit_size, 
               y + card_height - corner_margin - corner_suit_size - int(2 * scale)), 
              suit, fill=suit_color, font=font_suit)
    
    # 标注（如果启用）
    if show_annotations:
        annotation_font = get_font(int(14 * scale))
        annotation_color = '#1976d2'
        
        # 左上角标注
        draw.line([(x - 10, y + corner_margin), (x - 30, y + corner_margin)], fill=annotation_color, width=2)
        draw.text((x - 180, y + corner_margin), "左上角：字 + 花（竖排）", fill=annotation_color, font=annotation_font)
        
        # 中间标注
        draw.line([(center_x, center_y), (center_x, center_y + 50)], fill=annotation_color, width=2)
        draw.text((center_x - 80, center_y + 55), "中间：大花色", fill=annotation_color, font=annotation_font)
        
        # 右下角标注
        draw.line([(x + card_width + 10, y + card_height - corner_margin), 
                   (x + card_width + 30, y + card_height - corner_margin)], fill=annotation_color, width=2)
        draw.text((x + card_width + 40, y + card_height - corner_margin - 20), 
                  "右下角：倒置", fill=annotation_color, font=annotation_font)

def generate_card_design():
    """生成卡牌设计详解 PNG"""
    print("生成卡牌设计详解图...")
    
    # 创建图像（放大展示）
    width = 900
    height = 650
    img = Image.new('RGB', (width, height), COLORS['bg_light'])
    draw = ImageDraw.Draw(img)
    
    # 标题
    title_font = get_font(36, bold=True)
    subtitle_font = get_font(20)
    draw.text((width // 2 - 200, 20), "掼蛋大师 v3 - 卡牌设计规范", fill=COLORS['text_black'], font=title_font)
    draw.text((width // 2 - 150, 60), "标准扑克比例 1:1.4（80px × 112px）", fill=COLORS['text_gray'], font=subtitle_font)
    
    # 绘制三张示例牌
    scale = 3.0  # 放大 3 倍
    
    # 1. 红桃 A（左侧）
    card1_x = 80
    card1_y = 150
    draw_card_v3(draw, card1_x, card1_y, 'A', '♥', True, scale=scale, show_annotations=True)
    
    # 标注文字
    label_font = get_font(20, bold=True)
    draw.text((card1_x + 20, card1_y + CARD_HEIGHT * scale + 20), "红桃 A", fill=COLORS['heart_red'], font=label_font)
    
    # 2. 黑桃 K（中间）
    card2_x = 350
    card2_y = 150
    draw_card_v3(draw, card2_x, card2_y, 'K', '♠', False, scale=scale, show_annotations=False)
    
    draw.text((card2_x + 20, card2_y + CARD_HEIGHT * scale + 20), "黑桃 K", fill=COLORS['spade_black'], font=label_font)
    
    # 3. 方片 Q（右侧，选中状态）
    card3_x = 620
    card3_y = 150
    draw_card_v3(draw, card3_x, card3_y, 'Q', '♦', True, selected=True, scale=scale, show_annotations=False)
    
    draw.text((card3_x + 20, card3_y + CARD_HEIGHT * scale + 20), "方片 Q（选中）", fill=COLORS['heart_red'], font=label_font)
    
    # 绘制布局说明
    spec_y = 520
    spec_font = get_font(16)
    spec_title_font = get_font(18, bold=True)
    
    draw.text((50, spec_y), "花字布局规范:", fill=COLORS['text_black'], font=spec_title_font)
    
    specs = [
        "左上角：字 (24px) + 花 (20×20px) 竖排 | 距左边距 8px, 距上边距 8px",
        "中  间：大花色图标 (40×40px) | 正中央",
        "右下角：字 (24px) + 花 (20×20px) 倒置竖排 | 距右边距 8px, 距下边距 8px",
        "牌间距：12px（手牌区）| 选中偏移：30px（向上）",
    ]
    
    for i, spec in enumerate(specs):
        draw.text((50, spec_y + 30 + i * 25), spec, fill=COLORS['text_gray'], font=spec_font)
    
    # 保存
    output_path = os.path.join(OUTPUT_DIR, 'card-design.png')
    img.save(output_path, 'PNG')
    print(f"  已保存：{output_path}")
    
    return output_path

def generate_game_screen_v3():
    """生成游戏界面 PNG（v3 版本 - 标准扑克比例卡牌）"""
    print("生成游戏界面 v3...")
    
    # 创建图像
    WIDTH = 750
    HEIGHT = 1334
    img = Image.new('RGB', (WIDTH, HEIGHT), '#1a472a')
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
    draw.text((WIDTH - 180, 25), "第 3 局", fill='#ffffff', font=font_small)
    draw.text((WIDTH - 150, 50), "2 : 1", fill='#ffffff', font=font_medium)
    
    # 2. 对家信息区
    opponent_y = 110
    draw.rounded_rectangle([WIDTH//2 - 120, opponent_y, WIDTH//2 + 120, opponent_y + 70],
                          radius=10, fill='#f0f0f0', outline='#2d5a3f', width=2)
    
    # AI 头像
    draw.ellipse([WIDTH//2 - 100, opponent_y + 15, WIDTH//2 - 60, opponent_y + 55], fill='#8B4513')
    draw.text((WIDTH//2 - 92, opponent_y + 23), "🦉", font=get_font(24))
    draw.text((WIDTH//2 - 50, opponent_y + 20), "对家 AI", fill='#000000', font=font_medium)
    
    # 剩 6 张角标
    draw.ellipse([WIDTH//2 + 70, opponent_y + 15, WIDTH//2 + 100, opponent_y + 45], fill='#ffc107')
    draw.text((WIDTH//2 + 78, opponent_y + 20), "🔔", font=get_font(24))
    
    # 3. 出牌区域
    play_area_y = 210
    
    # 第 8 轮（展开）
    draw.rounded_rectangle([WIDTH//2 - 300, play_area_y, WIDTH//2 + 300, play_area_y + 140],
                          radius=14, fill='#333333', outline='#ffc107', width=3)
    draw.text((WIDTH//2 - 280, play_area_y + 15), "第 8 轮  |  上家：同花顺  ▼", fill='#ffffff', font=font_small)
    
    # 出的牌（5 张同花顺）- v3 小卡牌比例 50×70px
    cards_x = WIDTH//2 - 180
    cards_y = play_area_y + 50
    for i, (value, suit, is_red) in enumerate([('A','♠',False), ('K','♠',False), ('Q','♠',False), ('J','♠',False), ('10','♠',False)]):
        # 小卡牌
        card_w, card_h = 50, 70
        draw.rounded_rectangle([cards_x + i * 65, cards_y, cards_x + i * 65 + card_w, cards_y + card_h],
                              radius=6, fill='#ffffff', outline='#e0e0e0', width=1)
        suit_color = '#d32f2f' if is_red else '#212121'
        draw.text((cards_x + i * 65 + 4, cards_y + 4), value, fill=suit_color, font=get_font(14, bold=True))
        draw.text((cards_x + i * 65 + card_w//2 - 10, cards_y + card_h//2 - 12), suit, fill=suit_color, font=get_font(24))
    
    # 第 7 轮（折叠）
    round2_y = play_area_y + 155
    draw.rounded_rectangle([WIDTH//2 - 300, round2_y, WIDTH//2 + 300, round2_y + 55],
                          radius=10, fill='#333333', outline='#2d5a3f', width=1)
    draw.text((WIDTH//2 - 280, round2_y + 18), "第 7 轮  |  对家：炸弹  ▶", fill='#ffffff', font=font_small)
    
    # 4. 上家/下家信息区
    left_y = 480
    draw.ellipse([30, left_y, 70, left_y + 40], fill='#FF6B35')
    draw.text((38, left_y + 8), "🦅", font=get_font(24))
    draw.text((80, left_y + 10), "上家 AI", fill='#ffffff', font=font_medium)
    
    right_y = 550
    draw.ellipse([30, right_y, 70, right_y + 40], fill='#FFA500')
    draw.text((38, right_y + 8), "🦊", font=get_font(24))
    draw.text((80, right_y + 10), "下家 AI", fill='#ffffff', font=font_medium)
    
    # 5. 手牌区域（v3 - 卡牌高度 112px）
    hand_area_y = 630
    draw.rounded_rectangle([20, hand_area_y, WIDTH - 20, hand_area_y + 180],
                          radius=12, fill='#224433')
    
    # 绘制手牌（13 张示例）- v3 标准比例 80×112px
    cards_start_x = 40
    cards_y = hand_area_y + 35
    hand_cards = [
        ('A','♠',False), ('K','♠',False), ('Q','♥',True), ('J','♦',True),
        ('10','♣',False), ('9','♠',False), ('8','♥',True), ('7','♦',True),
        ('6','♣',False), ('5','♠',False), ('4','♥',True), ('3','♦',True),
        ('🃏','',False)
    ]
    
    for i, (value, suit, is_red) in enumerate(hand_cards):
        card_w, card_h = 80, 112  # v3 标准比例
        x_offset = cards_start_x + i * 92  # 80 + 12px 间距
        y_offset = cards_y - 30 if i in [1, 2] else cards_y  # 选中偏移 30px
        
        # 牌背景
        bg_color = '#fff9c4' if i in [1, 2] else '#ffffff'
        border_color = '#ffc107' if i in [1, 2] else '#e0e0e0'
        draw.rounded_rectangle([x_offset, y_offset, x_offset + card_w, y_offset + card_h],
                              radius=8, fill=bg_color, outline=border_color, width=3 if i in [1, 2] else 2)
        
        # 花色颜色
        actual_suit = suit if suit else '🃏'
        suit_color = '#d32f2f' if (is_red or value == '🃏') else '#212121'
        
        # 左上角
        draw.text((x_offset + 8, y_offset + 8), value, fill=suit_color, font=get_font(24, bold=True))
        if suit:
            draw.text((x_offset + 10, y_offset + 34), suit, fill=suit_color, font=get_font(20))
        
        # 中间
        draw.text((x_offset + card_w//2 - 20, y_offset + card_h//2 - 20), actual_suit, fill=suit_color, font=get_font(40))
        
        # 右下角
        draw.text((x_offset + card_w - 32, y_offset + card_h - 32), value, fill=suit_color, font=get_font(24, bold=True))
        if suit:
            draw.text((x_offset + card_w - 30, y_offset + card_h - 58), suit, fill=suit_color, font=get_font(20))
    
    # 6. 操作按钮区
    btn_area_y = 850
    btn_width = 100
    btn_height = 60
    
    for i, btn_text in enumerate(['提示', '出牌', '撤销']):
        btn_x = WIDTH//2 - 180 + i * (btn_width + 20)
        draw.rounded_rectangle([btn_x, btn_area_y, btn_x + btn_width, btn_area_y + btn_height],
                              radius=10, fill='#1a472a', outline='#2d5a3f', width=2)
        draw.text((btn_x + 25, btn_area_y + 18), btn_text, fill='#ffffff', font=font_medium)
    
    # 7. 底部指示条
    draw.line([(WIDTH//2 - 50, HEIGHT - 30), (WIDTH//2 + 50, HEIGHT - 30)], fill='#ffffff', width=4)
    
    # v3 标识
    draw.text((WIDTH - 100, HEIGHT - 60), "v3.0", fill='#ffffff', font=get_font(20, bold=True))
    
    # 保存
    output_path = os.path.join(OUTPUT_DIR, 'game-screen-v2.png')
    img.save(output_path, 'PNG')
    print(f"  已保存：{output_path}")
    
    return output_path

if __name__ == '__main__':
    # 确保输出目录存在
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 生成图片
    generate_card_design()
    generate_game_screen_v3()
    
    print("\n✅ 所有图片生成完成!")
