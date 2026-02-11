import { Commission, CommissionStatus } from './types';

export const STATUS_STEPS = [
  CommissionStatus.QUEUE,
  CommissionStatus.SKETCH,
  CommissionStatus.LINEART,
  CommissionStatus.COLOR,
  CommissionStatus.RENDER,
  CommissionStatus.DONE,
];

export const DEFAULT_COMMISSION_TYPES = [
  '大頭貼',
  '半身',
  '全身',
  '插畫',
  '立繪設計',
  'Q版',
  '社團特殊委託'
];

export const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'c-101',
    artistId: '兔兔老師',
    userId: '兔兔老師',
    clientName: '星野光',
    title: '精靈遊俠頭像',
    description: '一張高精靈遊俠在雨中的憂鬱頭像。希望能強調眼神的光影和雨滴的氛圍感。',
    type: '大頭貼',
    price: 1500,
    status: CommissionStatus.RENDER,
    dateAdded: '2023-10-25',
    lastUpdated: '2023-11-02',
    thumbnailUrl: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: 'c-102',
    artistId: '熊熊繪圖',
    userId: '熊熊繪圖',
    clientName: 'MomoChan',
    title: '賽博龐克街道背景',
    description: '細緻的霓虹燈巷弄背景，有一隻橘貓坐在垃圾桶上看著鏡頭。',
    type: '插畫',
    price: 5000,
    status: CommissionStatus.SKETCH,
    dateAdded: '2023-10-28',
    lastUpdated: '2023-10-30',
    thumbnailUrl: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 'c-103',
    artistId: '兔兔老師',
    userId: '兔兔老師',
    clientName: '鐵拳阿豪',
    title: 'D&D 跑團角色全家福',
    description: '五個角色在酒館慶祝的場景。包含矮人戰士、人類法師、提夫林盜賊等。',
    type: '插畫',
    price: 8000,
    status: CommissionStatus.QUEUE,
    dateAdded: '2023-11-01',
    lastUpdated: '2023-11-01',
    thumbnailUrl: 'https://picsum.photos/400/250?random=3'
  },
  {
    id: 'c-104',
    artistId: '熊熊繪圖',
    userId: '熊熊繪圖',
    clientName: 'Viper007',
    title: '重裝機甲設定',
    description: '重型突擊機甲的概念設計圖。配色以叢林迷彩和鐵灰色為主。',
    type: '立繪設計',
    price: 3500,
    status: CommissionStatus.LINEART,
    dateAdded: '2023-10-20',
    lastUpdated: '2023-10-29',
    thumbnailUrl: 'https://picsum.photos/400/400?random=4'
  }
];