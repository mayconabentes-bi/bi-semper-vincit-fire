
import React from 'react';
import { SegmentoCliente } from '../types';

interface SegmentManagerProps {
  segmentos: SegmentoCliente[];
}

const SegmentManager: React.FC<SegmentManagerProps> = ({ segmentos }) => {
  const getSegmentStyles = (segment: string) => {
    switch (segment) {
      case 'High Value':
        return 'bg-svGold/10 text-svGold border-svGold/20 shadow-sm shadow-svGold/5';
      case 'New':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-50';
      case 'At Risk':
        return 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-50';
      default:
        return 'bg-gray-50 text-svGray border-gray-200';
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100">
      <div className="p-8 border-b border-gray-100 bg-white/50 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
               <div className="w-2 h-6 bg-svBlue rounded-full"></div>
               <h3 className="text-xl font-bold text-svBlue tracking-tight uppercase">Segmentação de Clientes</h3>
            </div>
            <p className="text-xs text-svGray font-medium">Inteligência aplicada à base Semper Vincit</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-svGold/5 border border-svGold/10 rounded-full text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-svGold shadow-sm"></span>
              <span className="text-svGold uppercase">High Value</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span>
              <span className="text-emerald-700 uppercase">New</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm"></span>
              <span className="text-rose-700 uppercase">At Risk</span>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-8 py-5">ID</th>
              <th className="px-8 py-5">Cliente</th>
              <th className="px-8 py-5">Segmento</th>
              <th className="px-8 py-5">Última Análise</th>
              <th className="px-8 py-5 text-right">Fator Estratégico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/30">
            {segmentos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-svGray font-medium text-sm">Nenhum dado processado pelo motor de BI.</td>
              </tr>
            ) : (
              segmentos.map((s) => (
                <tr key={s.clienteId} className="hover:bg-svBlue/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-mono text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-lg text-svGray border border-gray-200">{s.clienteId}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-svBlue group-hover:translate-x-1 transition-transform">{s.nome}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold border transition-all ${getSegmentStyles(s.segmento)}`}>
                      {s.segmento}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs text-svGray font-medium">
                    {s.dataSegmentacao}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      {s.segmento === 'High Value' && <span className="text-svGold font-bold drop-shadow-sm">💎 VIP</span>}
                      {s.segmento === 'At Risk' && <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">RETER AGORA</span>}
                      {s.segmento === 'New' && <span className="text-emerald-600 font-bold text-[10px]">✨ BEM-VINDO</span>}
                      {s.segmento === 'Standard' && <span className="text-gray-300 font-bold text-[10px]">REGULAR</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-8 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200/60 flex flex-col items-center text-center">
            <p className="text-[10px] font-extrabold text-svGold uppercase tracking-widest mb-2">High Value</p>
            <p className="text-3xl font-black text-svBlue">{segmentos.filter(s => s.segmento === 'High Value').length}</p>
            <div className="w-8 h-1 bg-svGold mt-2 rounded-full"></div>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200/60 flex flex-col items-center text-center">
            <p className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest mb-2">Crítico / At Risk</p>
            <p className="text-3xl font-black text-svBlue">{segmentos.filter(s => s.segmento === 'At Risk').length}</p>
            <div className="w-8 h-1 bg-rose-500 mt-2 rounded-full"></div>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200/60 flex flex-col items-center text-center">
            <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest mb-2">Expansão / Novos</p>
            <p className="text-3xl font-black text-svBlue">{segmentos.filter(s => s.segmento === 'New').length}</p>
            <div className="w-8 h-1 bg-emerald-500 mt-2 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentManager;
