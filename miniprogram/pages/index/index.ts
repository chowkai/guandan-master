/**
 * 主页面
 * 功能：开始游戏/P2P 联机/设置
 */
interface IIndexData {
  userInfo: WechatMiniprogram.UserInfo | null;
  hasLogin: boolean;
  recentRooms: any[];
}

Page<IIndexData>({
  data: {
    userInfo: null,
    hasLogin: false,
    recentRooms: []
  },

  onLoad() {
    console.log('主页面加载');
    this.checkLoginStatus();
    this.loadRecentRooms();
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
   * 加载最近房间
   */
  loadRecentRooms() {
    // TODO: 从本地存储加载最近的游戏房间
    const recentRooms = [];
    this.setData({ recentRooms });
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
   * P2P 联机
   */
  onP2PConnect() {
    console.log('进入 P2P 联机');
    wx.navigateTo({
      url: '/pages/game/game?mode=p2p'
    });
  },

  /**
   * 创建设置
   */
  onCreateRoom() {
    console.log('创建房间');
    // TODO: 创建房间逻辑
  },

  /**
   * 加入房间
   */
  onJoinRoom() {
    console.log('加入房间');
    // TODO: 加入房间逻辑
  },

  /**
   * 打开设置
   */
  onOpenSettings() {
    console.log('打开设置');
    // TODO: 设置页面
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
