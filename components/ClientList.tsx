
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { Cliente } from '../types';

interface ClientListProps {
  // Props are no longer needed as the component will fetch its own data.
}

const ClientList: React.FC<ClientListProps> = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientsData = querySnapshot.docs.map(doc => ({ ...doc.data(), clienteId: doc.id })) as Cliente[];
      setClientes(clientsData);
      setIsLoading(false);
    };

    fetchClients();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      const clientDocRef = doc(db, 'clientes', editingClient.clienteId);
      const { clienteId, ...clientData } = editingClient;
      await updateDoc(clientDocRef, clientData);
      
      setClientes(prev => prev.map(c => c.clienteId === editingClient.clienteId ? editingClient : c));
      setEditingClient(null);
    }
  };

  const openInMaps = (c: Cliente) => {
    const query = encodeURIComponent(`${c.endereco}, ${c.bairro}, ${c.cidade}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase">2. DIM_CLIENTES (Cadastro Mestre)</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Dimensão única para BI e Geolocalização</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead className="bg-gray-50/80 text-[10px] font-extrabold text-svGray uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">Cliente ID</th>
              <th className="px-6 py-5">Nome / Razão</th>
              <th className="px-6 py-5">Endereço / Localização</th>
              <th className="px-6 py-5">Contato / E-mail</th>
              <th className="px-6 py-5">Tipo</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-svGray text-sm italic">Carregando clientes...</td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-svGray text-sm italic">Base DIM vazia. Converta Leads Qualificados.</td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.clienteId} className="hover:bg-svBlue/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold text-svBlue bg-svBlue/5 px-2 py-1 rounded-md border border-svBlue/10">{c.clienteId}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{c.nome}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-700 font-medium">{c.endereco}</p>
                    <p className="text-[10px] text-svGray italic">{c.bairro}, {c.cidade}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-svBlue">{c.telefone1}</p>
                    <p className="text-[10px] text-svGray">{c.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm text-white ${c.tipo.includes('PJ') ? 'bg-svBlue' : 'bg-svCopper'}`}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                    <button onClick={() => openInMaps(c)} className="p-2 text-svGold hover:bg-svGold/10 rounded-lg transition-all" title="Ver no Maps">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    <button onClick={() => setEditingClient(c)} className="p-2 text-svBlue hover:bg-svBlue/10 rounded-lg transition-all" title="Editar DIM">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-svBlue/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden animate-fadeIn shadow-2xl">
            <div className="p-8 gradient-sv text-white">
               <h3 className="font-bold text-lg uppercase italic">Manutenção de Base DIM</h3>
               <p className="text-[10px] font-bold uppercase opacity-70">Integridade de Dados v9.9</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <input 
                placeholder="Razão Social / Nome"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold" 
                value={editingClient.nome} 
                onChange={e => setEditingClient({...editingClient, nome: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="CNPJ/CPF" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingClient.cnpjId || editingClient.cpfId} onChange={e => setEditingClient({...editingClient, cnpjId: e.target.value})} />
                <input placeholder="E-mail" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingClient.email} onChange={e => setEditingClient({...editingClient, email: e.target.value})} />
              </div>
              <input placeholder="Endereço Completo" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={editingClient.endereco} onChange={e => setEditingClient({...editingClient, endereco: e.target.value})} />
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingClient(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase text-svGray">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-svBlue text-white rounded-xl font-bold text-xs uppercase shadow-lg">Atualizar DIM</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
