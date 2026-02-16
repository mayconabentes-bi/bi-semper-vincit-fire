
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase';
import { CustoOperacional, Projeto, Cliente } from '../types';

const CostManager: React.FC = () => {
  const [custos, setCustos] = useState<CustoOperacional[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const custosSnapshot = await getDocs(collection(db, "custos"));
      const custosData = custosSnapshot.docs.map(doc => ({ ...doc.data(), custoId: doc.id })) as CustoOperacional[];
      setCustos(custosData);

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

  const getClientNameByProject = (projetoId: string) => {
    const proj = projetos.find(p => p.projetoId === projetoId);
    if (!proj) return "N/A";
    return clientes.find(c => c.clienteId === proj.clienteId)?.nome || "Cliente Desconhecido";
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalCustoGeral = custos.reduce((acc, curr) => acc + curr.custoTotal, 0);

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl animate-fadeIn border border-gray-100 bg-white">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-bold text-svBlue uppercase tracking-tight italic">5. Custos Operacionais</h3>
          <p className="text-xs text-svGray font-bold mt-1 tracking-widest uppercase opacity-70">Auditoria Automática de DRE por Projeto</p>
        </div>
        <div className="px-5 py-2.5 bg-svCopper/10 rounded-xl">
           <p className="text-[10px] font-black text-svCopper uppercase tracking-widest mb-0.5">Custo Real Acumulado</p>
           <p className="text-lg font-black text-svCopper">{formatCurrency(totalCustoGeral)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-gray-50/50 text-[10px] font-extrabold text-svGray uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Projeto / Cliente</th>
              <th className="px-6 py-5">Custo Material (Procurement)</th>
              <th className="px-6 py-5">Mão de Obra</th>
              <th className="px-6 py-5">Deslocamento</th>
              <th className="px-6 py-5">Outros</th>
              <th className="px-6 py-5 text-right">Custo Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white/30">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">Carregando custos...</td>
              </tr>
            ) : custos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-svGray text-sm italic font-medium">
                  Nenhum custo registrado na base operacional v9.9.
                </td>
              </tr>
            ) : (
              custos.map((c) => (
                <tr key={c.projetoId} className="hover:bg-svBlue/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-svBlue">{getClientNameByProject(c.projetoId)}</p>
                    <span className="font-mono text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-svGray border border-gray-200">
                      {c.projetoId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-svBlue">{formatCurrency(c.custoMaterial)}</p>
                    <p className="text-[8px] font-bold text-emerald-600 uppercase">Auto-Sourcing OK</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-700">
                    {formatCurrency(c.custoMaoObra)}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-700">
                    {formatCurrency(c.custoDeslocamento)}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500 italic">
                    {formatCurrency(c.outrosCustos)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-black text-svBlue">{formatCurrency(c.custoTotal)}</p>
                    <p className="text-[9px] font-bold text-svGray uppercase opacity-50 italic">Custo Real</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
         <div className="flex gap-4">
            <div className="flex items-center space-x-2">
               <div className="w-3 h-3 rounded bg-emerald-500 shadow-sm"></div>
               <span className="text-[9px] font-bold text-svGray uppercase tracking-widest">Sincronizado via Gestão de Compras</span>
            </div>
         </div>
         <p className="text-[9px] font-black text-svBlue uppercase tracking-widest italic tracking-tighter">Semper Vincit Intelligence v9.9</p>
      </div>
    </div>
  );
};

export default CostManager;
