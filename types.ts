export enum CommissionStatus {
  QUEUE = '排單中',
  SKETCH = '草稿',
  LINEART = '線稿',
  COLOR = '上色',
  RENDER = '完稿精修',
  DONE = '結案'
}

export interface Commission {
  id: string;
  artistId: string; // 負責此委託的繪師名稱/ID
  clientName: string;
  contact?: string; // e.g., Discord handle or email
  title: string;
  description: string;
  type: '大頭貼' | '半身' | '全身' | '插畫' | '立繪設計' | 'Q版' | '社團特殊委託';
  price: number;
  status: CommissionStatus;
  dateAdded: string;
  lastUpdated: string;
  thumbnailUrl?: string; 
  notes?: string; 
}

export type ThemeMode = 'client' | 'admin';