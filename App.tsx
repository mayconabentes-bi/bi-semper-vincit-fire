
import React, { useState, useMemo, useEffect } from 'react';
import { initialLeads, initialClientes, initialVendas, initialProjetos, initialPropostas, initialVisitas, initialCustos, initialExecucoes, initialPosVenda, initialLogs, initialPurchases, initialInventoryItems, initialInventoryMovements, initialServicos, initialUsuarios, initialNotificacoes } from './mockData';
import { Lead, Cliente, Venda, Projeto, LeadStatus, KPIData, SegmentoCliente, SegmentType, Proposta, VisitaTecnica, CustoOperacional, Execucao, PosVenda, LogAuditoria, Compra, ItemEstoque, MovimentacaoEstoque, Servico, Usuario, UserRole, Notificacao, AlertaSLA } from './types';
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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { notificationService } from './services/notificationService';
import { useAlerts } from './hooks/useAlerts';

const AppContent: React.FC = () => {
  const { usuario, isAuthenticated, logout, isLoading, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // States Operacionais
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [visitas, setVisitas] = useState<VisitaTecnica[]>(initialVisitas);
  const [propostas, setPropostas] = useState<Proposta[]>(initialPropostas);
  const [vendas, setVendas] = useState<Venda[]>(initialVendas);
  const [projetos, setProjetos] = useState<Projeto[]>(initialProjetos);
  const [custos, setCustos] = useState<CustoOperacional[]>(initialCustos);
  const [execucoes, setExecucoes] = useState<Execucao[]>(initialExecucoes);
  const [posVendas, setPosVendas] = useState<PosVenda[]>(initialPosVenda);
  const [logs, setLogs] = useState<LogAuditoria[]>(initialLogs);
  const [purchases, setPurchases] = useState<Compra[]>(initialPurchases);
  const [inventoryItems, setInventoryItems] = useState<ItemEstoque[]>(initialInventoryItems);
  const [inventoryMovements, setInventoryMovements] = useState<MovimentacaoEstoque[]>(initialInventoryMovements);
  const [servicos, setServicos] = useState<Servico[]>(initialServicos);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(initialNotificacoes);

  // Hook de Alertas Dinâmicos (SLA Engine)
  const { alertas: alertasSLA, resolverAlerta } = useAlerts(
    leads, 
    propostas, 
    projetos, 
    inventoryItems, 
    inventoryMovements, 
    purchases
  );

  const addLog = (acao: string, referencia: string) => {
    const newLog: LogAuditoria = {
      data: new Date().toLocaleString('pt-BR'),
      usuario: usuario?.email || "sistema@sempervincit.com",
      acao,
      referencia
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const sendNotification = async (notif: Omit<Notificacao, 'notificacaoId' | 'status' | 'dataEnvio'>) => {
    const novaNotificacao: Notificacao = {
      ...notif,
      notificacaoId: `NOT_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'pendente',
      dataEnvio: new Date().toLocaleString('pt-BR')
    };
    
    setNotificacoes(prev => [novaNotificacao, ...prev]);
    const success = await notificationService.notify(novaNotificacao);
    
    setNotificacoes(prev => prev.map(n => 
      n.notificacaoId === novaNotificacao.notificacaoId
        ? { ...n, status: success ? 'enviada' : 'erro' }
        : n
    ));
    
    if (success) {
      addLog(`NOTIFICACAO_${notif.tipo.toUpperCase()}`, notif.trigger);
    }
  };

  const handleUpdateProposta = (updatedProp: Proposta) => {
    setPropostas(prev => prev.map(p => p.propostaId === updatedProp.propostaId ? updatedProp : p));
    addLog("EDIT_PROPOSTA", updatedProp.propostaId);

    if (updatedProp.status === "Aprovada" && !vendas.find(v => v.propostaId === updatedProp.propostaId)) {
      const lead = leads.find(l => l.leadId === updatedProp.leadId);
      if (lead) {
        // Criar Venda
        const novaVenda: Venda = {
          vendaId: `VEN_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          propostaId: updatedProp.propostaId,
          receita: updatedProp.valorFinal,
          dataFechamento: new Date().toLocaleDateString('pt-BR'),
          formaPagamento: 'Pix / A confirmar',
          parcelas: 1,
          receitaRecebida: 0,
          dataUltimoRecebimento: '-'
        };
        setVendas(prev => [novaVenda, ...prev]);

        // Criar Projeto
        const novoProjeto: Projeto = {
          projetoId: `PROJ_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          propostaId: updatedProp.propostaId,
          clienteId: lead.clienteId || `CLI_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          dataAbertura: new Date().toLocaleDateString('pt-BR'),
          statusProjeto: 'Aguardando Início',
          responsavelExecucao: 'Time de Engenharia',
          tipoProjeto: updatedProp.tipoProjeto,
          valorContrato: updatedProp.valorFinal
        };
        setProjetos(prev => [novoProjeto, ...prev]);

        // Notificação
        sendNotification({
          tipo: 'email',
          destinatario: lead.email,
          assunto: 'Proposta Aprovada - Semper Vincit Solar',
          mensagem: `Olá ${lead.nome}! Sua proposta no valor de R$ ${updatedProp.valorFinal.toLocaleString('pt-BR')} foi aprovada. Iniciamos agora a fase de montagem do seu projeto técnico.`,
          trigger: 'PROPOSTA_APROVADA'
        });
      }
    }
  };

  // BI Engine: KPIs
  const kpis: KPIData = useMemo(() => {
    const receitaTotal = vendas.reduce((acc, v) => acc + v.receita, 0);
    const totalVendas = vendas.length;
    const taxaConversao = leads.length > 0 ? totalVendas / leads.length : 0;
    const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;
    return { receitaTotal, totalVendas, taxaConversao, ticketMedio };
  }, [vendas, leads]);

  const segmentos: SegmentoCliente[] = useMemo(() => {
    return clientes.map(cliente => {
      const clientSales = vendas.filter(v => {
        const prop = propostas.find(p => p.propostaId === v.propostaId);
        return prop?.leadId === cliente.leadId;
      });
      const totalSpent = clientSales.reduce((sum, v) => sum + v.receita, 0);
      let segmento: SegmentType = "Standard";
      if (totalSpent > 50000) segmento = "High Value";
      else if (clientSales.length === 0) segmento = "New";
      return {
        clienteId: cliente.clienteId,
        nome: cliente.nome,
        segmento,
        dataSegmentacao: new Date().toLocaleDateString('pt-BR')
      };
    });
  }, [clientes, vendas, propostas]);

  if (isLoading) return <div className="flex items-center justify-center h-screen bg-svAnthracite text-white">Carregando...</div>;
  if (!isAuthenticated) return <Login />;

  const activeAlertsCount = alertasSLA.filter(a => !a.resolvido).length;

  return (
    <div className="flex h-screen bg-[#fcfdfe] overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={usuario?.role}
        hasPermission={hasPermission}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
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
            {activeTab === 'dashboard' && <Dashboard kpis={kpis} leadsCount={leads.length} vendas={vendas} leads={leads} propostas={propostas} posVendas={posVendas} />}
            {activeTab === 'leads' && <LeadManager leads={leads} onUpdateLeads={setLeads} currentUser={usuario!} />}
            {activeTab === 'clientes' && <ClientList clientes={clientes} onUpdateCliente={(c) => setClientes(prev => prev.map(item => item.clienteId === c.clienteId ? c : item))} />}
            {activeTab === 'sla_command' && <SLACommandCenter alertas={alertasSLA} onResolveAlerta={resolverAlerta} />}
            {activeTab === 'alertas' && <AlertsPanel alertas={alertasSLA} onResolve={resolverAlerta} />}
            {activeTab === 'propostas' && <ProposalManager propostas={propostas} leads={leads} onUpdateProposta={handleUpdateProposta} />}
            {activeTab === 'vendas' && <SalesManager vendas={vendas} propostas={propostas} leads={leads} onUpdateVenda={(v) => setVendas(prev => prev.map(i => i.vendaId === v.vendaId ? v : i))} />}
            {activeTab === 'projetos' && <ProjectTracker projetos={projetos} clientes={clientes} onUpdateProjeto={(p) => setProjetos(prev => prev.map(i => i.projetoId === p.projetoId ? p : i))} />}
            {activeTab === 'financeiro' && <CashFlowManager vendas={vendas} custos={custos} purchases={purchases} projetos={projetos} clientes={clientes} />}
            {activeTab === 'compras' && <PurchaseManager purchases={purchases} projetos={projetos} clientes={clientes} onUpdatePurchase={(p) => setPurchases(prev => prev.map(i => i.compraId === p.compraId ? p : i))} onAddPurchase={(p) => setPurchases(prev => [p, ...prev])} />}
            {activeTab === 'estoque' && <InventoryManager items={inventoryItems} movements={inventoryMovements} onAddItem={(i) => setInventoryItems(prev => [...prev, i])} onAddMovement={(m) => setInventoryMovements(prev => [...prev, m])} />}
            {activeTab === 'notificacoes' && <NotificationHub notificacoes={notificacoes} onTriggerManual={(n) => sendNotification({ ...n, trigger: 'MANUAL' } as any)} />}
            {activeTab === 'logs' && <LogManager logs={logs} />}
            {activeTab === 'segmentos' && <SegmentManager segmentos={segmentos} />}
            {activeTab === 'bi_consolidated' && <DataConsolidated vendas={vendas} custos={custos} projetos={projetos} clientes={clientes} propostas={propostas} currentUser={usuario!} />}
          </ProtectedRoute>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
