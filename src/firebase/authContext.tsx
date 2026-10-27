import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  type User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

export interface SaathiUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: SaathiUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'saathi_demo_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SaathiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If real Firebase is initialized, listen to real auth changes
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isDemo: false,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // In demo mode: restore session from local storage if previously logged in
      const storedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (storedDemo) {
        try {
          setUser(JSON.parse(storedDemo));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        isDemo: false,
      });
    } else {
      // Demo Mode login simulation
      const demoUser: SaathiUser = {
        uid: 'demo-citizen-id',
        email: email || 'citizen@demo.saathi.in',
        displayName: email.split('@')[0] || 'Demo Citizen',
        isDemo: true,
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  const register = async (email: string, pass: string, name?: string): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name || cred.user.displayName,
        isDemo: false,
      });
    } else {
      // Demo Mode register simulation
      const demoUser: SaathiUser = {
        uid: 'demo-citizen-id',
        email: email,
        displayName: name || email.split('@')[0] || 'Demo Citizen',
        isDemo: true,
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  const logout = async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    }
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Demo mode notice
      return new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
        isDemo: false,
      });
    } else {
      // Demo mode simulation
      const demoUser: SaathiUser = {
        uid: 'demo-google-user-id',
        email: 'google.citizen@saathi.in',
        displayName: 'Google Citizen (Demo)',
        photoURL: null,
        isDemo: true,
      };
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        login,
        register,
        logout,
        resetPassword,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
