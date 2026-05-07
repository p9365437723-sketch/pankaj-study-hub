import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  User,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import {
  auth,
  db,
  googleProvider,
} from '../lib/firebase';

import {
  UserProfile,
  UserRole,
} from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<void>;

  signUp: (
    email: string,
    password: string
  ) => Promise<void>;

  signInWithGoogle: () => Promise<void>;

  signOut: () => Promise<void>;

  isDemoMode: boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [isDemoMode, setIsDemoMode] =
    useState(false);

  useEffect(() => {
    if (!auth || !db) {
      setIsDemoMode(true);

      const saved =
        localStorage.getItem('demo_user');

      if (saved) {
        setUser(JSON.parse(saved));
      }

      setLoading(false);

      return;
    }

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (fbUser) => {
          try {
            if (!fbUser) {
              setUser(null);
              setLoading(false);
              return;
            }

            const profile =
              await getOrCreateUserProfile(
                fbUser
              );

            if (!profile) {
              setUser(null);
              setLoading(false);
              return;
            }

            setUser(profile);
          } catch (error) {
            console.error(
              'AUTH ERROR:',
              error
            );

            setUser(null);
          } finally {
            setLoading(false);
          }
        }
      );

    return unsubscribe;
  }, []);

  async function getOrCreateUserProfile(
    fbUser: User
  ): Promise<UserProfile | null> {
    if (!db) return null;

    const userRef = doc(
      db,
      'users',
      fbUser.uid
    );

    const userSnap = await getDoc(userRef);

    // EXISTING USER

    if (userSnap.exists()) {
      const data =
        userSnap.data() as UserProfile;

      // BLOCKED USER

      if (data.isBlocked) {
        await fbSignOut(auth);

        return null;
      }

      // EMAIL VERIFICATION CHECK

      if (
        data.provider === 'password' &&
        !fbUser.emailVerified
      ) {
        await fbSignOut(auth);

        throw new Error(
          'Please verify your email first.'
        );
      }

      // UPDATE LAST LOGIN

      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      });

      return {
        ...data,
        uid: fbUser.uid,
      };
    }

    // NEW USER

    const newUser: UserProfile = {
      uid: fbUser.uid,

      name:
        fbUser.displayName ||
        fbUser.email?.split('@')[0] ||
        'Student',

      email: fbUser.email || '',

      // DEFAULT ROLE
      role: UserRole.STUDENT,

      createdAt: new Date(),

      lastLogin: new Date(),

      isBlocked: false,

      provider:
        fbUser.providerData[0]
          ?.providerId === 'google.com'
          ? 'google'
          : 'password',

      photoURL:
        fbUser.photoURL || '',

      emailVerified:
        fbUser.emailVerified,
    };

    await setDoc(userRef, {
      ...newUser,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    return newUser;
  }

  // SIGN IN

  const signIn = async (
    email: string,
    password: string
  ) => {
    if (!auth) return;

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    // VERIFY EMAIL

    if (!result.user.emailVerified) {
      await fbSignOut(auth);

      throw new Error(
        'Please verify your email before login.'
      );
    }
  };

  // GOOGLE LOGIN

  const signInWithGoogle =
    async () => {
      if (!auth || !googleProvider)
        return;

      await signInWithPopup(
        auth,
        googleProvider
      );
    };

  // SIGN UP

  const signUp = async (
    email: string,
    password: string
  ) => {
    if (!auth) return;

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    // SEND EMAIL VERIFICATION

    await sendEmailVerification(
      result.user
    );

    // LOGOUT AFTER SIGNUP

    await fbSignOut(auth);
  };

  // SIGN OUT

  const signOut = async () => {
    localStorage.removeItem(
      'demo_user'
    );

    if (auth) {
      await fbSignOut(auth);
    }

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// CUSTOM HOOK

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}