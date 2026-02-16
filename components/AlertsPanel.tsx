
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { AlertaSLA } from '../types';

const AlertsPanel: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaSLA[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlertas = async () => {
      setIsLoading(true);
      const alertasSnapshot = await getDocs(collection(db, "alertas"));
      const alertasData = alertasSnapshot.docs.map(doc => ({ ...doc.data(), alertaId: doc.id })) as AlertaSLA[];
      setAlertas(alertasData);
      setIsLoading(false);
    };

    fetchAlertas();
  }, []);

  const onResolve = async (alertaId: string) => {
    const alertaRef = doc(db, "alertas", alertaId);
    await updateDoc(alertaRef, { resolvido: true });
    setAlertas(prev => prev.map(a => (a.alertaId === alertaId ? { ...a, resolvido: true } : a)));
  };

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case 'critica': return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'alta': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'media': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'baixa': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityIcon = (severidade: string) => {
    switch (severidade) {
      case 'critica': return '🔴';
      case 'alta': return '🟠';
      case 'media': return '🟡';
      case 'baixa': return '🔵';
      default: return '⚪';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando painel de alertas...</div>;
  }

  const alertasAtivos = alertas.filter(a => !a.resolvido);

  if (alertasAtivos.length === 0) {
    return (
      <div className="glass-card p-12 rounded-[2.5rem] text-center border border-gray-100 shadow-xl bg-white/80">
        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-svBlue mb-2 uppercase italic tracking-tighter">Eficiência 100%</h3>
        <p className="text-sm text-svGray font-medium max-w-xs mx-auto leading-relaxed">
          Nenhum alerta de conformidade pendente no motor operacional v9.9.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 bg-white/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-svBlue uppercase tracking-tight italic">
              Central de Alertas Críticos
            </h3>
            <p className="text-[10px] text-svGray font-black mt-1 tracking-widest uppercase opacity-60">
              {alertasAtivos.length} Pendência{alertasAtivos.length !== 1 && 's'} de SLA Identificada{alertasAtivos.length !== 1 && 's'}
            </p>
          </div>
          <div className="px-6 py-3 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm animate-pulse">
            <p className="text-3xl font-black text-rose-600 tracking-tighter">{alertasAtivos.length}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {alertasAtivos.map(alerta => (
          <div key={alerta.alertaId} className="p-8 hover:bg-svBlue/[0.01] transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl filter drop-shadow-sm">{getSeverityIcon(alerta.severidade)}</span>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${getSeverityColor(alerta.severidade)}`}>
                    SLA: {alerta.severidade}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-svGray bg-gray-100 px-2 py-1 rounded border border-gray-200">
                    ID: {alerta.referencia}
                  </span>
                </div>
                <p className="text-base font-bold text-svBlue mb-1 leading-tight">{alerta.mensagem}</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-svGray/30"></div>
                   <p className="text-[10px] text-svGray font-bold uppercase tracking-widest">
                     Detectado em {alerta.dataAlerta}
                   </p>
                </div>
              </div>
              <button
                onClick={() => onResolve(alerta.alertaId)}
                className="px-8 py-3 bg-svBlue text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-svSuccess hover:scale-105 transition-all active:scale-95"
              >
                Regularizar SLA
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
         <p className="text-[9px] font-black text-svBlue uppercase italic tracking-tighter opacity-40">SV_COMPLIANCE_CORE_V9.9</p>
         <div className="flex gap-4">
            <span className="text-[9px] font-bold text-svGray uppercase">Auto-Sensing Active</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
         </div>
      </div>
    </div>
  );
};

export default AlertsPanel;
