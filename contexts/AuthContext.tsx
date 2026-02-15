
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, UserRole } from '../types';
import { PERMISSIONS_MATRIX } from '../constants/permissions';
import { initialUsuarios } from '../mockData';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (modulo: string, acao: 'visualizar' | 'criar' | 'editar' | 'deletar' | 'exportar') => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('sempervincit_user');
    if (savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error);
        localStorage.removeItem('sempervincit_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    // Procura na base centralizada de usuários (mockData)
    const user = initialUsuarios.find(u => u.email === email && u.senha === senha && u.ativo);
    
    if (user) {
      const userToSave = { ...user };
      delete userToSave.senha;
      userToSave.dataUltimoAcesso = new Date().toLocaleString('pt-BR');
      setUsuario(userToSave);
      localStorage.setItem('sempervincit_user', JSON.stringify(userToSave));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('sempervincit_user');
  };

  const hasPermission = (modulo: string, acao: 'visualizar' | 'criar' | 'editar' | 'deletar' | 'exportar'): boolean => {
    if (!usuario) return false;
    if (usuario.role === UserRole.SUPER_ADMIN) return true;
    
    const rolePermissions = PERMISSIONS_MATRIX[usuario.role];
    if (!rolePermissions || !rolePermissions[modulo]) return false;
    
    return rolePermissions[modulo][acao] || false;
  };

  const isAuthenticated = !!usuario;

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
