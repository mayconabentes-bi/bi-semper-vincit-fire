
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Proposta, Lead } from '../types';

const ProposalManager: React.FC = () => {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProp, setEditingProp] = useState<Proposta | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const proposalsSnapshot = await getDocs(collection(db, "propostas"));
      const proposalsData = proposalsSnapshot.docs.map(doc => ({ ...doc.data(), propostaId: doc.id })) as Proposta[];
      setPropostas(proposalsData);

      const leadsSnapshot = await getDocs(collection(db, "leads"));
      const leadsData = leadsSnapshot.docs.map(doc => ({ ...doc.data(), leadId: doc.id })) as Lead[];
      setLeads(leadsData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const getLeadName = (leadId: string) => {
    return leads.find(l => l.leadId === leadId)?.nome || "Lead N/A";
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Enviada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Em Elaboração': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reprovada': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProp) {
      // Auto-calculate final value and margin
      const valorFinal = editingProp.valorBruto * (1 - editingProp.descontoPercentual / 100);
      const margem = valorFinal > 0 ? ((valorFinal - editingProp.custoEstimado) / valorFinal) * 100 : 0;
      const updated = { ...editingProp, valorFinal, margemPercentual: margem };
      
      const propDocRef = doc(db, 'propostas', updated.propostaId);
      const { propostaId, ...propData } = updated;
      await updateDoc(propDocRef, propData);

      setPropostas(prev => prev.map(p => p.propostaId === updated.propostaId ? updated : p));
      setEditingProp(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando propostas...</div>;
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase">6. Propostas Comerciais</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">ROI & Engenharia de Vendas</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">Proposta ID</th>
              <th className="px-6 py-5">Cliente / Lead</th>
              <th className="px-6 py-5">Valor Final</th>
              <th className="px-6 py-5">Margem %</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {propostas.map((p) => (
              <tr key={p.propostaId} className="hover:bg-svBlue/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-[10px] font-bold text-svGray">{p.propostaId}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-svBlue">{getLeadName(p.leadId)}</p>
                </td>
                <td className="px-6 py-4 text-sm font-black text-svBlue">{formatCurrency(p.valorFinal)}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-black ${p.margemPercentual > 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {p.margemPercentual.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setEditingProp(p)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic">Atualizar Proposta</h3>
               <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">ROI Engine v9.9</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Valor Bruto (R$)</label>
                  <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingProp.valorBruto} onChange={e => setEditingProp({...editingProp, valorBruto: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Custo Estimado (R$)</label>
                  <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingProp.custoEstimado} onChange={e => setEditingProp({...editingProp, custoEstimado: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Desconto (%)</label>
                  <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingProp.descontoPercentual} onChange={e => setEditingProp({...editingProp, descontoPercentual: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Status</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingProp.status} onChange={e => setEditingProp({...editingProp, status: e.target.value as any})}>
                    <option value="Em Elaboração">Em Elaboração</option>
                    <option value="Enviada">Enviada</option>
                    <option value="Aprovada">Aprovada</option>
                    <option value="Reprovada">Reprovada</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingProp(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase shadow-lg">Salvar Proposta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalManager;
