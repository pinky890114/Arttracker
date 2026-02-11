import { createClient } from '@supabase/supabase-js';
import { Commission } from '../types';

// Storage keys
const STORAGE_KEY_URL = 'arttrack_supabase_url';
const STORAGE_KEY_ANON = 'arttrack_supabase_key';

// Attempt to get keys from local storage
const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
const storedKey = localStorage.getItem(STORAGE_KEY_ANON);

// Check if configured
export const isSupabaseConfigured = !!(storedUrl && storedKey);

// Helper to save credentials and reload
export const configureSupabase = (url: string, key: string) => {
    if (!url || !key) return false;
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
    window.location.reload(); // Reload to re-initialize the client
    return true;
};

export const resetSupabaseConfig = () => {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    window.location.reload();
};

// Use stored values or fallbacks to prevent crash during initialization
// If not configured, these fallbacks will cause requests to fail, but App.tsx handles the UI state.
const supabaseUrl = storedUrl || "https://placeholder.supabase.co";
const supabaseAnonKey = storedKey || "placeholder";

// 'public' schema 是預設的。泛型參數能讓 TypeScript 了解我們資料表的結構。
export const supabase = createClient<{
    public: {
        Tables: {
            commissions: {
                Row: Commission; // 資料表中的一行資料的型別
                Insert: Omit<Commission, 'id'>; // 插入新資料時的型別
                Update: Partial<Commission>; // 更新資料時的型別
            };
        };
    };
}>(supabaseUrl, supabaseAnonKey);
