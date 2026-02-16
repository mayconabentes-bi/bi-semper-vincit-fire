
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './src/firebase';
import { Venda, KPIData, Usuario } from './src/types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadManager from './components/LeadManager';
import ClientList from './components/ClientList';
import ProjectTracker from './components/ProjectTracker';
import SegmentManager from './components/SegmentManager';
import VisitaManager from './components/VisitaManager';
import CostManager from './components/CostManager';
import ProposalManager from './components/ProposalManager';
import SalesManager from './components/SalesManager';
import ExecutionManager from './components/ExecutionManager';
import PosVendaManager from './components/PosVendaManager';
import LogManager from './components/LogManager';
import PurchaseManager from './components/PurchaseManager';
import InventoryManager from './components/InventoryManager';
import CashFlowManager from './components/CashFlowManager';
import DataConsolidated from './components/DataConsolidated';
import ServiceManager from './components/ServiceManager';
import UserManager from './components/UserManager';
import NotificationHub from './components/NotificationHub';
import SLACommandCenter from './components/SLACommandCenter';
import AlertsPanel from './components/AlertsPanel';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './src/contexts/AuthContext';
import { useAlerts } from './hooks/useAlerts';

const AppContent: React.FC = () => {
  const { usuario, isAuthenticated, logout, isLoading: authLoading, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // States para dados da aplicação
  const [leadCount, setLeadCount] = useState(0);
  const [kpis, setKpis] = useState<KPIData>({ receitaTotal: 0, totalVendas: 0, taxaConversao: 0, ticketMedio: 0 });
  const [usuariosList, setUsuariosList] = useState<Usuario[]>([]);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);

  // CORREÇÃO: Passa o estado de prontidão para o hook useAlerts
  const { alertas } = useAlerts(isAuthenticated && !authLoading);

  const fetchUsuarios = useCallback(async () => {
    setIsLoadingUsuarios(true);
    setErrorUsuarios(null);
    try {
      const usuariosCollection = collection(db, 'usuarios');
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const users = usuariosSnapshot.docs.map(doc => ({ ...doc.data(), usuarioId: doc.id }) as Usuario);
      setUsuariosList(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setErrorUsuarios("Não foi possível carregar a lista de usuários. Tente novamente mais tarde.");
    } finally {
      setIsLoadingUsuarios(false);
    }
  }, []);
  
  const handleUpdateUsuarios = async (updatedUsers: Usuario[]) => {
      try {
        const batch = writeBatch(db);
        
        updatedUsers.forEach(user => {
            const userRef = doc(db, "usuarios", user.usuarioId);
            batch.set(userRef, user, { merge: true });
        });

        await batch.commit();
        setUsuariosList(updatedUsers);

      } catch (error) {
          console.error("Falha ao atualizar usuários: ", error);
          setErrorUsuarios("Ocorreu um erro ao salvar as alterações.");
      }
  };

  useEffect(() => {
    const fetchData = async () => {
      // A busca de dados agora é protegida pela mesma lógica de prontidão.
      if (!isAuthenticated || !hasPermission('dashboard', 'visualizar') || authLoading) return;

      try {
        const leadsCollection = collection(db, 'leads');
        const leadSnapshot = await getDocs(leadsCollection);
        setLeadCount(leadSnapshot.size);

        const vendasCollection = collection(db, 'vendas');
        const vendaSnapshot = await getDocs(vendasCollection);
        const vendaList = vendaSnapshot.docs.map(doc => ({ ...doc.data(), vendaId: doc.id }) as Venda);

        const receitaTotal = vendaList.reduce((acc, v) => acc + v.receita, 0);
        const totalVendas = vendaList.length;
        const taxaConversao = leadSnapshot.size > 0 ? totalVendas / leadSnapshot.size : 0;
        const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;
        setKpis({ receitaTotal, totalVendas, taxaConversao, ticketMedio });
      } catch(e) {
        console.error("Erro de permissão buscando dados do dashboard:", e);
      }
    };

    fetchData();
  }, [isAuthenticated, hasPermission, authLoading]); // Adicionado authLoading como dependência
  
  useEffect(() => {
    if (activeTab === 'usuarios' && isAuthenticated && !authLoading) {
        fetchUsuarios();
    }
  }, [activeTab, isAuthenticated, authLoading, fetchUsuarios]);

  if (authLoading) return <div className="flex items-center justify-center h-screen bg-svAnthracite text-white">Carregando Autenticação...</div>;
  if (!isAuthenticated) return <Login />;

  const activeAlertsCount = alertas.filter(a => !a.resolvido).length;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={usuario?.role}
        hasPermission={hasPermission}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-svLightBackground">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-1.5 bg-svCopper rounded-full"></div>
            <div>
              <h1 className="text-3xl font-black text-svBlue tracking-tighter uppercase italic">
                Semper Vincit <span className="text-svCopper font-medium text-xl">v9.9</span>
              </h1>
              <p className="text-xs font-bold text-svGray tracking-[0.2em] uppercase">Intelligence & Auditoria</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {activeAlertsCount > 0 && (
               <button 
                 onClick={() => setActiveTab('alertas')}
                 className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase border border-rose-100 flex items-center gap-2 animate-pulse"
               >
                 <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                 {activeAlertsCount} Alertas Críticos
               </button>
             )}
             <button onClick={logout} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold uppercase">Sair</button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto space-y-10 pb-20">
          <ProtectedRoute modulo={activeTab} acao="visualizar">
            {activeTab === 'dashboard' && <Dashboard kpis={kpis} leadsCount={leadCount} />}
            {activeTab === 'leads' && <LeadManager currentUser={usuario!} />}
            {activeTab === 'usuarios' && (
                isLoadingUsuarios ? <div className="text-center p-10">Carregando usuários...</div> :
                errorUsuarios ? <div className="text-center p-10 text-red-500">{errorUsuarios}</div> :
                <UserManager usuarios={usuariosList} onUpdateUsuarios={handleUpdateUsuarios} />
            )}
            {activeTab === 'clientes' && <ClientList />}
            {activeTab === 'visitas' && <VisitaManager />}
            {activeTab === 'servicos' && <ServiceManager />}
            {activeTab === 'custos' && <CostManager />}
            {activeTab === 'execucoes' && <ExecutionManager />}
            {activeTab === 'pos-venda' && <PosVendaManager />}
            {activeTab === 'sla_command' && <SLACommandCenter />}
            {activeTab === 'alertas' && <AlertsPanel />}
            {activeTab === 'propostas' && <ProposalManager />}
            {activeTab === 'vendas' && <SalesManager />}
            {activeTab === 'projetos' && <ProjectTracker />}
            {activeTab === 'financeiro' && <CashFlowManager />}
            {activeTab === 'compras' && <PurchaseManager />}
            {activeTab === 'estoque' && <InventoryManager />}
            {activeTab === 'notificacoes' && <NotificationHub />}
            {activeTab === 'logs' && <LogManager />}
            {activeTab === 'segmentos' && <SegmentManager />}
            {activeTab === 'bi_consolidated' && <DataConsolidated />}
          </ProtectedRoute>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
