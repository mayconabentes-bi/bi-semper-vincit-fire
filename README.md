# 🔥 BI Semper Vincit Fire v9.9

Sistema de Business Intelligence para gestão empresarial completa.

## 🚀 Tecnologias

- **React 19** + **TypeScript**
- **Vite 6** (Build tool)
- **Firebase** (Auth, Firestore, Functions)
- **TailwindCSS 4** (Estilização)
- **Recharts** (Visualizações)
- **Google Gemini AI** (Inteligência Artificial)

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/mayconabentes-bi/bi-semper-vincit-fire.git
cd bi-semper-vincit-fire
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 4. Implante as Firestore Rules

No Firebase Console:
1. Acesse **Firestore Database** → **Rules**
2. Copie o conteúdo de `firestore.rules`
3. Clique em **Publicar**

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🔐 Segurança

⚠️ **IMPORTANTE**: Leia o arquivo `SECURITY.md` para configuração completa de segurança.

### Principais pontos:

- ✅ Credenciais Firebase protegidas via variáveis de ambiente
- ✅ Regras de segurança granulares por role
- ✅ Validação de dados no Firestore
- ✅ Sistema de auditoria completo
- ✅ Controle de acesso baseado em permissões

## 📊 Funcionalidades

### Módulos Comerciais
- 🎯 Gerenciamento de Leads
- 👥 Gestão de Clientes
- 📋 Propostas Comerciais
- 💰 Controle de Vendas
- 📊 Dashboard de KPIs

### Módulos Operacionais
- 🔧 Execução de Projetos
- 📅 Visitas Técnicas
- ⚙️ Gestão de Serviços
- 📦 Controle de Estoque
- 🛒 Gestão de Compras

### Módulos Financeiros
- 💵 Fluxo de Caixa
- 📈 Gestão de Custos
- 💳 Controle de Pagamentos

### Sistema
- 👤 Gerenciamento de Usuários (10 roles)
- 🔔 Central de Notificações
- ⚠️ Alertas SLA
- 📝 Auditoria de Logs
- 🤖 Integração com IA (Google Gemini)

## 🎭 Roles de Usuário

| Role | Descrição |
|------|-----------|
| SUPER_ADMIN | Acesso total ao sistema |
| ADMIN | Gerenciamento completo |
| GERENTE_COMERCIAL | Gestão comercial |
| VENDEDOR | Vendas e leads |
| GERENTE_OPERACIONAL | Gestão operacional |
| TECNICO | Execução técnica |
| FINANCEIRO | Gestão financeira |
| COMPRAS | Gestão de compras |
| ESTOQUE | Controle de estoque |
| VISUALIZADOR | Apenas leitura |

## 🏗️ Estrutura do Projeto

```
bi-semper-vincit-fire/
├── components/          # 26 componentes React
├── services/           # Serviços (Firebase, Gemini, Notificações)
├── src/
│   ├── contexts/       # Context API (Auth, etc)
│   ├── types.ts        # Definições TypeScript
│   └── firebase.ts     # Configuração Firebase
├── hooks/              # Custom React Hooks
├── public/             # Assets estáticos
├── .env.local.example  # Template de variáveis de ambiente
├── firestore.rules     # Regras de segurança Firestore
└── SECURITY.md         # Guia de segurança
```

## 📝 Scripts Disponíveis

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build para produção
npm run preview   # Preview do build
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 📧 Contato

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Semper Vincit** - *Sempre Vencedor* 🏆
