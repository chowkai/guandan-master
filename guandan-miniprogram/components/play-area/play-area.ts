/**
 * 出牌区组件
 * 可折叠多轮出牌记录
 */
interface IPlayAreaData {
  playHistory: any[];
  currentPlay: any[];
  isExpanded: boolean;
  maxVisibleRounds: number;
}

Component<IPlayAreaData>({
  properties: {
    // 出牌历史记录
    playHistory: {
      type: Array,
      value: []
    },
    // 当前出牌
    currentPlay: {
      type: Array,
      value: []
    },
    // 是否展开
    isExpanded: {
      type: Boolean,
      value: false
    },
    // 最大可见轮数
    maxVisibleRounds: {
      type: Number,
      value: 5
    },
    // 显示玩家名称
    showPlayerName: {
      type: Boolean,
      value: true
    }
  },

  data: {
    playHistory: [],
    currentPlay: [],
    isExpanded: false,
    maxVisibleRounds: 5,
    showPlayerName: true
  },

  methods: {
    /**
     * 切换展开/折叠
     */
    toggleExpand() {
      this.setData({
        isExpanded: !this.data.isExpanded
      });
      
      this.triggerEvent('expandchange', {
        isExpanded: this.data.isExpanded
      });
    },

    /**
     * 获取可见的历史记录
     */
    getVisibleHistory(): any[] {
      const { playHistory, isExpanded, maxVisibleRounds } = this.data;
      
      if (isExpanded) {
        return playHistory;
      }
      
      // 只显示最近几轮
      return playHistory.slice(-maxVisibleRounds);
    },

    /**
     * 获取牌型名称
     */
    getPlayTypeName(playType: string): string {
      const typeMap: Record<string, string> = {
        'single': '单张',
        'pair': '对子',
        'triple': '三张',
        'bomb': '炸弹',
        'straight': '顺子',
        'consecutive_pairs': '连对',
        'airplane': '飞机',
        'full_house': '葫芦',
        'four_with_two': '四带二'
      };
      return typeMap[playType] || playType;
    },

    /**
     * 获取当前出牌轮次
     */
    getCurrentRound(): number {
      return this.data.playHistory.length + 1;
    }
  }
});
