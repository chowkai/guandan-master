App({
    onLaunch() {
        console.log('掼蛋小程序启动');
        // 初始化全局数据
        this.initGlobalData();
    },
    onShow() {
        // 小程序进入前台
    },
    onHide() {
        // 小程序进入后台
    },
    /**
     * 初始化全局数据
     */
    initGlobalData() {
        const { hasLogin, userInfo } = this.globalData;
        if (hasLogin && userInfo) {
            console.log('用户已登录:', userInfo.nickName);
        }
        else {
            console.log('用户未登录');
        }
    },
    globalData: {
        userInfo: null,
        hasLogin: false,
        gameRoomId: null
    }
});
