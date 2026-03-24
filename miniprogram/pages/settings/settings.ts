/**
 * 设置页面
 * 功能：游戏设置/显示设置/关于
 */
interface ISettingsData {
  soundEffect: boolean;
  backgroundMusic: boolean;
  vibration: boolean;
  cardSize: number;
  cardSizeLabel: string;
  theme: string;
  themeLabel: string;
  version: string;
}

Page<ISettingsData>({
  data: {
    soundEffect: true,
    backgroundMusic: true,
    vibration: true,
    cardSize: 1,
    cardSizeLabel: '标准',
    theme: 'green',
    themeLabel: '经典绿',
    version: 'v3.0.0'
  },

  onLoad() {
    console.log('设置页面加载');
    this.loadSettings();
  },

  onShow() {
    // 页面显示
  },

  /**
   * 加载设置
   */
  loadSettings() {
    // 从本地存储加载设置
    const settings = wx.getStorageSync('gameSettings');
    
    if (settings) {
      this.setData({
        soundEffect: settings.soundEffect ?? true,
        backgroundMusic: settings.backgroundMusic ?? true,
        vibration: settings.vibration ?? true,
        cardSize: settings.cardSize ?? 1,
        theme: settings.theme ?? 'green'
      });
      
      this.updateLabels();
    }
  },

  /**
   * 保存设置
   */
  saveSettings() {
    const { soundEffect, backgroundMusic, vibration, cardSize, theme } = this.data;
    
    wx.setStorageSync('gameSettings', {
      soundEffect,
      backgroundMusic,
      vibration,
      cardSize,
      theme
    });
    
    console.log('设置已保存');
  },

  /**
   * 更新标签显示
   */
  updateLabels() {
    const { cardSize, theme } = this.data;
    
    const cardSizeLabels = ['小', '标准', '大', '超大'];
    const themeLabels = ['经典绿', '深蓝', '简约白'];
    
    this.setData({
      cardSizeLabel: cardSizeLabels[cardSize] || '标准',
      themeLabel: themeLabels[theme === 'green' ? 0 : theme === 'blue' ? 1 : 2]
    });
  },

  /**
   * 切换音效
   */
  toggleSoundEffect() {
    const newValue = !this.data.soundEffect;
    this.setData({ soundEffect: newValue });
    this.saveSettings();
    
    wx.showToast({
      title: newValue ? '音效已开启' : '音效已关闭',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 切换背景音乐
   */
  toggleBackgroundMusic() {
    const newValue = !this.data.backgroundMusic;
    this.setData({ backgroundMusic: newValue });
    this.saveSettings();
    
    wx.showToast({
      title: newValue ? '音乐已开启' : '音乐已关闭',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 切换震动反馈
   */
  toggleVibration() {
    const newValue = !this.data.vibration;
    this.setData({ vibration: newValue });
    this.saveSettings();
    
    wx.showToast({
      title: newValue ? '震动已开启' : '震动已关闭',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 调整牌面大小
   */
  adjustCardSize() {
    const { cardSize } = this.data;
    const newCardSize = (cardSize + 1) % 4;
    
    this.setData({ cardSize: newCardSize });
    this.updateLabels();
    this.saveSettings();
    
    wx.showToast({
      title: `牌面大小：${this.data.cardSizeLabel}`,
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 切换主题
   */
  changeTheme() {
    const themes = ['green', 'blue', 'white'];
    const themeLabels = ['经典绿', '深蓝', '简约白'];
    const { theme } = this.data;
    
    const currentIndex = themes.indexOf(theme);
    const newIndex = (currentIndex + 1) % themes.length;
    
    this.setData({
      theme: themes[newIndex],
      themeLabel: themeLabels[newIndex]
    });
    this.saveSettings();
    
    wx.showToast({
      title: `主题：${this.data.themeLabel}`,
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 查看游戏规则
   */
  viewRules() {
    wx.navigateTo({
      url: '/pages/rules/rules'
    });
  },

  /**
   * 恢复默认设置
   */
  resetSettings() {
    wx.showModal({
      title: '确认重置',
      content: '确定要恢复默认设置吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            soundEffect: true,
            backgroundMusic: true,
            vibration: true,
            cardSize: 1,
            theme: 'green'
          });
          this.updateLabels();
          this.saveSettings();
          
          wx.showToast({
            title: '已恢复默认设置',
            icon: 'success'
          });
        }
      }
    });
  }
});
