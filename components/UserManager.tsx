
import React, { useState } from 'react';
import { Usuario, UserRole } from '../types';

interface UserManagerProps {
  usuarios: Usuario[];
  onUpdateUsuarios: (users: Usuario[]) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ usuarios, onUpdateUsuarios }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [newUser, setNewUser] = useState<Partial<Usuario>>({
    nome: '',
    email: '',
    role: UserRole.VISUALIZADOR,
    departamento: '',
    ativo: true,
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUsuarios(usuarios.map(u => u.usuarioId === editingUser.usuarioId ? editingUser : u));
    } else {
      const id = `USR_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      onUpdateUsuarios([...usuarios, { 
        ...newUser, 
        usuarioId: id, 
        dataUltimoAcesso: 'Nunca', 
        fotoPerfil: `https://i.pravatar.cc/150?u=${id}` 
      } as Usuario]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
    setNewUser({ nome: '', email: '', role: UserRole.VISUALIZADOR, departamento: '', ativo: true });
  };

  const getRoleBadge = (role: UserRole) => {
    const styles: Record<string, string> = {
      [UserRole.SUPER_ADMIN]: 'bg-svCritical/10 text-svCritical border-svCritical/20',
      [UserRole.ADMIN]: 'bg-svBlue/10 text-svBlue border-svBlue/20',
      [UserRole.GERENTE_COMERCIAL]: 'bg-svSuccess/10 text-svSuccess border-svSuccess/20',
      [UserRole.VENDEDOR]: 'bg-svSuccess/5 text-svSuccess/80 border-svSuccess/10',
      [UserRole.FINANCEIRO]: 'bg-svGold/10 text-svGold border-svGold/20',
      [UserRole.GERENTE_OPERACIONAL]: 'bg-svCopper/10 text-svCopper border-svCopper/20',
    };
    return styles[role] || 'bg-white/5 text-gray-400 border-white/10';
  };

  const filteredUsers = usuarios.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-svAnthracite p-8 rounded-[2rem] border border-white/5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-svBlue to-svCopper flex items-center justify-center shadow-lg">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Gestão de <span className="text-svCopper">Usuários</span></h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Controle de Acessos e Hierarquia Operacional</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex -space-x-3 overflow-hidden">
            {usuarios.slice(0, 5).map(u => (
              <img key={u.usuarioId} className="inline-block h-10 w-10 rounded-full ring-2 ring-svAnthracite" src={u.fotoPerfil} alt="" />
            ))}
            {usuarios.length > 5 && (
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-svDarkCard ring-2 ring-svAnthracite text-[10px] font-bold">+{usuarios.length - 5}</div>
            )}
          </div>
          <button 
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            className="px-8 py-3 bg-svSuccess text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
          >
            + Novo Colaborador
          </button>
        </div>
      </div>

      {/* Grid of User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((u) => (
          <div key={u.usuarioId} className="dark-card p-8 rounded-[2rem] relative overflow-hidden border border-white/5 group hover:border-svCopper/30 transition-all">
            <div className="absolute top-0 right-0 p-4">
               <div className={`w-2 h-2 rounded-full ${u.ativo ? 'bg-svSuccess animate-pulse' : 'bg-svCritical'}`}></div>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <img src={u.fotoPerfil} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" alt={u.nome} />
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight line-clamp-1">{u.nome}</h3>
                <p className="text-xs text-gray-400 font-medium">{u.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nível de Acesso</span>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black border uppercase tracking-widest ${getRoleBadge(u.role)}`}>
                  {u.role.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Departamento</p>
                  <p className="text-xs font-bold">{u.departamento}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Último Acesso</p>
                  <p className="text-xs font-bold text-gray-400">{u.dataUltimoAcesso.split(' ')[0]}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-8 opacity-40 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10"
              >
                Editar Perfil
              </button>
              <button 
                className="px-4 py-3 bg-white/5 hover:bg-rose-500/20 text-white rounded-xl transition-all border border-white/10"
                onClick={() => onUpdateUsuarios(usuarios.map(usr => usr.usuarioId === u.usuarioId ? {...usr, ativo: !usr.ativo} : usr))}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-svAnthracite rounded-[2rem] w-full max-w-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-svBlue/20 to-transparent">
              <h3 className="text-xl font-black uppercase italic text-white">{editingUser ? 'Atualizar Colaborador' : 'Novo Colaborador'}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Engine de Identidade Semper Vincit</p>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  required placeholder="Nome Completo" 
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-svCopper transition-all" 
                  value={editingUser ? editingUser.nome : newUser.nome}
                  onChange={e => editingUser ? setEditingUser({...editingUser, nome: e.target.value}) : setNewUser({...newUser, nome: e.target.value})}
                />
                <input 
                  required type="email" placeholder="E-mail Corporativo" 
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-svCopper transition-all" 
                  value={editingUser ? editingUser.email : newUser.email}
                  onChange={e => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase px-2">Perfil de Acesso</label>
                  <select 
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none appearance-none"
                    value={editingUser ? editingUser.role : newUser.role}
                    onChange={e => editingUser ? setEditingUser({...editingUser, role: e.target.value as UserRole}) : setNewUser({...newUser, role: e.target.value as UserRole})}
                  >
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role} className="bg-svAnthracite">{role.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase px-2">Departamento</label>
                  <input 
                    placeholder="Ex: Comercial"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none"
                    value={editingUser ? editingUser.departamento : newUser.departamento}
                    onChange={e => editingUser ? setEditingUser({...editingUser, departamento: e.target.value}) : setNewUser({...newUser, departamento: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-white/10 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-svCopper text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-svCopper/20">Salvar Credenciais</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
