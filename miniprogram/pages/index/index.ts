/**
 * 主页面
 * 功能：开始游戏/P2P 联机/设置
 */
interface IIndexData {
  userInfo: WechatMiniprogram.UserInfo | null;
  hasLogin: boolean;
}

Page<IIndexData>({
  data: {
    userInfo: null,
    hasLogin: false
  },

  onLoad() {
    console.log('主页面加载');
    this.checkLoginStatus();
  },

  onShow() {
    // 页面显示
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const app = getApp();
    const { hasLogin, userInfo } = app.globalData;
    
    if (hasLogin && userInfo) {
      this.setData({
        userInfo,
        hasLogin
      });
    }
  },

  /**
   * 开始游戏 (单机)
   */
  onStartGame() {
    console.log('开始单机游戏');
    wx.navigateTo({
      url: '/pages/game/game?mode=single'
    });
  },

  /**
   * P2P 联机（预留）
   */
  onP2PConnect() {
    console.log('进入 P2P 联机');
    wx.showToast({
      title: '功能开发中...',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 查看游戏规则
   */
  onViewRules() {
    console.log('查看游戏规则');
    wx.navigateTo({
      url: '/pages/rules/rules'
    });
  },

  /**
   * 打开设置
   */
  onOpenSettings() {
    console.log('打开设置');
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  /**
   * 用户登录
   */
  onLogin() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        const app = getApp();
        
        app.globalData.userInfo = userInfo;
        app.globalData.hasLogin = true;
        
        this.setData({
          userInfo,
          hasLogin: true
        });
        
        console.log('用户登录成功:', userInfo.nickName);
      },
      fail: (err) => {
        console.error('用户登录失败:', err);
      }
    });
  }
});
