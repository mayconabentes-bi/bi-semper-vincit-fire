
import React from 'react';
import { Venda, CustoOperacional, Projeto, Cliente, Proposta, Usuario } from '../types';
import { PERMISSIONS_MATRIX } from '../constants/permissions';

interface DataConsolidatedProps {
  vendas: Venda[];
  custos: CustoOperacional[];
  projetos: Projeto[];
  clientes: Cliente[];
  propostas: Proposta[];
  currentUser: Usuario;
}

const DataConsolidated: React.FC<DataConsolidatedProps> = ({ vendas, custos, projetos, clientes, propostas, currentUser }) => {
  const TAX_RATE = 0.15;
  const permissions = PERMISSIONS_MATRIX[currentUser.role]?.bi_consolidated;

  const consolidatedData = custos.map(custo => {
    const proj = projetos.find(p => p.projetoId === custo.projetoId);
    const cliente = clientes.find(c => c.clienteId === proj?.clienteId);
    const venda = vendas.find(v => v.propostaId === proj?.propostaId);

    const receita = venda?.receita || 0;
    const impostos = receita * TAX_RATE;
    const margemBruta = receita - (custo.custoTotal + impostos);

    return {
      projetoId: custo.projetoId,
      cliente: cliente?.nome || 'N/A',
      tipo: proj?.tipoProjeto || 'N/A',
      dataAbertura: proj?.dataAbertura || 'N/A',
      receitaBruta: receita,
      custoMaterial: custo.custoMaterial,
      custoMaoObra: custo.custoMaoObra,
      custoLogistica: custo.custoDeslocamento,
      outrosCustos: custo.outrosCustos,
      impostos: impostos,
      lucroLiquido: margemBruta,
      margemPercentual: receita > 0 ? (margemBruta / receita) * 100 : 0
    };
  });

  const copyToCSV = () => {
    if (!permissions.exportar) {
      alert("Seu perfil não tem permissão para exportar dados sensíveis.");
      return;
    }
    const headers = Object.keys(consolidatedData[0]).join(';');
    const rows = consolidatedData.map(d => Object.values(d).join(';')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    navigator.clipboard.writeText(csvContent);
    alert("Estrutura DATA_CONSOLIDATED copiada para o clipboard (formato CSV/Excel)!");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-card p-8 rounded-3xl border border-svBlue/10 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-black text-svBlue uppercase italic tracking-tighter">DATA_CONSOLIDATED Engine</h3>
            <p className="text-[10px] font-bold text-svGray uppercase tracking-widest mt-1">Conector mestre para Looker Studio & BI Externo</p>
          </div>
          {permissions.exportar && (
            <button 
              onClick={copyToCSV}
              className="px-6 py-3 bg-svBlue text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
              <span>Exportar para Looker</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left text-[10px] font-mono">
            <thead className="bg-gray-900 text-white uppercase tracking-tighter">
              <tr>
                <th className="px-4 py-4">Projeto_ID</th>
                <th className="px-4 py-4">Cliente</th>
                <th className="px-4 py-4 text-right">Receita_Bruta</th>
                <th className="px-4 py-4 text-right">Custo_Mat</th>
                <th className="px-4 py-4 text-right">Custo_MO</th>
                <th className="px-4 py-4 text-right">Impostos</th>
                <th className="px-4 py-4 text-right">Lucro_Real</th>
                <th className="px-4 py-4 text-right">Margem_%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {consolidatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-svBlue/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-svBlue">{row.projetoId}</td>
                  <td className="px-4 py-3 text-svGray truncate max-w-[150px]">{row.cliente}</td>
                  <td className="px-4 py-3 text-right font-bold">R$ {row.receitaBruta.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-rose-600">-{row.custoMaterial.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-rose-500">-{row.custoMaoObra.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-svGray">-{row.impostos.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-600">R$ {row.lucroLiquido.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded font-black ${row.margemPercentual > 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {row.margemPercentual.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-svBlue/5 rounded-2xl border border-svBlue/10">
           <div className="flex items-center space-x-3 mb-2">
              <svg className="w-5 h-5 text-svBlue" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              <h4 className="text-xs font-black text-svBlue uppercase tracking-widest">Metadata do Conector</h4>
           </div>
           <p className="text-[11px] text-svGray leading-relaxed">
             Esta tabela une as dimensões <span className="font-bold">DIM_CLIENTES</span>, <span className="font-bold">FATO_VENDAS</span> e <span className="font-bold">FATO_CUSTOS</span> através do <span className="font-mono bg-white px-1">projetoId</span>. 
             Utilize o botão de exportação para alimentar o data source do Looker Studio em modo 'Manual CSV Ingestion' ou para conferência de DRE executivo.
           </p>
        </div>
      </div>
    </div>
  );
};

export default DataConsolidated;
