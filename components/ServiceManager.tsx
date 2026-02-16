
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Servico, Cliente } from '../types';

const ServiceManager: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Servico> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const servicesSnapshot = await getDocs(collection(db, "servicos"));
        const servicesData = servicesSnapshot.docs.map(doc => ({ ...doc.data(), servicoId: doc.id })) as Servico[];
        setServicos(servicesData);

        const clientsSnapshot = await getDocs(collection(db, "clientes"));
        const clientsData = clientsSnapshot.docs.map(doc => ({ ...doc.data(), clienteId: doc.id })) as Cliente[];
        setClientes(clientsData);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      if (editingService.servicoId) {
        // Update
        const serviceDocRef = doc(db, 'servicos', editingService.servicoId);
        const { servicoId, ...serviceData } = editingService;
        await updateDoc(serviceDocRef, serviceData);
        setServicos(prev => prev.map(s => s.servicoId === editingService.servicoId ? { ...s, ...editingService } : s));
      } else {
        // Create
        const docRef = await addDoc(collection(db, 'servicos'), editingService);
        setServicos(prev => [...prev, { ...editingService, servicoId: docRef.id } as Servico]);
      }
      setIsModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
    }
  };

  const startNewService = () => {
    setEditingService({
      nomeServico: '',
      descricao: '',
      clienteId: '',
      status: 'Agendado',
      dataServico: new Date().toISOString().split('T')[0],
      valor: 0,
      responsavel: ''
    });
    setIsModalOpen(true);
  };

  const startEditService = (service: Servico) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const getClientName = (clientId: string) => {
      return clientes.find(c => c.clienteId === clientId)?.nome || 'Desconhecido';
  }

  if (isLoading) {
    return <div className="p-8 text-center">Carregando serviços...</div>;
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
       <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight italic">Gestão de Serviços</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Manutenções, Visitas e Serviços Avulsos</p>
        </div>
        <button 
          onClick={startNewService}
          className="px-6 py-2.5 bg-svBlue text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
        >
          + Novo Serviço
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
                <tr>
                    <th className="px-6 py-5">Serviço</th>
                    <th className="px-6 py-5">Cliente</th>
                    <th className="px-6 py-5">Data</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Valor</th>
                    <th className="px-6 py-5 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {servicos.map(s => (
                    <tr key={s.servicoId} className="hover:bg-svBlue/[0.02] transition-colors">
                        <td className="px-6 py-4">
                            <p className="font-bold text-sm text-svBlue">{s.nomeServico}</p>
                            <p className="text-xs text-svGray">{s.descricao}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-xs text-gray-800">{getClientName(s.clienteId)}</td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-600">{new Date(s.dataServico).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${s.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{s.status}</span></td>
                        <td className="px-6 py-4 font-black text-svBlue">{s.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => startEditService(s)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
                 <div className="p-8 gradient-sv text-white">
                    <h3 className="font-bold text-lg uppercase italic">{editingService?.servicoId ? 'Editar' : 'Novo'} Serviço</h3>
                    <p className="text-[10px] font-bold uppercase opacity-70">Service Management v9.9</p>
                </div>
                <form onSubmit={handleSave} className="p-8 space-y-4">
                    <input type="text" placeholder="Nome do Serviço" value={editingService?.nomeServico} onChange={e => setEditingService({...editingService, nomeServico: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200" required />
                    <textarea placeholder="Descrição do Serviço" value={editingService?.descricao} onChange={e => setEditingService({...editingService, descricao: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200" rows={3}></textarea>
                    <select value={editingService?.clienteId} onChange={e => setEditingService({...editingService, clienteId: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200" required>
                        <option value="">Selecione um Cliente</option>
                        {clientes.map(c => <option key={c.clienteId} value={c.clienteId}>{c.nome}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={editingService?.dataServico} onChange={e => setEditingService({...editingService, dataServico: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200" required />
                        <input type="number" placeholder="Valor" value={editingService?.valor} onChange={e => setEditingService({...editingService, valor: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border-gray-200" />
                    </div>
                    <select value={editingService?.status} onChange={e => setEditingService({...editingService, status: e.target.value as any})} className="w-full px-4 py-3 rounded-xl border-gray-200">
                        <option>Agendado</option>
                        <option>Em Andamento</option>
                        <option>Concluído</option>
                        <option>Cancelado</option>
                    </select>
                    <input type="text" placeholder="Responsável" value={editingService?.responsavel} onChange={e => setEditingService({...editingService, responsavel: e.target.value})} className="w-full px-4 py-3 rounded-xl border-gray-200" />
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 bg-svCopper text-white rounded-xl font-bold text-xs uppercase">Salvar Serviço</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
