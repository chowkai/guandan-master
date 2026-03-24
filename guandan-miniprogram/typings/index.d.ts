/**
 * 微信小程序类型定义
 */

/// <reference types="miniprogram-api-typings" />

/**
 * 卡牌接口
 */
interface ICard {
  suit: string;      // 花色：heart, diamond, spade, club, joker
  value: string;     // 牌面值：A, 2-10, J, Q, K, BJ, RJ
  id?: string;       // 唯一标识
}

/**
 * 玩家接口
 */
interface IPlayer {
  playerId: string;
  playerName: string;
  avatarUrl: string;
  cardCount: number;
  isSelf: boolean;
  isLandlord: boolean;
  position: 'top' | 'left' | 'right' | 'bottom';
}

/**
 * 出牌记录接口
 */
interface IPlayRecord {
  round: number;
  playerName: string;
  playType: string;
  cards: ICard[];
  timestamp?: number;
}

/**
 * 游戏状态
 */
type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished';

/**
 * 游戏模式
 */
type GameMode = 'single' | 'p2p' | 'online';

/**
 * 牌型
 */
type PlayType = 
  | 'single'           // 单张
  | 'pair'             // 对子
  | 'triple'           // 三张
  | 'bomb'             // 炸弹
  | 'straight'         // 顺子
  | 'consecutive_pairs' // 连对
  | 'airplane'         // 飞机
  | 'full_house'       // 葫芦
  | 'four_with_two';   // 四带二

/**
 * 小程序 App 全局数据
 */
interface IAppData {
  userInfo: WechatMiniprogram.UserInfo | null;
  hasLogin: boolean;
  gameRoomId: string | null;
}

/**
 * 事件类型
 */
interface ICardTapEvent {
  detail: {
    suit: string;
    value: string;
    isSelected: boolean;
  };
}

interface ICardSelectEvent {
  detail: {
    suit: string;
    value: string;
    isSelected: boolean;
  };
}

interface IExpandChangeEvent {
  detail: {
    isExpanded: boolean;
  };
}
