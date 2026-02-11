import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Commission, CommissionStatus, ThemeMode } from './types';
import { DEFAULT_COMMISSION_TYPES } from './constants';
import { CommissionCard } from './components/CommissionCard';
import { AddCommissionForm } from './components/AddCommissionForm';
import { Search, Palette, Sparkles, Lock, Unlock, ArrowRight, ChevronDown, LoaderCircle, PenTool, AlertTriangle, KeyRound, Mail, User } from 'lucide-react';
import { 
    getCommissionsForArtist, 
    getAllCommissions, 
    addCommission, 
    updateCommissionStatus, 
    deleteCommission 
} from './services/dataService';
import { auth } from './services/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';

const App: React.FC = () => {
  // State
  const [allCommissions, setAllCommissions] = useState<Commission[]>([]);
  const [myCommissions, setMyCommissions] = useState<Commission[]>([]);

  const [viewMode, setViewMode] = useState<ThemeMode>('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | 'All'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedArtistFilter, setSelectedArtistFilter] = useState<string>('All');
  
  const [commissionTypes, setCommissionTypes] = useState<string[]>(DEFAULT_COMMISSION_TYPES);

  // --- NEW AUTH STATE ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Auth Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [artistNameInput, setArtistNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- AUTH LISTENER ---
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
              // Automatically switch to admin view if logged in
              // But only if we are not already in admin view (to prevent forcing it if user navigated away)
              // Actually, keeping it simple: Just set user state.
          }
      });
      return () => unsubscribe();
  }, []);

  // --- DATA FETCHING ---
  const fetchAllData = useCallback(async (isLogin: boolean = false) => {
    if (!isLogin) setIsLoading(true);
    setError(null);
    try {
        const publicCommissions = await getAllCommissions();
        setAllCommissions(publicCommissions);

        if (user && user.displayName) {
            const artistCommissions = await getCommissionsForArtist(user.displayName);
            setMyCommissions(artistCommissions);
        }
    } catch (err: any) {
        // Show specific error message
        console.error("Firebase Error Full:", err);
        const errorMsg = err?.message || err?.code || JSON.stringify(err);
        setError(`${errorMsg}`);
    } finally {
        if (!isLogin) setIsLoading(false);
    }
  }, [user]);
  
  // Initial load
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch personal data when user changes
  useEffect(() => {
    if (user && user.displayName) {
        const fetchPersonalData = async () => {
            setIsLoading(true);
            await fetchAllData(true); 
            setIsLoading(false);
        }
        fetchPersonalData();
    } else {
        setMyCommissions([]);
    }
  }, [user, fetchAllData]);

  // Persistence for custom types
  useEffect(() => {
    const storedTypes = localStorage.getItem('arttrack_types_zh_v1');
    if (storedTypes) {
        try {
            const parsedTypes = JSON.parse(storedTypes);
            if (Array.isArray(parsedTypes) && parsedTypes.length > 0) {
                setCommissionTypes(parsedTypes);
            }
        } catch (e) { console.error("Failed to parse types", e); }
    }
  }, []);

  const handleUpdateTypes = (newTypes: string[]) => {
      setCommissionTypes(newTypes);
      localStorage.setItem('arttrack_types_zh_v1', JSON.stringify(newTypes));
  };


  // --- COMPUTED VALUES ---
  const uniqueArtists = useMemo(() => {
    const artists = new Set(allCommissions.map(c => c.artistId).filter(Boolean));
    return Array.from(artists);
  }, [allCommissions]);

  // --- HANDLERS (CRUD operations) ---
  const handleUpdateStatus = async (id: string, newStatus: CommissionStatus) => {
    const originalCommissions = [...myCommissions];
    setMyCommissions(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : c
    ));

    const success = await updateCommissionStatus(id, newStatus);
    if (!success) {
      setMyCommissions(originalCommissions);
      alert("更新失敗，請重試！");
    } else {
      fetchAllData(true);
    }
  };

  const handleDelete = async (id: string) => {
    const originalCommissions = [...myCommissions];
    setMyCommissions(prev => prev.filter(c => c.id !== id));
    
    const success = await deleteCommission(id);
    if (!success) {
        setMyCommissions(originalCommissions);
        alert("刪除失敗，請重試！");
    } else {
      fetchAllData(true);
    }
  };

  const handleAdd = async (newCommissionData: Omit<Commission, 'id' | 'artistId' | 'userId'>) => {
    if (!user || !user.displayName) return;

    const commissionToAdd: Omit<Commission, 'id'> = {
        ...newCommissionData,
        artistId: user.displayName,
        userId: user.uid, // Use UID for owner check if we had stricter rules
        dateAdded: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
    };

    const addedCommission = await addCommission(commissionToAdd);
    if (addedCommission) {
        setMyCommissions(prev => [addedCommission, ...prev]);
        setIsAdding(false);
        fetchAllData(true);
    } else {
        alert("新增失敗，請重試！");
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'client' ? 'admin' : 'client');
    if (viewMode === 'client') {
        setSelectedArtistFilter('All');
        setAuthError('');
        setPasswordInput('');
        setEmailInput('');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setIsAuthLoading(true);

      try {
          if (authMode === 'login') {
             await signInWithEmailAndPassword(auth, emailInput, passwordInput);
          } else {
             if (!artistNameInput.trim()) {
                 throw new Error("請輸入繪師暱稱");
             }
             const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
             // Update the profile with the artist name immediately
             await updateProfile(userCredential.user, {
                 displayName: artistNameInput
             });
             // Force refresh user state to get the displayName
             setUser({...userCredential.user, displayName: artistNameInput});
          }
          // Cleanup
          setEmailInput('');
          setPasswordInput('');
          setArtistNameInput('');
      } catch (err: any) {
          console.error("Auth Error:", err);
          if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
              setAuthError("帳號或密碼錯誤。若您尚未註冊，請先切換至「註冊」頁面。");
          } else if (err.code === 'auth/email-already-in-use') {
              setAuthError("此 Email 已經註冊過了，請直接登入。");
          } else if (err.code === 'auth/weak-password') {
              setAuthError("密碼太弱，請至少輸入 6 個字元。");
          } else if (err.code === 'auth/operation-not-allowed') {
              setAuthError("錯誤：請至 Firebase Console 開啟 Email/Password 登入功能。");
          } else {
              setAuthError(err.message || "登入失敗，請稍後再試。");
          }
      } finally {
          setIsAuthLoading(false);
      }
  };

  const handleLogout = async () => {
      try {
        await signOut(auth);
        setMyCommissions([]);
        setViewMode('client');
      } catch (error) {
        console.error("Logout failed", error);
      }
  };

  const commissionsToDisplay = useMemo(() => {
      const sourceData = viewMode === 'admin' ? myCommissions : allCommissions;

      return sourceData.filter(c => {
        if (viewMode === 'client' && selectedArtistFilter !== 'All') {
            if (c.artistId !== selectedArtistFilter) return false;
        }

        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          c.clientName.toLowerCase().includes(term) || 
          c.title.toLowerCase().includes(term) ||
          c.id.toString().toLowerCase().includes(term);
        
        const matchesFilter = statusFilter === 'All' || c.status === statusFilter;

        return matchesSearch && matchesFilter;
      });
  }, [myCommissions, allCommissions, searchTerm, statusFilter, viewMode, selectedArtistFilter]);
  
  const shouldShowList = useMemo(() => {
    if (viewMode === 'admin') return !!user;
    // Show list if there is a search term OR if we are just browsing specific artist
    if (selectedArtistFilter !== 'All') return true;
    return searchTerm.trim().length > 0;
  }, [viewMode, searchTerm, user, selectedArtistFilter]);

  const stats = useMemo(() => {
    let targetCommissions = allCommissions;

    if (viewMode === 'admin') {
        targetCommissions = myCommissions;
    } else if (selectedArtistFilter !== 'All') {
        targetCommissions = allCommissions.filter(c => c.artistId === selectedArtistFilter);
    }

    return {
        queue: targetCommissions.filter(c => c.status === CommissionStatus.QUEUE).length,
        active: targetCommissions.filter(c => c.status !== CommissionStatus.QUEUE && c.status !== CommissionStatus.DONE).length,
        done: targetCommissions.filter(c => c.status === CommissionStatus.DONE).length
    }
  }, [allCommissions, myCommissions, viewMode, selectedArtistFilter]);


  // --- RENDER: LOADING ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#fbfaf8] flex flex-col items-center justify-center text-[#1a472a]">
            <LoaderCircle size={48} className="animate-spin" />
            <p className="mt-4 text-lg font-bold">正在同步資料...</p>
        </div>
    );
  }

  // --- RENDER: ERROR ---
  if (error) {
    const isPermissionError = error.includes("permission-denied") || error.includes("Missing or insufficient permissions");

    return (
        <div className="min-h-screen bg-[#fbfaf8] flex flex-col items-center justify-center p-6">
             <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border-2 border-stone-100 max-w-lg w-full">
                {isPermissionError ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-stone-700">需要設定資料庫權限</h2>
                            <p className="text-stone-500 mt-2 font-medium">Firebase 預設會阻擋所有讀寫請求。</p>
                        </div>
                        
                        <div className="space-y-4 text-sm text-stone-600 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                            <p className="font-bold text-stone-800">請依照以下步驟開啟權限：</p>
                            <ol className="list-decimal pl-5 space-y-2 marker:text-orange-500 marker:font-bold">
                                <li>回到 <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800 font-bold">Firebase Console</a></li>
                                <li>點選左側 <strong>Build</strong> &gt; <strong>Firestore Database</strong></li>
                                <li>點選上方的 <strong>Rules (規則)</strong> 分頁</li>
                                <li>將程式碼修改為下方內容 (允許所有讀寫)：</li>
                            </ol>
                            <div className="bg-stone-800 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto mt-2 select-all shadow-inner border border-stone-700">
                                rules_version = '2';<br/>
                                service cloud.firestore &#123;<br/>
                                &nbsp;&nbsp;match /databases/&#123;database&#125;/documents &#123;<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;match /&#123;document=**&#125; &#123;<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow read, write: if true;<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
                                &nbsp;&nbsp;&#125;<br/>
                                &#125;
                            </div>
                            <p className="mt-2 text-xs text-stone-400 font-medium">* 修改後請務必點擊右上角的 <strong>Publish (發佈)</strong> 按鈕。</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                             <p className="text-lg font-bold mb-2 text-stone-700">發生連線錯誤</p>
                             <p className="text-stone-500 mb-6 font-mono text-xs bg-stone-100 p-2 rounded break-all border border-stone-200">{error}</p>
                        </div>
                        <div className="text-sm text-stone-400 text-left space-y-2 bg-stone-50 p-4 rounded-xl">
                            <p>可能原因：</p>
                            <ul className="list-disc pl-5">
                                <li>Firebase 配置錯誤 (Project ID 不存在)</li>
                                <li>網路連線不穩</li>
                                <li>如果是 "Index" 相關錯誤，請查看 Console 中的連結建立索引。</li>
                            </ul>
                        </div>
                    </>
                )}
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-8 w-full bg-[#1a472a] text-white py-3 rounded-xl font-bold hover:bg-[#25613a] transition-colors shadow-lg shadow-[#1a472a]/20"
                >
                  已完成設定，重新整理
                </button>
             </div>
        </div>
    )
  }

  // --- RENDER: MAIN APP ---
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-stone-700 selection:bg-emerald-200 flex flex-col">
      <main className="flex-grow pt-12 pb-10 px-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8 text-[#1a472a] opacity-90">
            <div className="flex items-center gap-2">
                <div className="bg-[#1a472a] text-white p-1.5 rounded-lg shadow-sm transform -rotate-3">
                    <Sparkles size={18} />
                </div>
                
                {viewMode === 'client' ? (
                     <div className="relative group">
                        <select 
                            value={selectedArtistFilter}
                            onChange={(e) => setSelectedArtistFilter(e.target.value)}
                            className="appearance-none bg-transparent text-xl font-bold tracking-wide border-b-2 border-transparent hover:border-[#1a472a]/20 cursor-pointer pr-8 focus:outline-none transition-all text-[#1a472a] py-1"
                        >
                            <option value="All">所有繪師</option>
                            {uniqueArtists.map(artist => (
                                <option key={artist} value={artist}>{artist} 的委託表</option>
                            ))}
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#1a472a]/50 group-hover:translate-y-0 transition-transform">
                            <ChevronDown size={20} />
                        </div>
                     </div>
                ) : (
                    <h1 className="text-xl font-bold tracking-wide">Commission Tracker</h1>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                {viewMode === 'admin' && user && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm text-stone-600">
                            👨‍🎨 {user.displayName || '繪師'}
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
        </div>

        {!(viewMode === 'admin' && !user) && (
            <div className="mb-10 text-center sm:text-left sm:flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="mb-8 sm:mb-0">
                    <h2 className="text-3xl font-bold text-[#1a472a] mb-3 tracking-tight">
                        {viewMode === 'client' 
                            ? (selectedArtistFilter === 'All' ? '委託進度一覽 ✨' : `${selectedArtistFilter} の委託現況 🎨`)
                            : `歡迎回來，${user?.displayName || '繪師'}！🎨`
                        }
                    </h2>
                    <p className="text-stone-500 max-w-lg font-medium leading-relaxed">
                        {viewMode === 'client' 
                            ? '選擇繪師並輸入您的 ID 或暱稱，即可查詢進度～' 
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
        
        {viewMode === 'admin' && !user ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border-2 border-stone-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-[#1a472a] rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <Palette size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-700 mb-2">
                        {authMode === 'login' ? '繪師後台登入' : '註冊新帳號'}
                    </h3>
                    <p className="text-stone-400 mb-8 font-medium">
                        {authMode === 'login' ? '請輸入您的帳號密碼以管理委託' : '建立您的委託管理頁面'}
                    </p>
                    
                    <form onSubmit={handleAuth} className="space-y-4">
                        
                        {authMode === 'register' && (
                            <div className="text-left space-y-1 animate-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-stone-500 ml-1">繪師暱稱 (公開顯示)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="例如: 兔兔老師" 
                                        required
                                        className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-700 focus:outline-none focus:border-[#1a472a] focus:ring-4 focus:ring-[#1a472a]/10 transition-all placeholder:font-normal pl-10"
                                        value={artistNameInput}
                                        onChange={(e) => setArtistNameInput(e.target.value)}
                                    />
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        <div className="text-left space-y-1">
                            <label className="text-xs font-bold text-stone-500 ml-1">Email 信箱</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    required
                                    className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-700 focus:outline-none focus:border-[#1a472a] focus:ring-4 focus:ring-[#1a472a]/10 transition-all placeholder:font-normal pl-10"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                />
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="text-left space-y-1">
                            <label className="text-xs font-bold text-stone-500 ml-1">密碼</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    placeholder="******" 
                                    required
                                    className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-700 focus:outline-none focus:border-[#1a472a] focus:ring-4 focus:ring-[#1a472a]/10 transition-all placeholder:font-normal pl-10"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                />
                                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                            </div>
                        </div>

                        {authError && (
                            <div className="text-red-500 text-sm font-bold bg-red-50 py-2 rounded-lg animate-pulse">
                                {authError}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isAuthLoading}
                            className="w-full bg-[#1a472a] hover:bg-[#25613a] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#1a472a]/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isAuthLoading ? (
                                <LoaderCircle className="animate-spin" size={20} />
                            ) : (
                                <>
                                   {authMode === 'login' ? '進入管理介面' : '立即註冊'} <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <button 
                                type="button"
                                onClick={() => {
                                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                                    setAuthError('');
                                }}
                                className="text-xs font-bold text-stone-400 hover:text-[#1a472a] underline transition-colors"
                            >
                                {authMode === 'login' ? '還沒有帳號？點此註冊' : '已經有帳號？點此登入'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        ) : (
            <>
                <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-6 z-40 bg-[#fbfaf8]/90 p-4 -mx-4 md:mx-0 rounded-3xl border-2 border-white shadow-lg shadow-stone-200/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                    <input 
                      type="text" 
                      placeholder={viewMode === 'client' ? "輸入您的名稱 (ID) 查詢進度..." : "在您的委託中搜尋..."}
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

                {viewMode === 'admin' && isAdding && (
                    <AddCommissionForm 
                        onAdd={(c) => handleAdd(c as any)} 
                        onCancel={() => setIsAdding(false)} 
                        availableTypes={commissionTypes}
                        onUpdateTypes={handleUpdateTypes}
                    />
                )}

                <div className="space-y-6">
                    {/* Empty State Logic */}
                    {allCommissions.length === 0 && viewMode === 'client' ? (
                        <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
                             <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                <PenTool className="text-[#1a472a]" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-600 mb-2">新的開始！</h3>
                            <p className="text-stone-500 max-w-md mx-auto mb-8 font-medium">
                                目前還沒有任何委託資料。如果您是繪師，請點擊下方的鎖頭圖示登入後台，新增您的第一筆委託吧！
                            </p>
                            <button 
                                onClick={toggleViewMode}
                                className="inline-flex items-center gap-2 bg-[#1a472a] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#1a472a]/20 hover:bg-[#25613a] transition-all"
                            >
                                <Unlock size={18} /> 前往後台登入
                            </button>
                        </div>
                    ) : !shouldShowList ? (
                        <div className="text-center py-20 opacity-70">
                            <div className="mx-auto w-20 h-20 bg-stone-100/50 rounded-full flex items-center justify-center mb-5 animate-[pulse_3s_ease-in-out_infinite]">
                                <Search className="text-stone-300" size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-500">輸入委託人名稱開始查詢</h3>
                            <p className="text-stone-400 mt-2 font-medium text-sm">請在上方搜尋欄輸入您的 ID 以查看進度</p>
                        </div>
                    ) : commissionsToDisplay.length === 0 ? (
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
                        commissionsToDisplay.map(commission => (
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