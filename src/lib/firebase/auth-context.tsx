"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./client";
import { fetchUserById } from "../firestore/users";
import { UserProfile, UserRole } from "@/types";
import { isAuthorizedStaffOrAdmin, isAdmin as checkIsAdmin } from "./rbac";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAuthorized: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLoginAsAdmin: () => void;
  demoLoginAsStaff: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  isAuthorized: false,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
  demoLoginAsAdmin: () => {},
  demoLoginAsStaff: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProfile = await fetchUserById(firebaseUser.uid);
          if (userProfile) {
            setProfile(userProfile);
            setRole(userProfile.role);
          } else {
            // Default staff role for newly logged-in manager users
            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "SolCafe Staff",
              phoneNumber: firebaseUser.phoneNumber || "",
              role: "admin",
            };
            setProfile(fallbackProfile);
            setRole("admin");
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setRole("admin");
        }
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    setLoading(true);
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setRole(null);
    setLoading(false);
  };

  const demoLoginAsAdmin = () => {
    setLoading(false);
    setRole("admin");
    setProfile({
      uid: "demo-admin-id",
      email: "admin@solcafe.com",
      displayName: "SolCafe Master Admin",
      phoneNumber: "+1 555-0199",
      role: "admin",
    });
  };

  const demoLoginAsStaff = () => {
    setLoading(false);
    setRole("staff");
    setProfile({
      uid: "demo-staff-id",
      email: "barista@solcafe.com",
      displayName: "SolCafe Barista Staff",
      phoneNumber: "+1 555-0188",
      role: "staff",
    });
  };

  const isAuthorized = isAuthorizedStaffOrAdmin(role);
  const isAdminUser = checkIsAdmin(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isAuthorized,
        isAdmin: isAdminUser,
        login,
        logout,
        demoLoginAsAdmin,
        demoLoginAsStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
