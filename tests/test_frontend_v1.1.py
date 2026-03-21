#!/usr/bin/env python3
"""
掼蛋大师 v1.1 前端优化验证测试
Frontend v1.1 Optimization Verification Tests
"""

import os
import re
import unittest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_DIR = os.path.join(os.path.dirname(BASE_DIR), 'src', 'client')

class TestFrontendV11(unittest.TestCase):
    """前端 v1.1 优化验证测试"""
    
    def test_css_table_green_background(self):
        """测试 CSS: 深绿色牌桌背景"""
        css_file = os.path.join(CLIENT_DIR, 'css', 'style.css')
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查深绿色变量定义
        self.assertIn('--table-green: #1a472a', content)
        self.assertIn('--table-green-dark: #0f2e1d', content)
        
        # 检查牌桌使用深绿色背景
        self.assertIn('background: linear-gradient(135deg, var(--table-green)', content)
    
    def test_css_card_white_border(self):
        """测试 CSS: 卡牌白色边框"""
        css_file = os.path.join(CLIENT_DIR, 'css', 'style.css')
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查白色边框
        self.assertIn('border: 3px solid var(--white)', content)
    
    def test_css_card_enlarged(self):
        """测试 CSS: 牌面放大"""
        css_file = os.path.join(CLIENT_DIR, 'css', 'style.css')
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查卡牌尺寸放大到 150px
        self.assertIn('--card-width: 150px', content)
    
    def test_css_removed_hover_effect(self):
        """测试 CSS: 移除悬停效果"""
        css_file = os.path.join(CLIENT_DIR, 'css', 'style.css')
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查我的手牌区域没有 hover 效果（只有 selected）
        # 应该只有 .selected 样式，没有 .hover 样式
        hand_section = re.search(r'\.my-hand\.card\{[^}]+\}', content)
        if hand_section:
            self.assertNotIn(':hover', hand_section.group(0))
    
    def test_html_start_screen(self):
        """测试 HTML: 游戏开始画面"""
        html_file = os.path.join(CLIENT_DIR, 'index.html')
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查开始画面元素
        self.assertIn('id="start-screen"', content)
        self.assertIn('id="btn-start-game"', content)
        self.assertIn('id="btn-start-settings"', content)
        self.assertIn('id="btn-start-help"', content)
    
    def test_html_sort_buttons(self):
        """测试 HTML: 多种排序按钮"""
        html_file = os.path.join(CLIENT_DIR, 'index.html')
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查排序按钮
        self.assertIn('id="btn-sort-suit"', content)
        self.assertIn('id="btn-sort-rank"', content)
        self.assertIn('id="btn-sort-smart"', content)
    
    def test_html_played_cards_area(self):
        """测试 HTML: 出的牌显示区域"""
        html_file = os.path.join(CLIENT_DIR, 'index.html')
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查出的牌区域使用新的 class
        self.assertIn('class="played-cards-area"', content)
    
    def test_js_sort_functions(self):
        """测试 JS: 排序函数"""
        js_file = os.path.join(CLIENT_DIR, 'js', 'game.js')
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查排序函数存在
        self.assertIn('sortBySuit()', content)
        self.assertIn('sortByRank()', content)
        self.assertIn('sortSmart()', content)
    
    def test_js_deal_animation(self):
        """测试 JS: 发牌动画"""
        js_file = os.path.join(CLIENT_DIR, 'js', 'game.js')
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查发牌动画函数
        self.assertIn('dealCardsWithAnimation()', content)
    
    def test_js_card_reminder(self):
        """测试 JS: 报牌提醒优化"""
        js_file = os.path.join(CLIENT_DIR, 'js', 'game.js')
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查报牌提醒逻辑（≤6 张时提醒）
        self.assertIn('count <= 6', content)
        self.assertIn('hasReminded', content)
    
    def test_js_start_screen_functions(self):
        """测试 JS: 开始画面函数"""
        js_file = os.path.join(CLIENT_DIR, 'js', 'game.js')
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查开始画面函数
        self.assertIn('showStartScreen()', content)
        self.assertIn('hideStartScreen()', content)
    
    def test_js_played_cards_display(self):
        """测试 JS: 出的牌显示"""
        js_file = os.path.join(CLIENT_DIR, 'js', 'game.js')
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查出的牌显示和清理函数
        self.assertIn('displayPlayedCards(', content)
        self.assertIn('clearPlayedCards()', content)
        self.assertIn('last-player-indicator', content)


if __name__ == '__main__':
    unittest.main(verbosity=2)
