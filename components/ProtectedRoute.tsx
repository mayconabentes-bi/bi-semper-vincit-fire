
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  modulo: string;
  acao: 'visualizar' | 'criar' | 'editar' | 'deletar' | 'exportar';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AcessoNegado: React.FC = () => (
  <div className="glass-card p-12 rounded-3xl text-center animate-fadeIn border-2 border-rose-100 shadow-xl bg-white/80">
    <div className="w-20 h-20 mx-auto mb-6 bg-rose-50 rounded-full flex items-center justify-center shadow-inner">
      <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-xl font-black text-svBlue mb-2 uppercase italic">Acesso Restrito</h3>
    <p className="text-sm text-svGray font-medium max-w-xs mx-auto leading-relaxed">
      Seu perfil atual não possui autorização para interagir com este módulo da <span className="text-svCopper font-bold">Semper Vincit</span>.
    </p>
    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Protocol v9.9 Active</p>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  modulo, 
  acao, 
  children, 
  fallback 
}) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(modulo, acao)) {
    return (fallback as React.ReactElement) || <AcessoNegado />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
