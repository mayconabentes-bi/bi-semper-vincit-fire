
export enum LeadStatus {
  NOVO = "Novo",
  QUALIFICADO = "Qualificado",
  VISITA_AGENDADA = "Visita_Agendada",
  CONVERTIDO = "Convertido",
  PERDIDO = "Perdido"
}

export type SegmentType = "High Value" | "New" | "At Risk" | "Standard";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  GERENTE_COMERCIAL = "GERENTE_COMERCIAL",
  VENDEDOR = "VENDEDOR",
  GERENTE_OPERACIONAL = "GERENTE_OPERACIONAL",
  TECNICO = "TECNICO",
  FINANCEIRO = "FINANCEIRO",
  COMPRAS = "COMPRAS",
  ESTOQUE = "ESTOQUE",
  VISUALIZADOR = "VISUALIZADOR"
}

export interface Usuario {
  usuarioId: string;
  nome: string;
  email: string;
  senha?: string;
  role: UserRole;
  departamento: string;
  ativo: boolean;
  dataUltimoAcesso: string;
  fotoPerfil?: string;
}

export interface PermissaoModulo {
  modulo: string;
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  deletar: boolean;
  exportar: boolean;
}

export interface SegmentoCliente {
  clienteId: string;
  nome: string;
  segmento: SegmentType;
  dataSegmentacao: string;
}

export interface Servico {
  servicoId: string;
  nome: string;
  descricao: string;
  categoria: "Instalação" | "Manutenção" | "Consultoria" | "Homologação";
  precoBase: number;
  prazoEstimadoDias: number;
}

export interface Lead {
  leadId: string;
  clienteId?: string;
  cnpj?: string;
  cpf?: string;
  nome: string;
  contatoPessoa: string;
  tel1: string;
  tel2?: string;
  email: string;
  cidade: string;
  bairro: string;
  endereco: string;
  cepId: string;
  dataEntrada: string;
  responsavel: string;
  status: LeadStatus;
  score: string; // Frio, Morno, Quente
  slaQualificacao: string;
  origem: string;
}

export interface Cliente {
  leadId: string;
  clienteId: string;
  nome: string;
  cnpjId?: string;
  cpfId?: string;
  pessoaContato: string;
  telefone1: string;
  telefone2?: string;
  email: string;
  cidade: string;
  bairro: string;
  endereco: string;
  cepId: string;
  dataEntrada: string;
  tipo: "Pessoa Jurídica (PJ)" | "Pessoa Física (PF)";
  dataPrimeiroContato: string;
}

export interface VisitaTecnica {
  visitaId: string;
  leadId: string;
  dataVisita: string;
  tecnico: string;
  viabilidade: "Pendente" | "Viável" | "Inviável";
  complexidade: string;
  observacoes: string;
}

export interface CustoOperacional {
  projetoId: string;
  custoMaterial: number;
  custoMaoObra: number;
  custoDeslocamento: number;
  outrosCustos: number;
  custoTotal: number;
}

export interface Proposta {
  propostaId: string;
  leadId: string;
  tipoProjeto: string;
  valorBruto: number;
  custoEstimado: number;
  descontoPercentual: number;
  valorFinal: number;
  margemPercentual: number;
  probabilidadePercentual: number;
  status: "Em Elaboração" | "Enviada" | "Aprovada" | "Reprovada";
  dataEnvio: string;
}

export interface Venda {
  vendaId: string;
  propostaId: string;
  receita: number;
  dataFechamento: string;
  formaPagamento: string;
  parcelas: number;
  receitaRecebida: number;
  dataUltimoRecebimento: string;
}

export interface Projeto {
  projetoId: string;
  propostaId: string;
  clienteId: string;
  servicoId?: string;
  dataAbertura: string;
  statusProjeto: string;
  responsavelExecucao: string;
  tipoProjeto: string;
  valorContrato: number;
}

export interface Execucao {
  projetoId: string;
  dataInicio: string;
  dataFim: string;
  prazoPrometido: number;
  prazoReal: number;
  retrabalho: "Sim" | "Não";
  motivoRetrabalho?: string;
}

export interface PosVenda {
  projetoId: string;
  dataEntrega: string;
  nps: number;
  avaliacaoGoogle: boolean;
  indicacaoGerada: boolean;
}

export interface LogAuditoria {
  data: string;
  usuario: string;
  acao: string;
  referencia: string;
}

export interface Compra {
  compraId: string;
  projetoId: string;
  fornecedor: string;
  valorTotal: number;
  statusEntrega: "Pendente" | "Em Trânsito" | "Entregue" | "Cancelado";
  dataPedido: string;
}

export interface ItemEstoque {
  itemId: string;
  nome: string;
  categoria: "Painel" | "Inversor" | "Estrutura" | "Cabo" | "Outros";
  unidade: string;
  pontoPedido: number;
}

export interface MovimentacaoEstoque {
  movId: string;
  itemId: string;
  tipo: "Entrada" | "Saída";
  quantidade: number;
  data: string;
  referenciaId?: string;
}

export interface KPIData {
  receitaTotal: number;
  totalVendas: number;
  taxaConversao: number;
  ticketMedio: number;
}

export interface Notificacao {
  notificacaoId: string;
  tipo: 'email' | 'sms' | 'whatsapp' | 'sistema';
  destinatario: string;
  assunto: string;
  mensagem: string;
  trigger: string;
  status: 'pendente' | 'enviada' | 'erro';
  dataEnvio: string;
  erro?: string;
}

export interface ConfigNotificacao {
  habilitado: boolean;
  enviarEmail: boolean;
  enviarSMS: boolean;
  enviarWhatsApp: boolean;
}

export interface AlertaSLA {
  alertaId: string;
  tipo: 'LEAD_SEM_FOLLOW_UP' | 'PROPOSTA_EXPIRADA' | 'PROJETO_ATRASADO' | 'ESTOQUE_BAIXO' | 'COMPRA_PENDENTE';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  referencia: string;
  mensagem: string;
  dataAlerta: string;
  resolvido: boolean;
  dataResolucao?: string;
}
