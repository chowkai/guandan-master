#!/usr/bin/env python3
"""
掼蛋大师 - 卡牌生成脚本
风格：方案 A - 典雅中国风
设计师：画虾
日期：2026-03-20
"""

import os
from pathlib import Path

# 配色方案 (方案 A - 典雅中国风)
COLORS = {
    'bg': '#F5F0E6',        # 米白 - 卡牌背景
    'border': '#D4AF37',    # 金色 - 边框
    'border_inner': '#C41E3A',  # 朱红 - 内边框
    'red': '#C41E3A',       # 朱红 - 红桃/方块
    'black': '#1A1A1A',     # 墨黑 - 黑桃
    'green': '#2E8B57',     # 青绿 - 草花
    'gold': '#D4AF37',      # 金色 - 装饰
}

# 卡牌尺寸 (@2x Retina)
CARD_WIDTH = 200
CARD_HEIGHT = 280

# 花色定义
SUITS = {
    'hearts': {'symbol': '♥', 'color': COLORS['red'], 'name': '红桃'},
    'diamonds': {'symbol': '♦', 'color': COLORS['red'], 'name': '方块'},
    'clubs': {'symbol': '♣', 'color': COLORS['green'], 'name': '草花'},
    'spades': {'symbol': '♠', 'color': COLORS['black'], 'name': '黑桃'},
}

# 牌面值
CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

def generate_card_svg(value, suit, is_joker=False, joker_type=None):
    """生成单张卡牌的 SVG 内容"""
    
    if is_joker:
        return generate_joker_svg(joker_type)
    
    suit_info = SUITS[suit]
    color = suit_info['color']
    symbol = suit_info['symbol']
    
    # 中央图案 (根据牌面值调整)
    if value in ['J', 'Q', 'K']:
        center_content = generate_face_card_art(value, symbol, color)
    elif value == 'A':
        center_content = f'<text x="100" y="165" font-family="Arial" font-size="80" fill="{color}" text-anchor="middle">{symbol}</text>'
    else:
        center_content = generate_number_card_art(value, symbol, color)
    
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{CARD_WIDTH}" height="{CARD_HEIGHT}" viewBox="0 0 {CARD_WIDTH} {CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- 掼蛋大师 - {suit_info['name']}{value} - 典雅中国风 -->
  
  <!-- 卡牌背景 -->
  <rect x="5" y="5" width="{CARD_WIDTH-10}" height="{CARD_HEIGHT-10}" rx="15" fill="{COLORS['bg']}" stroke="{COLORS['border']}" stroke-width="2"/>
  
  <!-- 传统纹样边框 (简化云纹) -->
  <rect x="12" y="12" width="{CARD_WIDTH-24}" height="{CARD_HEIGHT-24}" rx="10" fill="none" stroke="{COLORS['border_inner']}" stroke-width="1" stroke-dasharray="5,3"/>
  
  <!-- 左上角点数 -->
  <text x="25" y="45" font-family="Noto Serif SC, serif" font-size="28" fill="{color}" font-weight="bold">{value}</text>
  <text x="25" y="70" font-family="Arial" font-size="20" fill="{color}">{symbol}</text>
  
  <!-- 右上角点数 (倒置) -->
  <text x="175" y="235" font-family="Noto Serif SC, serif" font-size="28" fill="{color}" font-weight="bold" transform="rotate(180 175 235)">{value}</text>
  <text x="175" y="210" font-family="Arial" font-size="20" fill="{color}" transform="rotate(180 175 210)">{symbol}</text>
  
  <!-- 中央图案 -->
  {center_content}
  
  <!-- 装饰性角花 (四角) -->
  <path d="M 15 15 L 25 15 L 25 20 L 20 20 L 20 25 L 15 25 Z" fill="{COLORS['gold']}" opacity="0.6"/>
  <path d="M 185 15 L 175 15 L 175 20 L 180 20 L 180 25 L 185 25 Z" fill="{COLORS['gold']}" opacity="0.6"/>
  <path d="M 15 265 L 25 265 L 25 260 L 20 260 L 20 255 L 15 255 Z" fill="{COLORS['gold']}" opacity="0.6"/>
  <path d="M 185 265 L 175 265 L 175 260 L 180 260 L 180 255 L 185 255 Z" fill="{COLORS['gold']}" opacity="0.6"/>
</svg>'''
    
    return svg

def generate_number_card_art(value, symbol, color):
    """生成数字牌的中央图案 (2-10)"""
    
    # 根据数字决定图案排列
    num = int(value)
    
    if num == 2:
        # 2 个符号 - 上下排列
        return f'''<text x="100" y="110" font-family="Arial" font-size="60" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="100" y="200" font-family="Arial" font-size="60" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    elif num == 3:
        # 3 个符号 - 三角形排列
        return f'''<text x="100" y="95" font-family="Arial" font-size="55" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="70" y="165" font-family="Arial" font-size="55" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="130" y="165" font-family="Arial" font-size="55" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    elif num == 4:
        # 4 个符号 - 四角排列
        return f'''<text x="70" y="110" font-family="Arial" font-size="50" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="130" y="110" font-family="Arial" font-size="50" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="70" y="200" font-family="Arial" font-size="50" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="130" y="200" font-family="Arial" font-size="50" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    elif num == 5:
        # 5 个符号 - 四角 + 中央
        return f'''<text x="70" y="100" font-family="Arial" font-size="48" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="130" y="100" font-family="Arial" font-size="48" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="100" y="150" font-family="Arial" font-size="48" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="70" y="200" font-family="Arial" font-size="48" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="130" y="200" font-family="Arial" font-size="48" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    elif num == 6:
        # 6 个符号 - 两列
        return f'''<text x="65" y="95" font-family="Arial" font-size="45" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="95" font-family="Arial" font-size="45" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="65" y="150" font-family="Arial" font-size="45" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="150" font-family="Arial" font-size="45" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="65" y="205" font-family="Arial" font-size="45" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="205" font-family="Arial" font-size="45" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    elif num == 7:
        # 7 个符号
        return f'''<text x="65" y="85" font-family="Arial" font-size="42" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="85" font-family="Arial" font-size="42" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="65" y="135" font-family="Arial" font-size="42" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="135" font-family="Arial" font-size="42" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="65" y="185" font-family="Arial" font-size="42" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="185" font-family="Arial" font-size="42" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="100" y="230" font-family="Arial" font-size="42" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    elif num == 8:
        # 8 个符号
        return f'''<text x="65" y="80" font-family="Arial" font-size="40" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="80" font-family="Arial" font-size="40" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="65" y="125" font-family="Arial" font-size="40" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="125" font-family="Arial" font-size="40" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="65" y="170" font-family="Arial" font-size="40" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="170" font-family="Arial" font-size="40" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="65" y="215" font-family="Arial" font-size="40" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="135" y="215" font-family="Arial" font-size="40" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    elif num == 9:
        # 9 个符号
        return f'''<text x="60" y="75" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="140" y="75" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="60" y="115" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="140" y="115" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="60" y="155" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="140" y="155" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="60" y="195" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="140" y="195" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="100" y="235" font-family="Arial" font-size="38" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    elif num == 10:
        # 10 个符号
        return f'''<text x="60" y="70" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="140" y="70" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="60" y="110" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="140" y="110" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="60" y="150" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="140" y="150" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="60" y="190" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="140" y="190" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="75" y="230" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>
  <text x="125" y="230" font-family="Arial" font-size="36" fill="{color}" text-anchor="middle">{symbol}</text>'''
    
    return ''

def generate_face_card_art(value, symbol, color):
    """生成 J/Q/K 的中央图案"""
    # 简化版：用大符号 + 字母表示
    return f'''<text x="100" y="130" font-family="Noto Serif SC, serif" font-size="48" fill="{color}" text-anchor="middle" font-weight="bold">{value}</text>
  <text x="100" y="180" font-family="Arial" font-size="70" fill="{color}" text-anchor="middle" opacity="0.8">{symbol}</text>'''

def generate_joker_svg(joker_type):
    """生成王牌 SVG"""
    
    if joker_type == 'small':
        # 小王
        title = '小王'
        color = COLORS['black']
        secondary_color = COLORS['gold']
    else:
        # 大王
        title = '大王'
        color = COLORS['red']
        secondary_color = COLORS['gold']
    
    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{CARD_WIDTH}" height="{CARD_HEIGHT}" viewBox="0 0 {CARD_WIDTH} {CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- 掼蛋大师 - {title} - 典雅中国风 -->
  
  <defs>
    <linearGradient id="jokerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:{COLORS['bg']};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 卡牌背景 -->
  <rect x="5" y="5" width="{CARD_WIDTH-10}" height="{CARD_HEIGHT-10}" rx="15" fill="url(#jokerGrad)" stroke="{COLORS['border']}" stroke-width="3"/>
  
  <!-- 金色边框 -->
  <rect x="10" y="10" width="{CARD_WIDTH-20}" height="{CARD_HEIGHT-20}" rx="12" fill="none" stroke="{COLORS['border']}" stroke-width="2"/>
  
  <!-- 左上角 -->
  <text x="25" y="45" font-family="Noto Serif SC, serif" font-size="24" fill="{color}" font-weight="bold">{title}</text>
  <text x="25" y="70" font-family="Arial" font-size="20" fill="{secondary_color}">🃏</text>
  
  <!-- 右上角 (倒置) -->
  <text x="175" y="235" font-family="Noto Serif SC, serif" font-size="24" fill="{color}" font-weight="bold" transform="rotate(180 175 235)">{title}</text>
  <text x="175" y="210" font-family="Arial" font-size="20" fill="{secondary_color}" transform="rotate(180 175 210)">🃏</text>
  
  <!-- 中央图案 -->
  <text x="100" y="120" font-family="Noto Serif SC, serif" font-size="56" fill="{secondary_color}" text-anchor="middle" font-weight="bold">{title}</text>
  <text x="100" y="180" font-family="Arial" font-size="80" fill="{color}" text-anchor="middle">🃏</text>
  
  <!-- 装饰纹样 -->
  <circle cx="100" cy="100" r="50" fill="none" stroke="{COLORS['border']}" stroke-width="1" opacity="0.5"/>
  <circle cx="100" cy="100" r="40" fill="none" stroke="{COLORS['border']}" stroke-width="1" opacity="0.3"/>
  
  <!-- 四角角花 -->
  <path d="M 15 15 L 25 15 L 25 20 L 20 20 L 20 25 L 15 25 Z" fill="{COLORS['gold']}" opacity="0.8"/>
  <path d="M 185 15 L 175 15 L 175 20 L 180 20 L 180 25 L 185 25 Z" fill="{COLORS['gold']}" opacity="0.8"/>
  <path d="M 15 265 L 25 265 L 25 260 L 20 260 L 20 255 L 15 255 Z" fill="{COLORS['gold']}" opacity="0.8"/>
  <path d="M 185 265 L 175 265 L 175 260 L 180 260 L 180 255 L 185 255 Z" fill="{COLORS['gold']}" opacity="0.8"/>
</svg>'''
    
    return svg

def main():
    """主函数：生成所有卡牌"""
    
    output_dir = Path('/home/zhoukai/openclaw/workspace/projects/guandan/assets/images/cards')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    cards_generated = 0
    
    # 生成 4 花色 × 13 点数 = 52 张牌
    for suit in SUITS.keys():
        for value in CARD_VALUES:
            svg_content = generate_card_svg(value, suit)
            
            # 文件名：suit_value.svg (例如：hearts_A.svg)
            filename = f'{suit}_{value}.svg'
            filepath = output_dir / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            
            cards_generated += 1
            print(f'✓ 已生成：{SUITS[suit]["name"]}{value} -> {filename}')
    
    # 生成 2 张王牌
    for joker_type, title in [('small', '小王'), ('big', '大王')]:
        svg_content = generate_joker_svg(joker_type)
        filename = f'joker_{joker_type}.svg'
        filepath = output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        cards_generated += 1
        print(f'✓ 已生成：{title} -> {filename}')
    
    print(f'\n🎉 卡牌生成完成！共 {cards_generated} 张')
    print(f'📁 输出目录：{output_dir}')

if __name__ == '__main__':
    main()
