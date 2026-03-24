/**
 * 按钮组件
 * 支持：主按钮/次要按钮/操作按钮
 */
interface IButtonData {
  type: string;
  text: string;
  disabled: boolean;
  loading: boolean;
  size: string;
}

Component<IButtonData>({
  properties: {
    // 按钮类型：primary, secondary, action, danger
    type: {
      type: String,
      value: 'primary'
    },
    // 按钮文字
    text: {
      type: String,
      value: '按钮'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 是否加载中
    loading: {
      type: Boolean,
      value: false
    },
    // 按钮尺寸：small, medium, large
    size: {
      type: String,
      value: 'medium'
    },
    // 是否全屏宽度
    block: {
      type: Boolean,
      value: false
    }
  },

  data: {
    type: 'primary',
    text: '按钮',
    disabled: false,
    loading: false,
    size: 'medium',
    block: false
  },

  methods: {
    /**
     * 处理按钮点击
     */
    onTap() {
      if (this.data.disabled || this.data.loading) {
        return;
      }
      
      this.triggerEvent('tap', {
        type: this.data.type,
        text: this.data.text
      });
    },

    /**
     * 获取按钮样式类
     */
    getButtonClass(): string {
      const { type, size, disabled, loading, block } = this.data;
      const classes: string[] = [];
      
      // 类型
      classes.push(`btn-${type}`);
      
      // 尺寸
      classes.push(`btn-${size}`);
      
      // 状态
      if (disabled) classes.push('btn-disabled');
      if (loading) classes.push('btn-loading');
      if (block) classes.push('btn-block');
      
      return classes.join(' ');
    },

    /**
     * 获取按钮内联样式
     */
    getButtonStyle(): string {
      const styles: string[] = [];
      
      if (this.data.block) {
        styles.push('width: 100%;');
      }
      
      return styles.join(' ');
    }
  }
});
