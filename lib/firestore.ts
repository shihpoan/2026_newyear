// Firestore 資料庫操作工具
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// 新朋友資料型別
export interface NewFriend {
  id: string;
  name: string;
  gender: "male" | "female";
}

// 報名資料型別
export interface RegistrationData {
  platinumGroup: string;
  leaderName: string;
  newFriends: NewFriend[];
  exportedToSheet?: boolean; // 是否已匯出到 Google Sheets
  exportedAt?: Timestamp; // 匯出時間
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// 報名記錄型別（含 Firestore ID）
export interface Registration extends RegistrationData {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection 名稱
const REGISTRATIONS_COLLECTION = "registrations";

/**
 * 新增報名記錄
 */
export async function addRegistration(
  data: Omit<RegistrationData, "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    console.log("報名記錄已新增，ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("新增報名記錄失敗:", error);
    throw error;
  }
}

/**
 * 取得所有報名記錄
 */
export async function getRegistrations(): Promise<Registration[]> {
  try {
    const q = query(
      collection(db, REGISTRATIONS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const registrations: Registration[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      registrations.push({
        id: doc.id,
        platinumGroup: data.platinumGroup,
        leaderName: data.leaderName,
        newFriends: data.newFriends,
        exportedToSheet: data.exportedToSheet || false,
        exportedAt: data.exportedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return registrations;
  } catch (error) {
    console.error("取得報名記錄失敗:", error);
    throw error;
  }
}

/**
 * 取得按小組分組的統計資料
 */
export async function getStatsByGroup(): Promise<
  Map<string, { count: number; totalFriends: number }>
> {
  try {
    const registrations = await getRegistrations();
    const stats = new Map<string, { count: number; totalFriends: number }>();

    registrations.forEach((reg) => {
      const current = stats.get(reg.platinumGroup) || {
        count: 0,
        totalFriends: 0,
      };
      stats.set(reg.platinumGroup, {
        count: current.count + 1,
        totalFriends: current.totalFriends + reg.newFriends.length,
      });
    });

    return stats;
  } catch (error) {
    console.error("取得統計資料失敗:", error);
    throw error;
  }
}

/**
 * 取得未匯出的報名記錄
 */
export async function getUnexportedRegistrations(): Promise<Registration[]> {
  try {
    // 先取得所有資料，再在客戶端進行篩選和排序，避免需要 Firestore 索引
    const allRegistrations = await getRegistrations();

    // 篩選未匯出的資料
    const unexportedRegistrations = allRegistrations.filter(
      (reg) => !reg.exportedToSheet
    );

    return unexportedRegistrations;
  } catch (error) {
    console.error("取得未匯出記錄失敗:", error);
    throw error;
  }
}

/**
 * 標記報名記錄為已匯出
 */
export async function markAsExported(registrationIds: string[]): Promise<void> {
  try {
    const now = Timestamp.now();
    const updatePromises = registrationIds.map((id) =>
      updateDoc(doc(db, REGISTRATIONS_COLLECTION, id), {
        exportedToSheet: true,
        exportedAt: now,
        updatedAt: now,
      })
    );

    await Promise.all(updatePromises);
    console.log(`已標記 ${registrationIds.length} 筆記錄為已匯出`);
  } catch (error) {
    console.error("標記為已匯出失敗:", error);
    throw error;
  }
}

/**
 * 更新報名記錄
 */
export async function updateRegistration(
  id: string,
  data: Partial<RegistrationData>
): Promise<void> {
  try {
    const now = Timestamp.now();
    await updateDoc(doc(db, REGISTRATIONS_COLLECTION, id), {
      ...data,
      updatedAt: now,
    });
    console.log("報名記錄已更新，ID:", id);
  } catch (error) {
    console.error("更新報名記錄失敗:", error);
    throw error;
  }
}

/**
 * 刪除報名記錄
 */
export async function deleteRegistration(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, REGISTRATIONS_COLLECTION, id));
    console.log("報名記錄已刪除，ID:", id);
  } catch (error) {
    console.error("刪除報名記錄失敗:", error);
    throw error;
  }
}
