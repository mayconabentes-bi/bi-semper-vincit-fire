
import { useState, useEffect, useCallback } from 'react';
import { AlertaSLA, Lead, LeadStatus, Proposta, Projeto, ItemEstoque, MovimentacaoEstoque, Compra } from '../types';

export const useAlerts = (
  leads: Lead[],
  propostas: Proposta[],
  projetos: Projeto[],
  items: ItemEstoque[],
  movements: MovimentacaoEstoque[],
  purchases: Compra[]
) => {
  const [alertas, setAlertas] = useState<AlertaSLA[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const novosAlertas: AlertaSLA[] = [];
    const hoje = new Date();

    // ALERTA 1: Leads sem follow-up há mais de 7 dias
    leads.forEach(lead => {
      if (lead.status === LeadStatus.NOVO) {
        // Converte DD/MM/YYYY para YYYY-MM-DD
        const parts = lead.dataEntrada.split('/');
        const dataEntrada = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const diasSemAcao = Math.floor((hoje.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasSemAcao > 7) {
          const id = `SLA_LEAD_${lead.leadId}`;
          novosAlertas.push({
            alertaId: id,
            tipo: 'LEAD_SEM_FOLLOW_UP',
            severidade: diasSemAcao > 14 ? 'critica' : 'alta',
            referencia: lead.leadId,
            mensagem: `Lead "${lead.nome}" sem atividade há ${diasSemAcao} dias`,
            dataAlerta: new Date().toLocaleString('pt-BR'),
            resolvido: resolvedIds.has(id)
          });
        }
      }
    });

    // ALERTA 2: Propostas sem resposta há mais de 15 dias
    propostas.forEach(prop => {
      if (prop.status === 'Enviada') {
        const parts = prop.dataEnvio.split(' ')[0].split('/');
        const dataEnvio = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const diasSemResposta = Math.floor((hoje.getTime() - dataEnvio.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasSemResposta > 15) {
          const id = `SLA_PROP_${prop.propostaId}`;
          novosAlertas.push({
            alertaId: id,
            tipo: 'PROPOSTA_EXPIRADA',
            severidade: diasSemResposta > 30 ? 'critica' : 'media',
            referencia: prop.propostaId,
            mensagem: `Proposta "${prop.propostaId}" sem resposta há ${diasSemResposta} dias`,
            dataAlerta: new Date().toLocaleString('pt-BR'),
            resolvido: resolvedIds.has(id)
          });
        }
      }
    });

    // ALERTA 3: Estoque abaixo do ponto de pedido
    items.forEach(item => {
      const entries = movements.filter(m => m.itemId === item.itemId && m.tipo === 'Entrada').reduce((acc, m) => acc + m.quantidade, 0);
      const exits = movements.filter(m => m.itemId === item.itemId && m.tipo === 'Saída').reduce((acc, m) => acc + m.quantidade, 0);
      const balance = entries - exits;
      
      if (balance <= item.pontoPedido) {
        const id = `SLA_STOCK_${item.itemId}`;
        novosAlertas.push({
          alertaId: id,
          tipo: 'ESTOQUE_BAIXO',
          severidade: balance === 0 ? 'critica' : 'alta',
          referencia: item.itemId,
          mensagem: `Estoque de "${item.nome}" está baixo: ${balance} ${item.unidade} (Mínimo: ${item.pontoPedido})`,
          dataAlerta: new Date().toLocaleString('pt-BR'),
          resolvido: resolvedIds.has(id)
        });
      }
    });

    // ALERTA 4: Compras pendentes há mais de 30 dias
    purchases.forEach(purchase => {
      if (purchase.statusEntrega === 'Pendente') {
        const parts = purchase.dataPedido.split('/');
        const dataPedido = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const diasPendente = Math.floor((hoje.getTime() - dataPedido.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasPendente > 30) {
          const id = `SLA_PURCHASE_${purchase.compraId}`;
          novosAlertas.push({
            alertaId: id,
            tipo: 'COMPRA_PENDENTE',
            severidade: 'media',
            referencia: purchase.compraId,
            mensagem: `Compra "${purchase.compraId}" pendente há ${diasPendente} dias`,
            dataAlerta: new Date().toLocaleString('pt-BR'),
            resolvido: resolvedIds.has(id)
          });
        }
      }
    });

    setAlertas(novosAlertas);
  }, [leads, propostas, projetos, items, movements, purchases, resolvedIds]);

  const resolverAlerta = useCallback((alertaId: string) => {
    setResolvedIds(prev => new Set(prev).add(alertaId));
  }, []);

  return { alertas, resolverAlerta };
};
