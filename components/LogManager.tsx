
import React from 'react';
import { LogAuditoria } from '../types';

interface LogManagerProps {
  logs: LogAuditoria[];
}

const LogManager: React.FC<LogManagerProps> = ({ logs }) => {
  const getActionColor = (acao: string) => {
    if (acao.includes('VENDA')) return 'text-emerald-400 border-emerald-900/50';
    if (acao.includes('ERRO')) return 'text-rose-400 border-rose-900/50';
    if (acao.includes('SYNC') || acao.includes('AUTO')) return 'text-blue-400 border-blue-900/50';
    return 'text-gray-400 border-gray-800';
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-gray-900 bg-[#0d1117] animate-fadeIn">
      <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            10. LOG_AUDITORIA
          </h3>
          <p className="text-[10px] text-gray-500 font-bold mt-1 tracking-widest uppercase">Secure Event Tracing Engine v9.9</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status do Sistema</p>
            <p className="text-xs font-mono text-emerald-500">ENCRYPTED_SYNC_OK</p>
          </div>
          <div className="h-10 w-px bg-gray-800"></div>
          <p className="text-[10px] font-black text-white uppercase tracking-widest bg-svBlue px-3 py-1.5 rounded-lg shadow-inner">
            Total Eventos: {logs.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead className="bg-gray-800/80 text-gray-400 uppercase tracking-widest border-b border-gray-700">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Action_Descriptor</th>
              <th className="px-6 py-4">Object_Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-gray-600 italic">
                  No trace logs found in secure buffer.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-3 text-gray-500 group-hover:text-emerald-500 transition-colors">
                    [{log.data}]
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-blue-300 opacity-80">{log.usuario}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-tighter ${getActionColor(log.acao)}`}>
                      {log.acao}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-svCopper font-bold tracking-widest">
                      &gt; {log.referencia}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-gray-900/80 border-t border-gray-800 flex items-center justify-between">
         <div className="flex space-x-4">
            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest cursor-default hover:text-white transition-colors"># SEC_AUTH_V3</span>
            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest cursor-default hover:text-white transition-colors"># TRACE_ENABLED</span>
         </div>
         <p className="text-[9px] font-black text-svBlue uppercase tracking-tighter italic">Semper Vincit Intelligence Layer</p>
      </div>
    </div>
  );
};

export default LogManager;
