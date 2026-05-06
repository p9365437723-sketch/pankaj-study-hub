import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as fbSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup
} from 'firebase/auth';

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit 
} from 'firebase/firestore';

import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {

    if (!auth) {
      setIsDemoMode(true);

      const saved = localStorage.getItem('demo_user');

      if (saved) {
        const savedUser = JSON.parse(saved);
        setUser(savedUser);
      }

      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {

      if (fbUser) {

        try {

          if (!db) {

            const profile: UserProfile = {
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
              email: fbUser.email || '',
              role: UserRole.STUDENT,
              createdAt: new Date(),
              lastLogin: new Date(),
              photoURL: fbUser.photoURL || undefined
            };

            setUser(profile);
            return;
          }

          const userRef = doc(db, 'users', fbUser.uid);

          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {

            const userData = userSnap.data() as UserProfile;

            if (userData.isBlocked) {

              await fbSignOut(auth);

              setUser(null);
              setLoading(false);

              return;
            }

            await updateDoc(userRef, {
              lastLogin: serverTimestamp()
            });

            setUser({
              ...userData,
              lastLogin: new Date()
            });

          } else {

            const usersRef = collection(db, 'users');

            const q = query(
              usersRef,
              where('email', '==', fbUser.email),
              limit(1)
            );

            const querySnap = await getDocs(q);

            if (!querySnap.empty) {

              const existingData = querySnap.docs[0].data() as UserProfile;

              if (existingData.isBlocked) {

                await fbSignOut(auth);
                setUser(null);

              } else {

                setUser(existingData);
              }

            } else {

              const newUser: UserProfile = {
                uid: fbUser.uid,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
                email: fbUser.email || '',

                role:
                  fbUser.email === 'p9365437723@gmail.com'
                    ? UserRole.ADMIN
                    : UserRole.STUDENT,

                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                isBlocked: false,

                provider:
                  fbUser.providerData[0]?.providerId === 'google.com'
                    ? 'google'
                    : 'password',

                photoURL: fbUser.photoURL || undefined
              };

              await setDoc(userRef, newUser);

              setUser(newUser);
            }
          }

        } catch (e) {

          console.error('Error fetching user profile:', e);

          setUser({
            uid: fbUser.uid,
            name: fbUser.displayName || 'Student',
            email: fbUser.email || '',
            role: UserRole.STUDENT,
            createdAt: new Date(),
            lastLogin: new Date(),
          });
        }

      } else {

        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;

  }, []);

  const signIn = async (email: string, pass: string) => {

    if (auth) {

      await signInWithEmailAndPassword(
        auth,
        email,
        pass
      );
    }
  };

  const signInWithGoogle = async () => {

    if (auth && googleProvider) {

      await signInWithPopup(
        auth,
        googleProvider
      );
    }
  };

  const signUp = async (email: string, pass: string) => {

    if (auth) {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          pass
        );

      await sendEmailVerification(
        userCredential.user
      );

      await fbSignOut(auth);
    }
  };

  const signOut = async () => {

    localStorage.removeItem('demo_user');

    if (auth) {

      await fbSignOut(auth);
    }
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        isDemoMode
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (context === undefined) {

    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}