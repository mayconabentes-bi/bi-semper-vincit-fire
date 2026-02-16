
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Compra, Projeto, Cliente } from '../types';

const PurchaseManager: React.FC = () => {
  const [purchases, setPurchases] = useState<Compra[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Compra | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const purchasesSnapshot = await getDocs(collection(db, "compras"));
      const purchasesData = purchasesSnapshot.docs.map(doc => ({ ...doc.data(), compraId: doc.id })) as Compra[];
      setPurchases(purchasesData);

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

  const getProjectClientName = (projetoId: string) => {
    const proj = projetos.find(p => p.projetoId === projetoId);
    if (!proj) return "N/A";
    const client = clientes.find(c => c.clienteId === proj.clienteId);
    return client ? client.nome : `Proj: ${projetoId}`;
  };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregue': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Em Trânsito': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Cancelado': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPurchase) {
      // Check if it's a new purchase by seeing if it exists in the current state
      const isNew = !purchases.some(p => p.compraId === editingPurchase.compraId);

      if (isNew) {
        const { compraId, ...newPurchaseData } = editingPurchase;
        const docRef = await addDoc(collection(db, 'compras'), newPurchaseData);
        setPurchases(prev => [...prev, { ...editingPurchase, compraId: docRef.id }]);
      } else {
        const purchaseDocRef = doc(db, 'compras', editingPurchase.compraId);
        const { compraId, ...purchaseData } = editingPurchase;
        await updateDoc(purchaseDocRef, purchaseData);
        setPurchases(prev => prev.map(p => p.compraId === editingPurchase.compraId ? editingPurchase : p));
      }

      setIsModalOpen(false);
      setEditingPurchase(null);
    }
  };

  const startNew = () => {
    setEditingPurchase({
      compraId: `PO_NEW_${Date.now()}`,
      projetoId: projetos[0]?.projetoId || '',
      fornecedor: '',
      valorTotal: 0,
      statusEntrega: 'Pendente',
      dataPedido: new Date().toLocaleDateString('pt-BR')
    });
    setIsModalOpen(true);
  };

  const startEdit = (p: Compra) => {
    setEditingPurchase(p);
    setIsModalOpen(true);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight italic">Procurement: Gestão de Compras</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Logística, Suprimentos e Rateio de Custos</p>
        </div>
        <button 
          onClick={startNew}
          className="px-6 py-2.5 bg-svBlue text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
        >
          + Novo Pedido
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Compra ID</th>
              <th className="px-6 py-5">Projeto Destino</th>
              <th className="px-6 py-5">Fornecedor</th>
              <th className="px-6 py-5">Valor</th>
              <th className="px-6 py-5">Status Entrega</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
          {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">Carregando compras...</td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">Nenhuma compra registrada.</td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.compraId} className="hover:bg-svBlue/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] font-bold text-svBlue">
                    {p.compraId}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-svBlue">{getProjectClientName(p.projetoId)}</p>
                    <p className="text-[9px] text-svGray font-mono">{p.projetoId}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-700">
                    {p.fornecedor}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-svBlue">
                    {formatCurrency(p.valorTotal)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${getStatusColor(p.statusEntrega)}`}>
                      {p.statusEntrega}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => startEdit(p)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic">Ordem de Compra (PO)</h3>
               <p className="text-[10px] font-bold uppercase opacity-70 tracking-widest">Sourcing & Procurement v9.9</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Projeto de Destino</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                  value={editingPurchase.projetoId}
                  onChange={e => setEditingPurchase({...editingPurchase, projectId: e.target.value})}
                >
                  <option value="">Selecione o Projeto...</option>
                  {projetos.map(proj => (
                    <option key={proj.projetoId} value={proj.projetoId}>{getProjectClientName(proj.projetoId)} ({proj.projetoId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Fornecedor</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                    value={editingPurchase.fornecedor}
                    onChange={e => setEditingPurchase({...editingPurchase, fornecedor: e.target.value})}
                    placeholder="Ex: SunSupply"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Valor Total (R$)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                    value={editingPurchase.valorTotal}
                    onChange={e => setEditingPurchase({...editingPurchase, valorTotal: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-svGray uppercase mb-1 block">Status Entrega</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold"
                  value={editingPurchase.statusEntrega}
                  onChange={e => setEditingPurchase({...editingPurchase, statusEntrega: e.target.value as any})}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em Trânsito">Em Trânsito</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase text-svGray">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase shadow-lg">Processar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseManager;
