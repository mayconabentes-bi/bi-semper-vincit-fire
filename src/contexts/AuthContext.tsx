
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Usuario, UserRole } from '../types';
import { PERMISSIONS_MATRIX } from '../constants/permissions';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (modulo: string, acao: "visualizar" | "criar" | "editar" | "deletar" | "exportar") => boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toISOString = (date: any): string => {
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const processAuthStateChange = async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      setError(null);
      try {
        if (firebaseUser) {
          const userDoc = await syncUser(firebaseUser);
          setUsuario(userDoc);
        } else {
          setUsuario(null);
        }
      } catch (err: any) {
        console.error("Authentication Error:", err);
        setError(err.message || 'An unknown authentication error occurred.');
        setUsuario(null);
        await signOut(auth).catch(e => console.error("Failed to sign out after error:", e));
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, processAuthStateChange);
    return () => unsubscribe();
  }, [auth]);

  const syncUser = async (firebaseUser: FirebaseUser): Promise<Usuario> => {
    const userEmail = firebaseUser.email!;
    const isEmergencyAccess = userEmail === 'mayconabentes@gmail.com';
    const isDomainAllowed = userEmail.endsWith('@dasemper.com');

    if (!isEmergencyAccess && !isDomainAllowed) {
      throw new Error(`Access denied for ${userEmail}. Only '@dasemper.com' emails or the emergency administrator are allowed.`);
    }

    const userRef = doc(db, 'usuarios', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const roleToSet = isEmergencyAccess ? UserRole.SUPER_ADMIN : userData.role || UserRole.VISUALIZADOR;
      
      await setDoc(userRef, {
        dataUltimoAcesso: serverTimestamp(),
        ...(isEmergencyAccess && { role: roleToSet })
      }, { merge: true });

      return {
        ...(userData as Usuario),
        usuarioId: firebaseUser.uid,
        role: roleToSet,
        dataCriacao: toISOString(userData.dataCriacao),
        dataUltimoAcesso: new Date().toISOString(),
      };
    } else {
      const roleToSet = isEmergencyAccess ? UserRole.SUPER_ADMIN : UserRole.VISUALIZADOR;
      const newUser: Usuario = {
        usuarioId: firebaseUser.uid,
        nome: firebaseUser.displayName || "New User",
        email: userEmail,
        role: roleToSet,
        departamento: isEmergencyAccess ? "Emergency Administration" : "No Department",
        ativo: true,
        fotoPerfil: firebaseUser.photoURL || "",
        dataCriacao: new Date().toISOString(),
        dataUltimoAcesso: new Date().toISOString(),
      };
      await setDoc(userRef, { ...newUser, dataCriacao: serverTimestamp(), dataUltimoAcesso: serverTimestamp() });
      return newUser;
    }
  };

  const login = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to login with Google.');
      }
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUsuario(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const hasPermission = (modulo: string, acao: "visualizar" | "criar" | "editar" | "deletar" | "exportar"): boolean => {
    if (!usuario) return false;
    if (usuario.role === UserRole.SUPER_ADMIN) return true;
    const permissions = PERMISSIONS_MATRIX[usuario.role]?.[modulo];
    return permissions?.[acao] || false;
  };

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated: !!usuario, login, logout, hasPermission, isLoading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
