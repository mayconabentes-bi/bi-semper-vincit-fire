
import { Lead, LeadStatus, Cliente, Venda, Projeto, Proposta, VisitaTecnica, CustoOperacional, Execucao, PosVenda, LogAuditoria, Compra, ItemEstoque, MovimentacaoEstoque, Servico, Usuario, UserRole, Notificacao, AlertaSLA } from "./types";

export const initialUsuarios: Usuario[] = [
  {
    usuarioId: "USR_001",
    nome: "Admin Master",
    email: "admin@sempervincit.com",
    senha: "admin123",
    role: UserRole.SUPER_ADMIN,
    departamento: "Diretoria",
    ativo: true,
    dataUltimoAcesso: "20/02/2026 10:00:00",
    fotoPerfil: "https://i.pravatar.cc/150?u=USR_001"
  },
  {
    usuarioId: "USR_002",
    nome: "Carlos Vendedor",
    email: "carlos@sempervincit.com",
    senha: "vendedor123",
    role: UserRole.VENDEDOR,
    departamento: "Comercial",
    ativo: true,
    dataUltimoAcesso: "19/02/2026 15:30:00",
    fotoPerfil: "https://i.pravatar.cc/150?u=USR_002"
  }
];

export const initialAlertasSLA: AlertaSLA[] = [
  {
    alertaId: "SLA_001",
    tipo: 'LEAD_SEM_FOLLOW_UP',
    severidade: 'alta',
    referencia: "LEAD_8D0FA6",
    mensagem: "Lead 'Solar Tech' sem interação comercial há mais de 48h.",
    dataAlerta: "21/02/2026 10:00:00",
    resolvido: false
  },
  {
    alertaId: "SLA_002",
    tipo: 'ESTOQUE_BAIXO',
    severidade: 'critica',
    referencia: "ITM_001",
    mensagem: "Estoque de 'Painel Solar 550W Jinko' atingiu o ponto de pedido.",
    dataAlerta: "22/02/2026 08:30:00",
    resolvido: false
  }
];

export const initialNotificacoes: Notificacao[] = [
  {
    notificacaoId: "NOT_001",
    tipo: 'whatsapp',
    destinatario: "(11) 91234-5678",
    assunto: "Boas-vindas",
    mensagem: "Olá João! Bem-vindo à Semper Vincit Solar. Sua proposta está em elaboração.",
    trigger: "NOVO_LEAD",
    status: 'enviada',
    dataEnvio: "20/02/2026 14:20:00"
  },
  {
    notificacaoId: "NOT_002",
    tipo: 'email',
    destinatario: "jose@padariaze.com",
    assunto: "Projeto Aprovado",
    mensagem: "Seu projeto PRO_8F12A3 foi concluído com sucesso. Veja os detalhes em anexo.",
    trigger: "PROJETO_CONCLUIDO",
    status: 'enviada',
    dataEnvio: "21/02/2026 09:15:00"
  }
];

export const initialServicos: Servico[] = [
  {
    servicoId: "SERV_SOL_RES",
    nome: "Instalação Solar Residencial",
    descricao: "Projeto completo de instalação fotovoltaica para residências de até 10kWp.",
    categoria: "Instalação",
    precoBase: 15000,
    prazoEstimadoDias: 30
  },
  {
    servicoId: "SERV_SOL_COM",
    nome: "Instalação Solar Comercial",
    descricao: "Soluções robustas para comércios e pequenas indústrias, focado em alta eficiência.",
    categoria: "Instalação",
    precoBase: 45000,
    prazoEstimadoDias: 60
  }
];

export const initialLeads: Lead[] = [
  {
    leadId: "LEAD_8D0FA6",
    clienteId: "",
    cnpj: "12.345.678/0001-99",
    cpf: "",
    nome: "Solar Tech",
    contatoPessoa: "João Silva",
    tel1: "(11) 91234-5678",
    tel2: "",
    email: "contato@solartech.com",
    cidade: "Manaus",
    bairro: "Centro",
    endereco: "Rua A, 10",
    cepId: "01001-000",
    dataEntrada: "02/02/2026",
    responsavel: "Carlos Vendedor",
    status: LeadStatus.NOVO,
    score: "Quente",
    slaQualificacao: "Em Conformidade",
    origem: "Google Ads"
  },
  {
    leadId: "LEAD_FF22A1",
    nome: "Residencial Amazon",
    contatoPessoa: "Maria Costa",
    tel1: "(92) 99888-7766",
    email: "maria@email.com",
    cidade: "Manaus",
    bairro: "Adrianópolis",
    endereco: "Av. Paraíba, 500",
    cepId: "69000-000",
    dataEntrada: "05/02/2026",
    responsavel: "Carlos Vendedor",
    status: LeadStatus.QUALIFICADO,
    score: "Morno",
    slaQualificacao: "Em Conformidade",
    origem: "Indicação"
  }
];

export const initialClientes: Cliente[] = [
  {
    leadId: "LEAD_8032D1",
    clienteId: "CLI_565E37",
    nome: "Padaria do Zé",
    cnpjId: "",
    cpfId: "111.222.333-44",
    pessoaContato: "José Santos",
    telefone1: "(11) 92222-3333",
    telefone2: "",
    email: "jose@padariaze.com",
    cidade: "Iranduba",
    bairro: "Lapa",
    endereco: "Rua B, 20",
    cepId: "05001-000",
    dataEntrada: "28/01/2026",
    tipo: "Pessoa Jurídica (PJ)" ,
    dataPrimeiroContato: "28/01/2026"
  }
];

export const initialVisitas: VisitaTecnica[] = [
  {
    visitaId: "VIS_C798FD",
    leadId: "LEAD_8D0FA6",
    dataVisita: "12/02/2026 15:45:20",
    tecnico: "Eng. Pedro",
    viabilidade: "Viável",
    complexidade: "1",
    observacoes: "Telhado em boas condições, orientação norte livre."
  }
];

export const initialProjetos: Projeto[] = [
  {
    projetoId: "PRO_8F12A3",
    propostaId: "PROP_CF7696",
    clienteId: "CLI_565E37",
    servicoId: "SERV_SOL_RES",
    dataAbertura: "15/02/2026",
    statusProjeto: "Concluído",
    responsavelExecucao: "Eng. Pedro",
    tipoProjeto: "Solar Residencial",
    valorContrato: 23750.00
  }
];

export const initialExecucoes: Execucao[] = [
  {
    projetoId: "PRO_8F12A3",
    dataInicio: "16/02/2026",
    dataFim: "20/02/2026",
    prazoPrometido: 15,
    prazoReal: 4,
    retrabalho: "Não",
    motivoRetrabalho: ""
  }
];

export const initialCustos: CustoOperacional[] = [
  {
    projetoId: "PRO_8F12A3",
    custoMaterial: 12000,
    custoMaoObra: 4000,
    custoDeslocamento: 800,
    outrosCustos: 200,
    custoTotal: 17000
  }
];

export const initialPropostas: Proposta[] = [
  {
    propostaId: "PROP_CF7696",
    leadId: "LEAD_8032D1",
    tipoProjeto: "Solar Residencial",
    valorBruto: 25000,
    custoEstimado: 12000,
    descontoPercentual: 5,
    valorFinal: 23750,
    margemPercentual: 49.47,
    probabilidadePercentual: 1,
    status: "Aprovada",
    dataEnvio: "12/02/2026 15:40:13"
  }
];

export const initialVendas: Venda[] = [
  {
    vendaId: "VEN_4A82B1",
    propostaId: "PROP_CF7696",
    receita: 23750,
    dataFechamento: "14/02/2026",
    formaPagamento: "Pix",
    parcelas: 1,
    receitaRecebida: 23750,
    dataUltimoRecebimento: "14/02/2026"
  }
];

export const initialPosVenda: PosVenda[] = [
  {
    projetoId: "PRO_8F12A3",
    dataEntrega: "22/02/2026",
    nps: 10,
    avaliacaoGoogle: true,
    indicacaoGerada: true
  }
];

export const initialLogs: LogAuditoria[] = [
  {
    data: "14/02/2026 10:30:15",
    usuario: "admin@sempervincit.com",
    acao: "VENDA_FECHADA",
    referencia: "PROP_CF7696"
  }
];

export const initialPurchases: Compra[] = [
  {
    compraId: "PO_9912A",
    projetoId: "PRO_8F12A3",
    fornecedor: "Sunking Supply",
    valorTotal: 12000,
    statusEntrega: "Entregue",
    dataPedido: "10/02/2026"
  }
];

export const initialInventoryItems: ItemEstoque[] = [
  { itemId: "ITM_001", nome: "Painel Solar 550W Jinko", categoria: "Painel", unidade: "UN", pontoPedido: 20 }
];

export const initialInventoryMovements: MovimentacaoEstoque[] = [
  { movId: "MOV_001", itemId: "ITM_001", tipo: "Entrada", quantidade: 100, data: "01/02/2026", referenciaId: "PO_BASE" }
];
