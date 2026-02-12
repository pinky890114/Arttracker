import { Commission, CommissionStatus } from '../types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where 
} from "firebase/firestore";

// Collection reference
const COMMISSIONS_COLLECTION = 'commissions';

export const getAllCommissions = async (): Promise<Commission[]> => {
    // 讓錯誤向上拋出，由 App.tsx 處理
    const q = query(collection(db, COMMISSIONS_COLLECTION), orderBy("dateAdded", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Commission));
};

export const getCommissionsForArtist = async (artistId: string): Promise<Commission[]> => {
    try {
        const q = query(
            collection(db, COMMISSIONS_COLLECTION), 
            where("artistId", "==", artistId),
            orderBy("dateAdded", "desc")
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Commission));
    } catch (error: any) {
        // 如果是權限錯誤，直接拋出，不要 fallback
        if (error.code === 'permission-denied') {
            throw error;
        }

        // Index needs to be created in Firebase Console usually for complex queries
        console.error("Error fetching artist commissions (likely index missing):", error);
        
        // Fallback: fetch all and filter client-side if index is missing (for prototyping)
        try {
            const all = await getAllCommissions();
            return all.filter(c => c.artistId === artistId);
        } catch (innerError) {
            throw innerError; // 如果 fallback 也失敗(例如權限問題)，就拋出
        }
    }
};

export const addCommission = async (
    commissionData: Omit<Commission, 'id'>
): Promise<Commission> => {
    // 直接拋出錯誤，不回傳 null
    const docRef = await addDoc(collection(db, COMMISSIONS_COLLECTION), commissionData);
    return {
        id: docRef.id,
        ...commissionData
    };
};

export const updateCommissionStatus = async (
    commissionId: string, 
    newStatus: CommissionStatus
): Promise<void> => {
    const commissionRef = doc(db, COMMISSIONS_COLLECTION, commissionId);
    await updateDoc(commissionRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString().split('T')[0]
    });
};

export const deleteCommission = async (commissionId: string): Promise<void> => {
    await deleteDoc(doc(db, COMMISSIONS_COLLECTION, commissionId));
};