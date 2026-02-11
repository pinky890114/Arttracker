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
    try {
        const q = query(collection(db, COMMISSIONS_COLLECTION), orderBy("dateAdded", "desc"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Commission));
    } catch (error) {
        console.error("Error fetching commissions:", error);
        throw error;
    }
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
    } catch (error) {
        // Index needs to be created in Firebase Console usually for complex queries
        console.error("Error fetching artist commissions:", error);
        
        // Fallback: fetch all and filter client-side if index is missing (for prototyping)
        const all = await getAllCommissions();
        return all.filter(c => c.artistId === artistId);
    }
};

export const addCommission = async (
    commissionData: Omit<Commission, 'id'>
): Promise<Commission | null> => {
    try {
        const docRef = await addDoc(collection(db, COMMISSIONS_COLLECTION), commissionData);
        return {
            id: docRef.id,
            ...commissionData
        };
    } catch (error) {
        console.error("Error adding commission: ", error);
        return null;
    }
};

export const updateCommissionStatus = async (
    commissionId: string, 
    newStatus: CommissionStatus
): Promise<boolean> => {
    try {
        const commissionRef = doc(db, COMMISSIONS_COLLECTION, commissionId);
        await updateDoc(commissionRef, {
            status: newStatus,
            lastUpdated: new Date().toISOString().split('T')[0]
        });
        return true;
    } catch (error) {
        console.error("Error updating status: ", error);
        return false;
    }
};

export const deleteCommission = async (commissionId: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, COMMISSIONS_COLLECTION, commissionId));
        return true;
    } catch (error) {
        console.error("Error deleting commission: ", error);
        return false;
    }
};
