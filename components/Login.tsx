
import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';

const Login: React.FC = () => {
  const { login, isLoading, error } = useAuth();

  const handleGoogleLogin = async () => {
    await login();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-md">
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          
          <div className="text-center mb-8">
            <img src="/Logo_Semper.png" alt="Semper Vincit Logo" className="w-48 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800">Bem-vindo à Plataforma</h1>
            <p className="text-gray-500 mt-2">Faça login com sua conta Google para continuar.</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-400">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691c-1.229 2.22-1.996 4.793-1.996 7.558s.767 5.338 1.996 7.558l-5.657 5.657C.637 32.476 0 28.456 0 24s.637-8.476 2.649-11.816l4.657-4.542z"/>
                <path fill="#4CAF50" d="M24 48c5.268 0 10.046-1.953 13.694-5.239l-5.657-5.657C29.842 39.154 27.059 40 24 40c-5.223 0-9.651-3.343-11.303-8H6.389c1.996 6.302 7.731 11 14.611 11h3z"/>
                <path fill="#1976D2" d="M43.611 20.083l-5.657 5.657c-1.332-1.246-2.93-2.223-4.704-2.825V20h-9.25V12h14.909c.251 1.266.389 2.576.389 3.917z"/>
              </svg>
              <span>
                {isLoading ? 'Autenticando...' : 'Entrar com Google'}
              </span>
            </button>
          </div>
          
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Semper Vincit. Acesso seguro e monitorizado.</p>
        </div>

      </div>
    </div>
  );
};

export default Login;
