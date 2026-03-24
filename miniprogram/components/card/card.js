Component({
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
         * 处理卡牌点击
         */
        onTap() {
            if (!this.data.isPlayable)
                return;
            this.setData({
                isSelected: !this.data.isSelected
            });
            // 触发选牌事件
            this.triggerEvent('cardtap', {
                suit: this.data.suit,
                value: this.data.value,
                isSelected: this.data.isSelected
            });
        },
        /**
         * 获取花色对应的颜色
         */
        getSuitColor() {
            const { suit } = this.data;
            if (suit === 'heart' || suit === 'diamond') {
                return 'var(--heart-red)';
            }
            return 'var(--spade-black)';
        },
        /**
         * 获取花色对应的符号
         */
        getSuitSymbol() {
            const symbols = {
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
        isJoker() {
            return this.data.value === 'BJ' || this.data.value === 'RJ';
        },
        /**
         * 获取卡牌样式
         */
        getCardStyle() {
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
