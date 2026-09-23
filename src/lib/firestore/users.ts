import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { UserProfile, UserRole } from "@/types";

const USERS_COLLECTION = "users";

export function normalizeUserProfile(id: string, data: Record<string, any>): UserProfile {
  return {
    uid: id,
    email: data.email || "",
    displayName: data.name || data.username || data.displayName || "SolCafe Customer",
    phoneNumber: data.phone || data.phoneNumber || "",
    role: (data.role as UserRole) || "customer",
    createdAt: data.createdAt || undefined,
  };
}

export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users = snapshot.docs.map((docSnap) => normalizeUserProfile(docSnap.id, docSnap.data()));
      callback(users);
    },
    (error) => {
      console.error("Error subscribing to users stream:", error);
      callback([]);
    }
  );
}

export async function fetchUserById(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return normalizeUserProfile(snap.id, snap.data());
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    role: newRole,
    updatedAt: new Date().toISOString(),
  });
}
