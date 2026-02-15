
import React from 'react';
import { Icons } from '../constants';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: UserRole;
  hasPermission: (modulo: string, acao: 'visualizar' | 'criar' | 'editar' | 'deletar' | 'exportar') => boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole, hasPermission }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'usuarios', label: 'Usuários & Acessos', icon: Icons.Users },
    { id: 'alertas', label: 'Central Alertas', icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ) },
    { id: 'sla_command', label: 'SLA Command Center', icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ) },
    { id: 'leads', label: 'Funil Leads', icon: Icons.Users },
    { id: 'clientes', label: 'Clientes DIM', icon: Icons.Users },
    { id: 'servicos', label: 'Serviços Comerciais', icon: Icons.Briefcase },
    { id: 'visitas', label: 'Visitas Técnicas', icon: Icons.Briefcase },
    { id: 'propostas', label: 'Propostas', icon: Icons.ShoppingCart },
    { id: 'vendas', label: 'Vendas', icon: Icons.ShoppingCart },
    { id: 'financeiro', label: 'Financeiro', icon: Icons.Dashboard },
    { id: 'compras', label: 'Compras / Sourcing', icon: Icons.Briefcase },
    { id: 'estoque', label: 'Estoque', icon: Icons.ShoppingCart },
    { id: 'projetos', label: 'Projetos', icon: Icons.Briefcase },
    { id: 'execucoes', label: 'Execuções', icon: Icons.Settings },
    { id: 'custos', label: 'Custos Oper.', icon: Icons.ShoppingCart },
    { id: 'posvenda', label: 'Pós-Venda', icon: Icons.AI },
    { id: 'bi_consolidated', label: 'BI Consolidado', icon: Icons.AI },
    { id: 'notificacoes', label: 'Hub Notificações', icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ) },
    { id: 'logs', label: 'Log Auditoria', icon: Icons.Settings },
    { id: 'segmentos', label: 'Segmentação', icon: Icons.AI },
  ];

  const visibleMenuItems = menuItems.filter(item => hasPermission(item.id, 'visualizar'));

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-2xl z-20">
      <div className="p-6 flex items-center space-x-3">
        <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl shadow-lg">
           <div className="absolute inset-0 gradient-sv opacity-90"></div>
           <span className="relative z-10 font-bold text-white text-lg italic tracking-tighter">SV</span>
        </div>
        <div className="hidden md:block">
          <p className="font-bold text-svBlue text-sm leading-tight uppercase tracking-widest italic">Semper Vincit</p>
          <p className="text-[10px] text-svGray font-medium">BI Engine v9.9</p>
        </div>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id 
                ? 'bg-svBlue text-white shadow-lg border border-svBlue/10' 
                : 'text-svGray hover:bg-gray-50 hover:text-svBlue'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-svGray'}`} />
            <span className="hidden md:block ml-3 font-semibold text-[10px] uppercase tracking-tighter">{item.label}</span>
            {activeTab === item.id && (
               <div className="ml-auto w-1.5 h-1.5 rounded-full bg-svCopper animate-pulse"></div>
            )}
          </button>
        ))}
      </nav>
      
      {userRole && (
        <div className="p-4 border-t border-gray-50 hidden md:block">
           <div className="bg-svBlue/5 rounded-2xl p-3 border border-svBlue/10">
              <p className="text-[9px] font-black text-svBlue uppercase mb-1">Perfil Ativo</p>
              <p className="text-[10px] font-bold text-svGray truncate">{userRole.replace('_', ' ')}</p>
           </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
