
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Execucao, Projeto, Cliente } from '../types';

const ExecutionManager: React.FC = () => {
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editingExec, setEditingExec] = useState<Execucao | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const execucoesSnapshot = await getDocs(collection(db, "execucoes"));
      const execucoesData = execucoesSnapshot.docs.map(doc => ({ ...doc.data(), execucaoId: doc.id })) as Execucao[];
      setExecucoes(execucoesData);

      const projetosSnapshot = await getDocs(collection(db, "projetos"));
      const projetosData = projetosSnapshot.docs.map(doc => ({ ...doc.data(), projetoId: doc.id })) as Projeto[];
      setProjetos(projetosData);

      const clientesSnapshot = await getDocs(collection(db, "clientes"));
      const clientesData = clientesSnapshot.docs.map(doc => ({ ...doc.data(), clienteId: doc.id })) as Cliente[];
      setClientes(clientesData);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const getClientName = (projetoId: string) => {
    const proj = projetos.find(p => p.projetoId === projetoId);
    if (!proj) return "N/A";
    return clientes.find(c => c.clienteId === proj.clienteId)?.nome || "Cliente Desconhecido";
  };

  const getSLAStatus = (prazoReal: number, prazoPrometido: number) => {
    if (prazoReal === 0) return 'bg-gray-100 text-gray-500';
    if (prazoReal <= prazoPrometido) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExec) {
      const execDocRef = doc(db, 'execucoes', editingExec.execucaoId);
      const { execucaoId, ...execData } = editingExec;
      await updateDoc(execDocRef, execData);

      setExecucoes(prev => prev.map(ex => ex.execucaoId === editingExec.execucaoId ? editingExec : ex));
      setEditingExec(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight">8. Cronograma de Execuções</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Log Técnico e Performance de Prazo</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest">
                Taxa de Retrabalho: {(execucoes.filter(e => e.retrabalho === 'Sim').length / (execucoes.length || 1) * 100).toFixed(1)}%
              </p>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Projeto ID</th>
              <th className="px-6 py-5">Cliente DIM</th>
              <th className="px-6 py-5">Início</th>
              <th className="px-6 py-5">Conclusão</th>
              <th className="px-6 py-5">SLA (Prometido)</th>
              <th className="px-6 py-5">Real (Dias)</th>
              <th className="px-6 py-5">Retrabalho</th>
              <th className="px-6 py-5">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">Carregando execuções...</td>
              </tr>
            ) : execucoes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">
                  Nenhuma execução técnica registrada na base v9.9.
                </td>
              </tr>
            ) : (
              execucoes.map((e) => (
                <tr key={e.projetoId} className="hover:bg-svBlue/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold bg-gray-50 border border-gray-200 px-2 py-1 rounded text-svGray">
                      {e.projetoId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-svBlue">{getClientName(e.projetoId)}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-svGray">
                    {e.dataInicio}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-svGray">
                    {e.dataFim}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-svBlue/5 text-svBlue rounded text-[10px] font-bold uppercase">
                      {e.prazoPrometido} Dias
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${getSLAStatus(e.prazoReal, e.prazoPrometido)}`}>
                      {e.prazoReal === 0 ? 'Em Curso' : `${e.prazoReal} Dias`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${e.retrabalho === 'Sim' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                      {e.retrabalho}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingExec(e)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingExec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic">Atualizar Execução</h3>
               <p className="text-[10px] font-bold uppercase opacity-70">Log Técnico v9.9</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Início</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingExec.dataInicio} onChange={e => setEditingExec({...editingExec, dataInicio: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Fim</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingExec.dataFim} onChange={e => setEditingExec({...editingExec, dataFim: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Prazo Real (Dias)</label>
                  <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingExec.prazoReal} onChange={e => setEditingExec({...editingExec, prazoReal: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Retrabalho</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingExec.retrabalho} onChange={e => setEditingExec({...editingExec, retrabalho: e.target.value as any})}>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Motivo Retrabalho</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" rows={2} value={editingExec.motivoRetrabalho} onChange={e => setEditingExec({...editingExec, motivoRetrabalho: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingExec(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase shadow-lg">Salvar Execução</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
         <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-svCopper"></div>
            <p className="text-[10px] font-black text-svBlue uppercase tracking-widest tracking-tighter">Sincronização Integrada de Execução v9.9</p>
         </div>
      </div>
    </div>
  );
};

export default ExecutionManager;
