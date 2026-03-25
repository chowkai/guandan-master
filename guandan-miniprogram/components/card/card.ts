/**
 * 卡牌组件
 * 尺寸：80×112px (标准尺寸) / 70×98px (手牌区紧凑尺寸)
 */
interface ICardData {
  suit: string;      // 花色：heart, diamond, spade, club
  value: string;     // 牌面值：A, 2-10, J, Q, K, BJ, RJ
  isSelected: boolean;
  isPlayable: boolean;
  cardWidth: number;
  cardHeight: number;
}

Component<ICardData>({
  properties: {
    // 花色：heart(红心), diamond(方块), spade(黑桃), club(梅花)
    suit: {
      type: String,
      value: 'heart'
    },
    // 牌面值
    value: {
      type: String,
      value: 'A'
    },
    // 是否被选中
    isSelected: {
      type: Boolean,
      value: false
    },
    // 是否可出
    isPlayable: {
      type: Boolean,
      value: true
    },
    // 卡牌宽度 (默认 80px)
    cardWidth: {
      type: Number,
      value: 80
    },
    // 卡牌高度 (默认 112px)
    cardHeight: {
      type: Number,
      value: 112
    }
  },

  data: {
    suit: 'heart',
    value: 'A',
    isSelected: false,
    isPlayable: true,
    cardWidth: 80,
    cardHeight: 112
  },

  methods: {
    /**
     * 处理卡牌点击 - 修复 BUG-010
     */
    onTap(event: WechatMiniprogram.TouchEvent) {
      if (!this.data.isPlayable) return;
      
      const { suit, value } = this.data;
      const cardId = `${suit}-${value}`;
      const newIsSelected = !this.data.isSelected;
      
      this.setData({
        isSelected: newIsSelected
      });

      // 触发选牌事件 - 传递 cardId
      this.triggerEvent('cardtap', {
        cardId,
        suit,
        value,
        isSelected: newIsSelected
      });
      
      console.log('卡牌点击:', cardId, '选中:', newIsSelected);
    },

    /**
     * 获取花色对应的颜色
     */
    getSuitColor(): string {
      const { suit } = this.data;
      if (suit === 'heart' || suit === 'diamond') {
        return 'var(--heart-red)';
      }
      return 'var(--spade-black)';
    },

    /**
     * 获取花色对应的符号
     */
    getSuitSymbol(): string {
      const symbols: Record<string, string> = {
        heart: '♥',
        diamond: '♦',
        spade: '♠',
        club: '♣'
      };
      return symbols[this.data.suit] || '♥';
    },

    /**
     * 获取王牌显示
     */
    isJoker(): boolean {
      return this.data.value === 'BJ' || this.data.value === 'RJ';
    },

    /**
     * 获取卡牌样式
     */
    getCardStyle(): string {
      const { cardWidth, cardHeight, isSelected } = this.data;
      const translateY = isSelected ? '-20rpx' : '0';
      const boxShadow = isSelected 
        ? '0 -8rpx 16rpx rgba(0,0,0,0.3)' 
        : '0 4rpx 8rpx rgba(0,0,0,0.2)';
      
      return `
        width: ${cardWidth}px;
        height: ${cardHeight}px;
        transform: translateY(${translateY});
        box-shadow: ${boxShadow};
      `;
    }
  }
});
