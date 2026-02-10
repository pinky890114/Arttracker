import React, { useState, useEffect, useMemo } from 'react';
import { Commission, CommissionStatus, ThemeMode } from './types';
import { MOCK_COMMISSIONS } from './constants';
import { CommissionCard } from './components/CommissionCard';
import { AddCommissionForm } from './components/AddCommissionForm';
import { Search, Palette, Sparkles, Lock, Unlock, LogIn, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [viewMode, setViewMode] = useState<ThemeMode>('client'); // Default is client
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | 'All'>('All');
  const [isAdding, setIsAdding] = useState(false);
  
  // Artist Login State
  const [currentArtist, setCurrentArtist] = useState<string>('');
  const [loginInput, setLoginInput] = useState('');

  // Data Loading State
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Data
  useEffect(() => {
    const stored = localStorage.getItem('arttrack_commissions_zh_v1');
    if (stored) {
      try {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
             // Migration: Ensure artistId exists
            parsed = parsed.map((c: any) => ({
                ...c,
                artistId: c.artistId || 'Unknown'
            }));
            setCommissions(parsed);
        } else {
            setCommissions(MOCK_COMMISSIONS);
        }
      } catch (e) {
        console.error("Failed to parse commissions from local storage", e);
        setCommissions(MOCK_COMMISSIONS);
      }
    } else {
      setCommissions(MOCK_COMMISSIONS);
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistence
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('arttrack_commissions_zh_v1', JSON.stringify(commissions));
    }
  }, [commissions, isLoaded]);

  // Handlers
  const handleUpdateStatus = (id: string, newStatus: CommissionStatus) => {
    setCommissions(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : c
    ));
  };

  const handleDelete = (id: string) => {
    // Confirmation is now handled in the CommissionCard component
    setCommissions(prev => prev.filter(c => c.id !== id));
  };

  const handleAdd = (newCommission: Commission) => {
    // Overwrite artistId with currently logged in artist
    const commissionToAdd = {
        ...newCommission,
        artistId: currentArtist || 'Unknown'
    };
    setCommissions(prev => [commissionToAdd, ...prev]);
    setIsAdding(false);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'client' ? 'admin' : 'client');
    // We do NOT clear currentArtist here, so they can switch back and forth easily.
    // But if they want to "Logout", we provide a separate button.
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (loginInput.trim()) {
          setCurrentArtist(loginInput.trim());
          setLoginInput('');
      }
  };

  const handleLogout = () => {
      setCurrentArtist('');
  };

  // Filter Logic
  const filteredCommissions = useMemo(() => {
    return commissions.filter(c => {
      // 1. Admin Mode: Must match logged in artist
      if (viewMode === 'admin' && currentArtist) {
          if (c.artistId !== currentArtist) return false;
      }

      // 2. Search & Filter
      const matchesSearch = 
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Client mode might search for specific artist too
        (viewMode === 'client' && c.artistId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [commissions, searchTerm, statusFilter, viewMode, currentArtist]);

  // View Logic: Should we show the list?
  const shouldShowList = useMemo(() => {
    // Admin: Show list only if logged in
    if (viewMode === 'admin') return !!currentArtist;
    // Client: Must search to see results
    return searchTerm.trim().length > 0;
  }, [viewMode, searchTerm, currentArtist]);

  // Statistics (Global for client, Filtered for admin)
  const stats = useMemo(() => {
    const targetCommissions = (viewMode === 'admin' && currentArtist) 
        ? commissions.filter(c => c.artistId === currentArtist)
        : commissions;

    return {
        queue: targetCommissions.filter(c => c.status === CommissionStatus.QUEUE).length,
        active: targetCommissions.filter(c => c.status !== CommissionStatus.QUEUE && c.status !== CommissionStatus.DONE).length,
        done: targetCommissions.filter(c => c.status === CommissionStatus.DONE).length
    }
  }, [commissions, viewMode, currentArtist]);

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-stone-700 selection:bg-emerald-200 flex flex-col">
      
      {/* Main Content */}
      <main className="flex-grow pt-12 pb-10 px-6 max-w-5xl mx-auto w-full">
        
        {/* Simple Top Branding */}
        <div className="flex items-center justify-between mb-8 text-[#1a472a] opacity-90">
            <div className="flex items-center gap-2">
                <div className="bg-[#1a472a] text-white p-1.5 rounded-lg shadow-sm transform -rotate-3">
                    <Sparkles size={18} />
                </div>
                <h1 className="text-xl font-bold tracking-wide">Commission Tracker</h1>
            </div>
            
            {/* Show Logged in Artist in Admin Mode */}
            {viewMode === 'admin' && currentArtist && (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm text-stone-600">
                        👨‍🎨 {currentArtist}
                    </span>
                    <button 
                        onClick={handleLogout}
                        className="text-xs font-bold text-stone-400 hover:text-stone-600 underline"
                    >
                        登出
                    </button>
                </div>
            )}
        </div>

        {/* Intro / Stats */}
        {/* If Admin + Not Logged In, hide stats to keep login screen clean */}
        {!(viewMode === 'admin' && !currentArtist) && (
            <div className="mb-10 text-center sm:text-left sm:flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="mb-8 sm:mb-0">
                    <h2 className="text-3xl font-bold text-[#1a472a] mb-3 tracking-tight">
                        {viewMode === 'client' ? '委託進度一覽 ✨' : `歡迎回來，${currentArtist}！🎨`}
                    </h2>
                    <p className="text-stone-500 max-w-lg font-medium leading-relaxed">
                        {viewMode === 'client' 
                            ? '歡迎回來！請輸入您的 ID 或暱稱，查詢您的委託進度～' 
                            : '今天也要元氣滿滿的畫圖！這裡可以管理排單和進度喔。'}
                    </p>
                </div>
                <div className="flex gap-3 justify-center sm:justify-end text-sm">
                    <div className="bg-white border-2 border-stone-200 px-4 py-3 rounded-2xl text-center min-w-[80px] shadow-sm transform hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-bold text-stone-600">{stats.queue}</div>
                        <div className="text-xs text-stone-400 font-bold">排單中</div>
                    </div>
                    <div className="bg-white border-2 border-emerald-100 px-4 py-3 rounded-2xl text-center min-w-[80px] shadow-sm transform hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                        <div className="text-xs text-emerald-600/70 font-bold">繪製中</div>
                    </div>
                    <div className="bg-white border-2 border-[#1a472a]/20 px-4 py-3 rounded-2xl text-center min-w-[80px] shadow-sm transform hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-bold text-[#1a472a]">{stats.done}</div>
                        <div className="text-xs text-[#1a472a]/70 font-bold">已完成</div>
                    </div>
                </div>
            </div>
        )}

        {/* --- Logic Branching --- */}
        
        {viewMode === 'admin' && !currentArtist ? (
            // === Admin Login Screen ===
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border-2 border-stone-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-[#1a472a] rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <Palette size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-700 mb-2">繪師後台登入</h3>
                    <p className="text-stone-400 mb-8 font-medium">請輸入您的名稱以管理委託</p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="輸入名稱 (例如: 兔兔老師)" 
                            className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 text-center font-bold text-stone-700 focus:outline-none focus:border-[#1a472a] focus:ring-4 focus:ring-[#1a472a]/10 transition-all placeholder:font-normal"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={!loginInput.trim()}
                            className="w-full bg-[#1a472a] hover:bg-[#25613a] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#1a472a]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            進入管理介面 <ArrowRight size={18} />
                        </button>
                    </form>
                    
                    <div className="mt-6 text-xs text-stone-400">
                        * 此為範例，不需要密碼即可登入
                    </div>
                </div>
            </div>
        ) : (
            // === Main Dashboard (Client Search or Admin Manager) ===
            <>
                {/* Controls - Floating & Rounded */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-6 z-40 bg-[#fbfaf8]/90 p-4 -mx-4 md:mx-0 rounded-3xl border-2 border-white shadow-lg shadow-stone-200/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                    <input 
                      type="text" 
                      placeholder={viewMode === 'client' ? "搜尋委託人名稱、項目或 ID..." : "在您的委託中搜尋..."}
                      className="w-full bg-white border-2 border-stone-200 text-stone-700 pl-12 pr-6 py-3 rounded-full focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none transition-all placeholder:text-stone-400 font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar px-1">
                    <select 
                        className="bg-white border-2 border-stone-200 text-stone-600 px-6 py-3 rounded-full focus:ring-4 focus:ring-[#1a472a]/10 focus:border-[#1a472a] focus:outline-none font-bold cursor-pointer hover:border-stone-300"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="All">所有狀態</option>
                        {Object.values(CommissionStatus).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    
                    {viewMode === 'admin' && (
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className="flex items-center gap-2 bg-[#1a472a] hover:bg-[#25613a] text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-[#1a472a]/20 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap active:scale-95"
                        >
                            <Palette size={20} /> 新增委託
                        </button>
                    )}
                  </div>
                </div>

                {/* Add Form */}
                {viewMode === 'admin' && isAdding && (
                    <AddCommissionForm onAdd={handleAdd} onCancel={() => setIsAdding(false)} />
                )}

                {/* List */}
                <div className="space-y-6">
                    {!shouldShowList ? (
                        // Client Mode: No Search Yet
                        <div className="text-center py-20 opacity-70">
                            <div className="mx-auto w-20 h-20 bg-stone-100/50 rounded-full flex items-center justify-center mb-5 animate-[pulse_3s_ease-in-out_infinite]">
                                <Search className="text-stone-300" size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-500">輸入關鍵字開始查詢</h3>
                            <p className="text-stone-400 mt-2 font-medium text-sm">請在上方搜尋欄輸入您的 ID 或委託名稱</p>
                        </div>
                    ) : filteredCommissions.length === 0 ? (
                        // Search resulted in empty
                        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                            <div className="mx-auto w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-stone-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-600">找不到相關委託捏...</h3>
                            <p className="text-stone-400 mt-2 font-medium">
                                {viewMode === 'admin' ? "目前沒有符合條件的委託" : "試試看別的關鍵字？"}
                            </p>
                        </div>
                    ) : (
                        // Results List
                        filteredCommissions.map(commission => (
                            <CommissionCard 
                                key={commission.id}
                                commission={commission}
                                isAdmin={viewMode === 'admin'}
                                onUpdateStatus={handleUpdateStatus}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </>
        )}

      </main>

      {/* Footer with Admin Switch */}
      <footer className="py-8 border-t border-stone-200 text-center relative">
        <p className="text-stone-400 text-sm font-medium mb-4">
            © {new Date().getFullYear()} ArtTrack Dashboard. Made with 💚 for Artists.
        </p>
        
        <div className="flex justify-center">
            <button 
                onClick={toggleViewMode}
                className={`p-2 rounded-full transition-all duration-300 ${viewMode === 'admin' ? 'bg-stone-200 text-stone-600' : 'text-stone-300 hover:text-stone-400'}`}
                title={viewMode === 'client' ? "繪師登入" : "返回查詢"}
            >
                {viewMode === 'admin' ? <Unlock size={16} /> : <Lock size={16} />}
            </button>
        </div>
      </footer>
    </div>
  );
};

export default App;