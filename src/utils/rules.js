// 简单的牌型验证
export function validateHand(cards) {
  if (!cards || cards.length === 0) return { valid: false, message: '请选择牌' }
  
  // 单张
  if (cards.length === 1) {
    return { valid: true, type: 'single', value: cards[0].value }
  }
  
  // 对子
  if (cards.length === 2 && cards[0].value === cards[1].value) {
    return { valid: true, type: 'pair', value: cards[0].value }
  }
  
  // 三张
  if (cards.length === 3 && cards.every(c => c.value === cards[0].value)) {
    return { valid: true, type: 'triple', value: cards[0].value }
  }
  
  // 三带二
  if (cards.length === 5) {
    const values = cards.map(c => c.value)
    const counts = {}
    values.forEach(v => counts[v] = (counts[v] || 0) + 1)
    
    // 三带二（三张 + 对子）
    if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) {
      const triple = parseInt(Object.keys(counts).find(k => counts[k] === 3))
      return { valid: true, type: 'triple_pair', value: triple }
    }
    
    // 三带一（三张 + 单张）
    if (Object.values(counts).includes(3) && Object.values(counts).includes(1)) {
      const triple = parseInt(Object.keys(counts).find(k => counts[k] === 3))
      return { valid: true, type: 'triple_single', value: triple }
    }
    
    // 顺子（5 连）
    const sorted = [...new Set(values)].sort((a, b) => a - b)
    if (sorted.length === 5 && sorted[4] - sorted[0] === 4) {
      return { valid: true, type: 'straight', value: sorted[4] }
    }
  }
  
  // 炸弹（4 张相同）
  if (cards.length === 4 && cards.every(c => c.value === cards[0].value)) {
    return { valid: true, type: 'bomb', value: cards[0].value }
  }
  
  // 同花顺
  if (cards.length === 5) {
    const suits = cards.map(c => c.suit)
    const values = cards.map(c => c.value).sort((a, b) => a - b)
    const isSameSuit = suits.every(s => s === suits[0])
    const isStraight = values[4] - values[0] === 4 && new Set(values).size === 5
    
    if (isSameSuit && isStraight) {
      return { valid: true, type: 'straight_flush', value: values[4] }
    }
  }
  
  // 王炸
  if (cards.length === 2) {
    const hasSmallJoker = cards.some(c => c.rank === 'small_joker')
    const hasBigJoker = cards.some(c => c.rank === 'big_joker')
    if (hasSmallJoker && hasBigJoker) {
      return { valid: true, type: 'royal_bomb', value: 999 }
    }
  }
  
  return { valid: false, message: '无效的牌型' }
}

// 检查是否能管上
export function canBeat(newHand, lastHand) {
  if (!lastHand) return true // 首家任意出
  
  const newResult = validateHand(newHand)
  const lastResult = validateHand(lastHand)
  
  if (!newResult.valid) return false
  
  // 王炸最大
  if (newResult.type === 'royal_bomb') return true
  if (lastResult.type === 'royal_bomb') return false
  
  // 炸弹可以管非炸弹
  if (newResult.type === 'bomb' && lastResult.type !== 'bomb') return true
  if (newResult.type === 'bomb' && lastResult.type === 'bomb') {
    return newResult.value > lastResult.value
  }
  
  // 同类型比较
  if (newResult.type === lastResult.type) {
    return newResult.value > lastResult.value
  }
  
  return false
}
