/**
 * 手牌区组件
 * 5 行网格布局：5 列 × 5 行
 * 卡牌尺寸：70×98px (1:1.4 比例)
 * 牌间距：10px
 */
interface IHandAreaData {
  cards: any[];
  selectedCards: any[];
  maxRows: number;
  maxCols: number;
  cardWidth: number;
  cardHeight: number;
  cardGap: number;
}

Component<IHandAreaData>({
  properties: {
    // 手牌数组
    cards: {
      type: Array,
      value: []
    },
    // 已选中的牌
    selectedCards: {
      type: Array,
      value: []
    },
    // 最大行数
    maxRows: {
      type: Number,
      value: 5
    },
    // 最大列数
    maxCols: {
      type: Number,
      value: 5
    },
    // 卡牌宽度 (px)
    cardWidth: {
      type: Number,
      value: 70
    },
    // 卡牌高度 (px)
    cardHeight: {
      type: Number,
      value: 98
    },
    // 牌间距 (px)
    cardGap: {
      type: Number,
      value: 10
    },
    // 是否可操作
    canPlay: {
      type: Boolean,
      value: true
    }
  },

  data: {
    // 内部状态（不与 properties 重名）
    gridRows: [] as any[]
  },

  observers: {
    'cards': function(newCards) {
      this.calculateGrid(newCards);
    }
  },

  methods: {
    /**
     * 计算网格布局
     */
    calculateGrid(cards: any[]) {
      const { maxRows, maxCols } = this.data;
      const gridRows: any[][] = [];
      
      // 将卡牌分配到 5 行中
      for (let i = 0; i < maxRows; i++) {
        const start = i * maxCols;
        const end = Math.min(start + maxCols, cards.length);
        if (start >= cards.length) break;
        
        gridRows.push(cards.slice(start, end));
      }
      
      this.setData({ gridRows });
    },

    /**
     * 处理卡牌点击 - 修复 BUG-010
     */
    onCardTap(event: WechatMiniprogram.CustomEvent) {
      if (!this.data.canPlay) return;
      
      const { cardId, suit, value, isSelected } = event.detail;
      
      // 触发选牌事件 - 传递 cardId
      this.triggerEvent('cardselect', {
        cardId,
        suit,
        value,
        isSelected
      });
    },

    /**
     * 获取网格容器样式
     */
    getGridStyle(): string {
      const { maxCols, cardWidth, cardGap } = this.data;
      const totalWidth = maxCols * cardWidth + (maxCols - 1) * cardGap;
      
      return `
        width: ${totalWidth}px;
        gap: ${cardGap}px;
      `;
    },

    /**
     * 获取行样式
     */
    getRowStyle(): string {
      const { cardWidth, cardGap } = this.data;
      
      return `
        gap: ${cardGap}px;
      `;
    },

    /**
     * 判断卡牌是否被选中
     */
    isCardSelected(suit: string, value: string): boolean {
      const { selectedCards } = this.data;
      return selectedCards.some(
        card => card.suit === suit && card.value === value
      );
    }
  }
});
