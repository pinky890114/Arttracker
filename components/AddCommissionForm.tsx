import React, { useState } from 'react';
import { Commission, CommissionStatus } from '../types';
import { Plus, X } from 'lucide-react';

interface AddCommissionFormProps {
  onAdd: (c: Commission) => void;
  onCancel: () => void;
}

export const AddCommissionForm: React.FC<AddCommissionFormProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Commission>>({
    clientName: '',
    title: '',
    description: '',
    type: '半身',
    price: 0,
    status: CommissionStatus.QUEUE,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCommission: Commission = {
      id: `c-${Date.now()}`,
      artistId: '', // Will be filled by parent
      clientName: formData.clientName || '匿名委託人',
      title: formData.title || '未命名委託',
      description: formData.description || '',
      type: formData.type as any,
      price: Number(formData.price),
      status: formData.status as CommissionStatus,
      dateAdded: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      thumbnailUrl: ''
    };
    onAdd(newCommission);
  };

  return (
    <div className="bg-white border-2 border-emerald-50 rounded-3xl p-8 mb-10 animate-in fade-in zoom-in-95 duration-200 shadow-xl shadow-emerald-50/50">
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-stone-100">
        <h3 className="text-xl font-bold text-[#1a472a] flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-xl text-[#1a472a]">
                <Plus size={24} /> 
            </div>
            新增委託單
        </h3>
        <button onClick={onCancel} className="bg-stone-100 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors">
            <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">委託人名稱 (ID)</label>
            <input 
              required
              type="text" 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium transition-all"
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              placeholder="例如: ArtLover99"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">委託項目標題</label>
            <input 
              required
              type="text" 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="例如: 原創角色立繪"
            />
          </div>
           <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">委託類型</label>
            <div className="relative">
                <select 
                className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium appearance-none cursor-pointer transition-all"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                    <option value="大頭貼">大頭貼</option>
                    <option value="Q版">Q版</option>
                    <option value="半身">半身</option>
                    <option value="全身">全身</option>
                    <option value="插畫">插畫</option>
                    <option value="立繪設計">立繪設計</option>
                    <option value="社團特殊委託">社團特殊委託</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    ▼
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">價格 (NTD/USD)</label>
            <input 
              type="number" 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium transition-all"
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>
           <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">初始狀態</label>
            <div className="relative">
                <select 
                className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium appearance-none cursor-pointer transition-all"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                {Object.values(CommissionStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    ▼
                </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">詳細需求描述</label>
            <textarea 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none h-28 resize-none font-medium transition-all"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="請輸入委託的詳細內容..."
            />
          </div>
        </div>
        
        <div className="md:col-span-2 pt-4 flex justify-end border-t border-stone-100 mt-2">
            <button 
                type="submit"
                className="bg-[#1a472a] hover:bg-[#25613a] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-[#1a472a]/20 hover:-translate-y-0.5 active:scale-95 text-sm"
            >
                建立委託單
            </button>
        </div>
      </form>
    </div>
  );
};