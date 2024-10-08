"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from './firebase';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User extends FirebaseUser {
  role?: string;
  subscription?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        let userData = userDoc.data();

        if (!userDoc.exists() || !userData) {
          // If the user document doesn't exist, create it
          userData = {
            email: firebaseUser.email,
            role: firebaseUser.email === 'admin@example.com' ? 'admin' : 'user',
            subscription: firebaseUser.email === 'admin@example.com' ? 'Admin' : 'Free',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, userData);
        }

        const user: User = {
          ...firebaseUser,
          role: userData.role,
          subscription: userData.subscription,
        };
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      createdAt: new Date().toISOString(),
      subscription: 'Free',
      role: 'user',
      status: 'active',
    });
  };

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};