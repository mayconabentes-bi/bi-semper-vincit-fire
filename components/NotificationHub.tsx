
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Notificacao, LogAuditoria } from '../src/types';
import { generateNotificationTemplate } from '../services/geminiService';
import { useAuth } from '../src/contexts/AuthContext';
import { notificationService } from '../services/notificationService';

const NotificationHub: React.FC = () => {
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'email' | 'sms' | 'whatsapp'>('all');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [aiResult, setAiResult] = useState('');

  useEffect(() => {
    const fetchNotificacoes = async () => {
      setIsLoading(true);
      const notificacoesSnapshot = await getDocs(collection(db, "notificacoes"));
      const notificacoesData = notificacoesSnapshot.docs.map(doc => ({ ...doc.data(), notificacaoId: doc.id })) as Notificacao[];
      setNotificacoes(notificacoesData);
      setIsLoading(false);
    };

    fetchNotificacoes();
  }, []);

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
      const newLog: Omit<LogAuditoria, 'logId'> = {
        data: new Date().toLocaleString('pt-BR'),
        usuario: usuario?.email || "sistema@sempervincit.com",
        acao: `NOTIFICACAO_${notif.tipo.toUpperCase()}`,
        referencia: notif.trigger
      };
      await addDoc(collection(db, 'logs'), newLog);
    }
  };

  const filteredNotifs = filter === 'all' 
    ? notificacoes 
    : notificacoes.filter(n => n.tipo === filter);

  const handleGenerateAiTemplate = async () => {
    if (!aiContext) return;
    setIsAiLoading(true);
    const result = await generateNotificationTemplate(aiContext, filter === 'all' ? 'WhatsApp' : filter);
    setAiResult(result || '');
    setIsAiLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviada': return <span className="text-svSuccess">✓✓</span>;
      case 'pendente': return <span className="text-svWarning">⌛</span>;
      case 'erro': return <span className="text-svCritical">✕</span>;
      default: return null;
    }
  };

  const getChannelColor = (tipo: string) => {
    switch (tipo) {
      case 'whatsapp': return 'bg-emerald-500';
      case 'email': return 'bg-svBlue';
      case 'sms': return 'bg-svCopper';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando hub de notificações...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-3xl bg-white shadow-sm border border-gray-100">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Disparos</p>
           <h3 className="text-3xl font-black text-svBlue">{notificacoes.length}</h3>
        </div>
        <div className="glass-card p-6 rounded-3xl bg-white shadow-sm border border-gray-100">
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Taxa Entrega</p>
           <h3 className="text-3xl font-black text-svSuccess">
             {((notificacoes.filter(n => n.status === 'enviada').length / (notificacoes.length || 1)) * 100).toFixed(0)}%
           </h3>
        </div>
        <div className="col-span-1 md:col-span-2 glass-card p-6 rounded-3xl gradient-sv text-white flex justify-between items-center shadow-xl">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Hub Status</p>
              <h3 className="text-xl font-black italic">CONECTADO: API SV-GATEWAY</h3>
           </div>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase transition-all">Config</button>
              <button className="px-4 py-2 bg-white text-svBlue rounded-xl text-[10px] font-black uppercase transition-all">Logs API</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* AI Assistant Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="glass-card p-8 rounded-[2rem] bg-svBlue text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-svSuccess flex items-center justify-center shadow-lg shadow-svSuccess/20">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h4 className="text-sm font-black uppercase italic tracking-tighter">AI Copywriting Assistant</h4>
                </div>

                <p className="text-[10px] font-bold text-white/60 uppercase mb-3">Contexto da Mensagem</p>
                <textarea 
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  placeholder="Ex: Novo cliente interessado em solar residencial, mora em Manaus..."
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-svSuccess h-24 transition-all"
                />

                <button 
                  onClick={handleGenerateAiTemplate}
                  disabled={isAiLoading || !aiContext}
                  className="w-full mt-4 py-4 bg-svSuccess hover:bg-svSuccess/90 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
                >
                  {isAiLoading ? 'Processando Inteligência...' : 'Gerar Template Perfeito'}
                </button>

                {aiResult && (
                  <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 animate-fadeIn">
                     <p className="text-[9px] font-black text-svSuccess uppercase mb-2 tracking-widest">Sugestão SV-AI:</p>
                     <p className="text-[11px] leading-relaxed italic opacity-90">{aiResult}</p>
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(aiResult);
                         alert("Copiado!");
                       }}
                       className="mt-3 text-[9px] font-black uppercase underline opacity-60 hover:opacity-100"
                     >
                       Copiar para Disparo
                     </button>
                  </div>
                )}
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
           </div>

           <div className="glass-card p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm">
              <h4 className="text-xs font-black text-svBlue uppercase tracking-widest mb-6">Filtros de Canal</h4>
              <div className="space-y-2">
                 {[
                   { id: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-600' },
                   { id: 'whatsapp', label: 'WhatsApp Business', color: 'bg-emerald-50 text-emerald-600' },
                   { id: 'email', label: 'E-mail Marketing', color: 'bg-blue-50 text-blue-600' },
                   { id: 'sms', label: 'SMS Gateway', color: 'bg-orange-50 text-orange-600' },
                 ].map(btn => (
                   <button 
                    key={btn.id}
                    onClick={() => setFilter(btn.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === btn.id ? btn.color + ' border-2 border-current shadow-md' : 'bg-gray-50 text-svGray opacity-50'}`}
                   >
                     {btn.label}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Notif Table */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-[2rem] bg-white border border-gray-100 shadow-xl overflow-hidden">
           <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-svBlue uppercase italic tracking-tighter">Eventos de Comunicação</h3>
                <p className="text-[10px] text-svGray font-bold uppercase tracking-widest">Tracking Multicanal v9.9</p>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 text-[10px] font-black text-svGray uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Destinatário</th>
                    <th className="px-8 py-5">Canal</th>
                    <th className="px-8 py-5">Trigger / Evento</th>
                    <th className="px-8 py-5">Mensagem</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredNotifs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-svGray italic text-xs">Nenhuma comunicação registrada para este canal.</td>
                    </tr>
                  ) : (
                    [...filteredNotifs].reverse().map((n) => (
                      <tr key={n.notificacaoId} className="hover:bg-svBlue/[0.02] transition-colors group">
                        <td className="px-8 py-5">
                          <p className="text-xs font-black text-svBlue">{n.destinatario}</p>
                          <p className="text-[9px] text-gray-400">{n.assunto}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-2">
                             <div className={`w-2 h-2 rounded-full ${getChannelColor(n.tipo)}`}></div>
                             <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">{n.tipo}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[9px] font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-svGray border border-gray-200">
                            {n.trigger}
                          </span>
                        </td>
                        <td className="px-8 py-5 max-w-xs">
                           <p className="text-[10px] text-gray-500 italic truncate group-hover:whitespace-normal transition-all">{n.mensagem}</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <div className="flex flex-col items-center">
                              {getStatusIcon(n.status)}
                              <span className="text-[8px] font-black uppercase mt-1 opacity-50">{n.status}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-[10px] font-bold text-svGray">
                          {n.dataEnvio}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationHub;
