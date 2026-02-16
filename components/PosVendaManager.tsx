
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { PosVenda, Projeto, Cliente } from '../types';

const PosVendaManager: React.FC = () => {
  const [posVendas, setPosVendas] = useState<PosVenda[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editingPV, setEditingPV] = useState<PosVenda | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const posVendasSnapshot = await getDocs(collection(db, "pos-venda"));
      const posVendasData = posVendasSnapshot.docs.map(doc => ({ ...doc.data(), posVendaId: doc.id })) as PosVenda[];
      setPosVendas(posVendasData);

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

  const getNPSBadge = (nps: number) => {
    if (nps >= 9) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (nps >= 7) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const averageNPS = posVendas.length > 0 
    ? posVendas.reduce((acc, curr) => acc + curr.nps, 0) / posVendas.length 
    : 0;

  const totalIndicacoes = posVendas.filter(p => p.indicacaoGerada).length;
  const reviewsGoogle = posVendas.filter(p => p.avaliacaoGoogle).length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPV) {
      const pvDocRef = doc(db, 'pos-venda', editingPV.posVendaId);
      const { posVendaId, ...pvData } = editingPV;
      await updateDoc(pvDocRef, pvData);

      setPosVendas(prev => prev.map(p => p.posVendaId === editingPV.posVendaId ? editingPV : p));
      setEditingPV(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight">9. Experiência e Pós-Venda</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Sucesso do Cliente e Motor de Indicações</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <div className="px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center min-w-[100px]">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Score NPS Médio</p>
              <p className="text-2xl font-black text-emerald-700">{averageNPS.toFixed(1)}</p>
           </div>
           <div className="px-5 py-2.5 bg-svBlue/5 border border-svBlue/10 rounded-xl text-center min-w-[100px]">
              <p className="text-[9px] font-black text-svBlue uppercase tracking-widest mb-1">Reviews Google</p>
              <p className="text-2xl font-black text-svBlue">{reviewsGoogle}</p>
           </div>
           <div className="px-5 py-2.5 bg-svCopper/10 border border-svCopper/20 rounded-xl text-center min-w-[100px]">
              <p className="text-[9px] font-black text-svCopper uppercase tracking-widest mb-1">Novas Indicações</p>
              <p className="text-2xl font-black text-svCopper">{totalIndicacoes}</p>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Projeto ID</th>
              <th className="px-6 py-5">Cliente / Razão</th>
              <th className="px-6 py-5">Data Entrega</th>
              <th className="px-6 py-5 text-center">NPS (0-10)</th>
              <th className="px-6 py-5 text-center">Review Google</th>
              <th className="px-6 py-5 text-center">Gerou Indicação</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">Carregando dados de pós-venda...</td>
              </tr>
            ) : posVendas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">
                  Nenhum projeto finalizado para auditoria de Pós-Venda.
                </td>
              </tr>
            ) : (
              posVendas.map((p) => (
                <tr key={p.projetoId} className="hover:bg-svBlue/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold bg-gray-50 border border-gray-200 px-2 py-1 rounded text-svGray">
                      {p.projetoId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-svBlue">{getClientName(p.projetoId)}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-svGray">
                    {p.dataEntrega}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${getNPSBadge(p.nps)}`}>
                      {p.nps}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.avaliacaoGoogle ? (
                      <span className="text-svGold text-lg">★★★★★</span>
                    ) : (
                      <span className="text-gray-200 text-lg">☆☆☆☆☆</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.indicacaoGerada ? (
                      <span className="px-2 py-1 bg-svCopper/10 text-svCopper rounded text-[10px] font-black uppercase">Sim</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded text-[10px] font-black uppercase">Não</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditingPV(p)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingPV && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic">Feedback do Cliente</h3>
               <p className="text-[10px] font-bold uppercase opacity-70">Customer Success v9.9</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">NPS (0-10)</label>
                <input type="number" min="0" max="10" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold" value={editingPV.nps} onChange={e => setEditingPV({...editingPV, nps: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="google" checked={editingPV.avaliacaoGoogle} onChange={e => setEditingPV({...editingPV, avaliacaoGoogle: e.target.checked})} className="w-4 h-4" />
                  <label htmlFor="google" className="text-xs font-bold text-svBlue">Review Google</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="indicacao" checked={editingPV.indicacaoGerada} onChange={e => setEditingPV({...editingPV, indicacaoGerada: e.target.checked})} className="w-4 h-4" />
                  <label htmlFor="indicacao" className="text-xs font-bold text-svBlue">Gerou Indicação</label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingPV(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase shadow-lg">Salvar Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
         <p className="text-[10px] font-black text-svGray uppercase tracking-widest italic">
            * Dados de NPS coletados via Automação Semper Vincit
         </p>
         <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-svCopper"></div>
            <p className="text-[10px] font-black text-svBlue uppercase tracking-widest tracking-tighter">Customer Success Engine v9.9</p>
         </div>
      </div>
    </div>
  );
};

export default PosVendaManager;
