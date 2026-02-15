
import React from 'react';
import { AlertaSLA } from '../types';

interface SLACommandCenterProps {
  alertas: AlertaSLA[];
  onResolveAlerta: (id: string) => void;
}

const SLACommandCenter: React.FC<SLACommandCenterProps> = ({ alertas, onResolveAlerta }) => {
  const activeAlerts = alertas.filter(a => !a.resolvido);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critica': return 'bg-rose-500 text-white border-rose-600';
      case 'alta': return 'bg-orange-500 text-white border-orange-600';
      case 'media': return 'bg-amber-500 text-white border-amber-600';
      default: return 'bg-svBlue text-white border-svBlue/80';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critica': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'alta': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'media': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SLA Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-[2rem] bg-svAnthracite text-white shadow-xl relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Índice Conformidade</p>
          <h3 className="text-3xl font-black italic">
            {((1 - (activeAlerts.length / (alertas.length || 1))) * 100).toFixed(1)}%
          </h3>
          <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full">
            <div className="h-full bg-svSuccess rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Alertas Críticos</p>
          <h3 className="text-3xl font-black text-svBlue">
            {activeAlerts.filter(a => a.severidade === 'critica').length}
          </h3>
        </div>
        <div className="glass-card p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Pendências Alta</p>
          <h3 className="text-3xl font-black text-svBlue">
            {activeAlerts.filter(a => a.severidade === 'alta').length}
          </h3>
        </div>
        <div className="glass-card p-6 rounded-[2rem] gradient-sv text-white shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Tempo Médio Resolução</p>
           <h3 className="text-3xl font-black italic tracking-tighter">4.2h</h3>
        </div>
      </div>

      {/* Main Alert Feed */}
      <div className="glass-card rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-svBlue uppercase italic tracking-tighter">SLA Command Center</h3>
            <p className="text-[10px] text-svGray font-bold uppercase tracking-widest mt-1">Conformidade Operacional v9.9</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase transition-all">Exportar Log</button>
             <button className="px-4 py-2 bg-svBlue text-white rounded-xl text-[10px] font-black uppercase transition-all">Configurar Regras</button>
          </div>
        </div>

        <div className="p-8">
           <div className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="py-20 text-center">
                   <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <svg className="w-8 h-8 text-svSuccess" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <p className="text-sm font-bold text-svGray italic">Operação em Conformidade. Nenhum alerta pendente.</p>
                </div>
              ) : (
                activeAlerts.map(alerta => (
                  <div key={alerta.alertaId} className="flex items-center p-6 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 hover:bg-white hover:shadow-lg transition-all group">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-b-4 shrink-0 shadow-sm ${getSeverityColor(alerta.severidade)}`}>
                        {alerta.severidade === 'critica' ? '⚠️' : '🔔'}
                     </div>
                     <div className="ml-6 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getSeverityBadge(alerta.severidade)}`}>
                              {alerta.severidade}
                           </span>
                           <span className="text-[10px] font-mono font-bold text-svGray opacity-50">{alerta.referencia}</span>
                        </div>
                        <h4 className="text-sm font-black text-svBlue leading-tight uppercase tracking-tight">{alerta.tipo.replace(/_/g, ' ')}</h4>
                        <p className="text-xs text-svGray font-medium mt-1 leading-relaxed">{alerta.mensagem}</p>
                     </div>
                     <div className="ml-6 text-right shrink-0">
                        <p className="text-[10px] font-bold text-svGray uppercase mb-3 opacity-60">{alerta.dataAlerta}</p>
                        <button 
                           onClick={() => onResolveAlerta(alerta.alertaId)}
                           className="px-6 py-2.5 bg-white border border-gray-200 group-hover:border-svSuccess group-hover:text-svSuccess rounded-xl text-[10px] font-black uppercase transition-all shadow-sm"
                        >
                           Resolver Conformidade
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
           <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[9px] font-black text-svBlue uppercase tracking-widest italic tracking-tighter">Real-Time Compliance Active</p>
           </div>
           <p className="text-[9px] font-bold text-svGray opacity-40 uppercase tracking-widest">SV_SECURITY_CORE_V9.9</p>
        </div>
      </div>
    </div>
  );
};

export default SLACommandCenter;
