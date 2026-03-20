# 音效文件目录

本目录用于存放游戏音效文件。

## 当前实现

游戏使用 **Web Audio API** 实时生成音效，无需外部音频文件。

音效代码位于：`../js/sound.js`

## 支持的音效

- `playCard()` - 出牌音效
- `playWin()` - 胜利音效
- `playPass()` - 不要/过音效
- `playDeal()` - 发牌音效
- `playHint()` - 提示音效
- `playError()` - 错误音效
- `playClick()` - 点击音效
- `playLevelUp()` - 升级音效

## 如需添加自定义音效

可以将音频文件（MP3/WAV/OGG 格式）放在此目录，然后在 `sound.js` 中添加加载逻辑：

```javascript
// 示例：加载外部音频文件
loadSound(name, filename) {
    const audio = new Audio(`sounds/${filename}`);
    this.sounds[name] = audio;
}

playSound(name) {
    if (this.sounds[name]) {
        this.sounds[name].currentTime = 0;
        this.sounds[name].play();
    }
}
```

## 音效格式建议

- **格式**: MP3 或 OGG（浏览器兼容性好）
- **采样率**: 44.1kHz
- **位深度**: 16-bit
- **文件大小**: 每个文件 < 100KB
- **时长**: 0.1-2 秒（短音效）

## 文件命名规范

- 使用小写字母
- 单词间用连字符分隔
- 示例：`card-play.mp3`, `victory-fanfare.wav`
