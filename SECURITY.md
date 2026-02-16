# 🔐 Guia de Segurança - BI Semper Vincit Fire

## 📋 Configuração Inicial

### 1. Variáveis de Ambiente

Copie o arquivo `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais do Firebase Console.

**⚠️ NUNCA comite o arquivo `.env.local`!**

### 2. Firestore Security Rules

As regras de segurança implementadas seguem o princípio do menor privilégio:

#### Roles e Permissões

| Role | Permissões |
|------|-----------|
| **SUPER_ADMIN** | Acesso total (leitura, escrita, exclusão) |
| **ADMIN** | Gerenciamento completo exceto exclusão de usuários |
| **GERENTE_COMERCIAL** | Gestão comercial e financeira |
| **VENDEDOR** | Leads, propostas, vendas |
| **GERENTE_OPERACIONAL** | Projetos, execuções, compras |
| **TECNICO** | Visitas, execuções |
| **FINANCEIRO** | Vendas, financeiro, custos |
| **COMPRAS** | Compras, estoque |
| **ESTOQUE** | Estoque, movimentações |
| **VISUALIZADOR** | Apenas leitura |

### 3. Custom Claims (Firebase)

Para que as regras de role funcionem, configure custom claims no Firebase:

```javascript
// Cloud Function para setar role
admin.auth().setCustomUserClaims(uid, { role: 'ADMIN' });
```

### 4. Validações Implementadas

- ✅ Validação de campos obrigatórios
- ✅ Validação de tipos de dados
- ✅ Validação de valores numéricos
- ✅ Prevenção de modificação de logs
- ✅ Controle de acesso baseado em roles

## 🚨 Checklist de Segurança

Antes de fazer deploy em produção:

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] `.env.local` está no `.gitignore`
- [ ] Firestore Rules foram implantadas no Firebase Console
- [ ] Custom claims foram configurados para usuários
- [ ] API Keys do Firebase estão com restrições no Firebase Console
- [ ] Backup automático do Firestore está configurado
- [ ] Monitoramento de segurança está ativo

## 📞 Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança, por favor NÃO abra uma issue pública. 
Entre em contato diretamente com a equipe de desenvolvimento.
