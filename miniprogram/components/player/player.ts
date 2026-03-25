/**
 * 玩家信息组件
 * 显示：头像 + 名称 + 剩牌角标
 */
interface IPlayerData {
  playerId: string;
  playerName: string;
  avatarUrl: string;
  cardCount: number;
  isSelf: boolean;
  isLandlord: boolean;
  position: string;
}

Component<IPlayerData>({
  properties: {
    // 玩家 ID
    playerId: {
      type: String,
      value: ''
    },
    // 玩家名称
    playerName: {
      type: String,
      value: '玩家'
    },
    // 头像 URL
    avatarUrl: {
      type: String,
      value: ''
    },
    // 剩余牌数
    cardCount: {
      type: Number,
      value: 0
    },
    // 是否是自己
    isSelf: {
      type: Boolean,
      value: false
    },
    // 是否是地主
    isLandlord: {
      type: Boolean,
      value: false
    },
    // 位置：top, left, right, bottom
    position: {
      type: String,
      value: 'bottom'
    }
  },

  data: {
    // 内部状态（不与 properties 重名）
    // 所有状态通过 properties 管理
  },

  methods: {
    /**
     * 获取位置对应的样式类
     */
    getPositionClass(): string {
      const positionMap: Record<string, string> = {
        top: 'player-top',
        left: 'player-left',
        right: 'player-right',
        bottom: 'player-bottom'
      };
      return positionMap[this.data.position] || 'player-bottom';
    },

    /**
     * 获取剩余牌数显示
     */
    getCardCountDisplay(): string {
      const count = this.data.cardCount;
      if (count > 10) return `${count}`;
      if (count > 0) return `${count}`;
      return '0';
    },

    /**
     * 获取剩余牌数样式
     */
    getCardCountStyle(): string {
      const count = this.data.cardCount;
      if (count <= 5) {
        return 'background-color: var(--red);';
      }
      if (count <= 10) {
        return 'background-color: var(--yellow);';
      }
      return 'background-color: var(--active-green);';
    }
  }
});
