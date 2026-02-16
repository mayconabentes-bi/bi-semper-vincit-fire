
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Projeto, Cliente } from '../types';

const ProjectTracker: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editingProj, setEditingProj] = useState<Projeto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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

  const getClientName = (clienteId: string) => {
    return clientes.find(c => c.clienteId === clienteId)?.nome || "Cliente DIM";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Em Execução': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Aguardando Início': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Suspenso': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProj) {
      const projDocRef = doc(db, 'projetos', editingProj.projetoId);
      const { projetoId, ...projData } = editingProj;
      await updateDoc(projDocRef, projData);

      setProjetos(prev => prev.map(p => p.projetoId === editingProj.projetoId ? editingProj : p));
      setEditingProj(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight">4. Gestão de Projetos</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Elo Central: Vendas x Operacional</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Projeto ID</th>
              <th className="px-6 py-5">Cliente / Razão</th>
              <th className="px-6 py-5">Data Abertura</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5">Engenheiro / Resp.</th>
              <th className="px-6 py-5 text-right">Contrato</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">Carregando projetos...</td>
                </tr>
            ) : projetos.map((p) => (
              <tr key={p.projetoId} className="hover:bg-svBlue/[0.02] transition-colors group">
                <td className="px-6 py-4 font-mono text-[10px] font-bold text-svGray">
                  {p.projetoId}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-svBlue">{getClientName(p.clienteId)}</p>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-700">{p.dataAbertura}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${getStatusColor(p.statusProjeto)}`}>
                    {p.statusProjeto}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-svGray">
                  {p.responsavelExecucao}
                </td>
                <td className="px-6 py-4 text-right font-black text-svBlue">
                  R$ {p.valorContrato.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setEditingProj(p)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic">Status da Obra / Projeto</h3>
               <p className="text-[10px] font-bold uppercase opacity-70">Engine Operacional v9.9</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Fase Atual</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                  value={editingProj.statusProjeto}
                  onChange={e => setEditingProj({...editingProj, statusProjeto: e.target.value})}
                >
                  <option value="Aguardando Início">Aguardando Início</option>
                  <option value="Material em Trânsito">Material em Trânsito</option>
                  <option value="Em Execução">Em Execução</option>
                  <option value="Vistoria Técnica">Vistoria Técnica</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Suspenso">Suspenso</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Responsável Técnico</label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                  value={editingProj.responsavelExecucao}
                  onChange={e => setEditingProj({...editingProj, responsavelExecucao: e.target.value})}
                  placeholder="Nome do Engenheiro/Técnico"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingProj(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase text-svGray">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase shadow-lg">Salvar Status</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTracker;
