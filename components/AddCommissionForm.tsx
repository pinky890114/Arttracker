import React, { useState } from 'react';
import { Commission, CommissionStatus } from '../types';
import { Plus, X, Pencil, Check } from 'lucide-react';

interface AddCommissionFormProps {
  onAdd: (c: Omit<Commission, 'id' | 'artistId' | 'userId' | 'dateAdded' | 'lastUpdated'>) => void;
  onCancel: () => void;
  availableTypes: string[];
  onUpdateTypes: (types: string[]) => void;
}

export const AddCommissionForm: React.FC<AddCommissionFormProps> = ({ 
    onAdd, 
    onCancel, 
    availableTypes, 
    onUpdateTypes 
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    title: '',
    description: '',
    type: availableTypes[0] || '插畫',
    price: 0,
    status: CommissionStatus.QUEUE,
    contact: '',
    notes: '',
    thumbnailUrl: ''
  });

  const [isEditingTypes, setIsEditingTypes] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingTypes) return;

    onAdd({
      clientName: formData.clientName || '匿名委託人',
      title: formData.title || '未命名委託',
      description: formData.description || '',
      type: formData.type,
      price: Number(formData.price),
      status: formData.status,
      contact: formData.contact,
      notes: formData.notes,
      thumbnailUrl: formData.thumbnailUrl
    });
  };

  const handleAddType = () => {
    if (newTypeInput.trim() && !availableTypes.includes(newTypeInput.trim())) {
        const updated = [...availableTypes, newTypeInput.trim()];
        onUpdateTypes(updated);
        setNewTypeInput('');
        setFormData({...formData, type: newTypeInput.trim()});
    }
  };

  const handleDeleteType = (typeToDelete: string) => {
      const updated = availableTypes.filter(t => t !== typeToDelete);
      onUpdateTypes(updated);
      if (formData.type === typeToDelete && updated.length > 0) {
          setFormData({...formData, type: updated[0]});
      }
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
              disabled={isEditingTypes}
              type="text" 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium transition-all disabled:opacity-50"
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              placeholder="例如: ArtLover99"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">委託項目標題</label>
            <input 
              required
              disabled={isEditingTypes}
              type="text" 
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium transition-all disabled:opacity-50"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="例如: 原創角色立繪"
            />
          </div>
           
           <div>
            <div className="flex items-center justify-between mb-2 ml-1">
                <label className="text-xs font-bold text-stone-500">委託類型</label>
                <button 
                    type="button"
                    onClick={() => setIsEditingTypes(!isEditingTypes)}
                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-all ${isEditingTypes ? 'bg-[#1a472a] text-white' : 'bg-stone-100 text-stone-400 hover:text-[#1a472a]'}`}
                >
                    {isEditingTypes ? <Check size={10} /> : <Pencil size={10} />}
                    {isEditingTypes ? '完成' : '編輯'}
                </button>
            </div>
            
            {isEditingTypes ? (
                <div className="bg-stone-50 border-2 border-dashed border-[#1a472a]/30 rounded-2xl p-3 animate-in fade-in duration-200">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {availableTypes.map(t => (
                            <div key={t} className="flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-lg text-xs font-bold text-stone-600 shadow-sm">
                                {t}
                                <button 
                                    type="button"
                                    onClick={() => handleDeleteType(t)}
                                    className="text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={newTypeInput}
                            onChange={(e) => setNewTypeInput(e.target.value)}
                            placeholder="新增類型..."
                            className="flex-grow bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#1a472a]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddType();
                                }
                            }}
                        />
                        <button 
                            type="button"
                            onClick={handleAddType}
                            disabled={!newTypeInput.trim()}
                            className="bg-[#1a472a] text-white rounded-lg px-3 py-1 text-xs font-bold disabled:opacity-50"
                        >
                            新增
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <select 
                    className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium appearance-none cursor-pointer transition-all"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                        {availableTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                        ▼
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">價格 (NTD/USD)</label>
            <input 
              type="number" 
              disabled={isEditingTypes}
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium transition-all disabled:opacity-50"
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>
           <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 ml-1">初始狀態</label>
            <div className="relative">
                <select 
                disabled={isEditingTypes}
                className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-medium appearance-none cursor-pointer transition-all disabled:opacity-50"
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
              disabled={isEditingTypes}
              className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none h-28 resize-none font-medium transition-all disabled:opacity-50"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="請輸入委託的詳細內容..."
            />
          </div>
        </div>
        
        <div className="md:col-span-2 pt-4 flex justify-end border-t border-stone-100 mt-2">
            {isEditingTypes ? (
                <div className="text-xs text-stone-400 font-medium flex items-center">
                    請先完成類型的編輯...
                </div>
            ) : (
                <button 
                    type="submit"
                    className="bg-[#1a472a] hover:bg-[#25613a] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-[#1a472a]/20 hover:-translate-y-0.5 active:scale-95 text-sm"
                >
                    建立委託單
                </button>
            )}
        </div>
      </form>
    </div>
  );
};