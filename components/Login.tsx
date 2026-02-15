
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setIsLoading(true);

    const success = await login(email, senha);
    
    if (!success) {
      setErro('Credenciais incorretas ou acesso bloqueado.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-svBlue via-svBlue/95 to-svCopper p-4 animate-fadeIn">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="p-10 bg-white/40 backdrop-blur-xl border-b border-gray-100/50 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-svBlue to-svCopper mb-6 shadow-2xl shadow-svBlue/20">
              <span className="font-black text-3xl text-white italic tracking-tighter">SV</span>
            </div>
            <h1 className="text-3xl font-black text-svBlue tracking-tighter uppercase italic">
              Semper Vincit
            </h1>
            <p className="text-[10px] font-bold text-svGray tracking-[0.2em] uppercase mt-2">
              Intelligence Layer 2026
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-svGray uppercase tracking-widest mb-2 block px-1">
                E-mail Corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-svBlue focus:outline-none transition-all text-sm font-medium bg-white/50 placeholder-gray-300"
                placeholder="ex: admin@sempervincit.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-svGray uppercase tracking-widest mb-2 block px-1">
                Chave de Acesso
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-svBlue focus:outline-none transition-all text-sm font-medium bg-white/50 placeholder-gray-300"
                placeholder="••••••••"
                required
              />
            </div>

            {erro && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-fadeIn">
                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest text-center">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-gradient-to-r from-svBlue to-svCopper text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Estabelecendo Conexão...' : 'Entrar no Sistema'}
            </button>
          </form>

          {/* Footer */}
          <div className="p-8 bg-gray-50/50 border-t border-gray-100">
            <div className="flex flex-col items-center space-y-3">
              <p className="text-[9px] text-center text-svGray font-bold uppercase tracking-widest opacity-60">
                Acesso Seguro • Semper Vincit Intelligence
              </p>
              <div className="px-4 py-2 bg-svBlue/5 rounded-xl border border-svBlue/10 text-center">
                <p className="text-[8px] font-black text-svBlue uppercase tracking-tighter mb-1">Credenciais Demonstrativas:</p>
                <code className="text-[9px] font-mono text-svBlue font-bold">admin@sempervincit.com / admin123</code>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center opacity-30">
           <p className="text-[9px] font-bold text-white uppercase tracking-[0.3em]">Encrypted Connection Secured by SV-Engine</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
