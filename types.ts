export enum CommissionStatus {
  QUEUE = '排單中',
  SKETCH = '草稿',
  LINEART = '線稿',
  COLOR = '上色',
  RENDER = '完稿精修',
  DONE = '結案'
}

export interface Commission {
  id: string; // This will now be the database ID
  userId: string; // Foreign key to the user/artist
  artistId: string; // The artist's public display name
  clientName: string;
  contact?: string; // e.g., Discord handle or email
  title: string;
  description: string;
  type: string;
  price: number;
  status: CommissionStatus;
  dateAdded: string;
  lastUpdated: string;
  thumbnailUrl?: string; 
  notes?: string; 
}

export type ThemeMode = 'client' | 'admin';