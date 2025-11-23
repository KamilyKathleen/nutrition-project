# 🚀 Guia de Deploy da API Nutrition

## ✅ Deploy Realizado com Sucesso!

**URL da API:** https://nutrition-backend-d004z7myi-ana-souzas-projects-43d2dfc4.vercel.app

## ⚠️ Adaptações para Plano Gratuito

- **Limite de 12 funções:** Removidos endpoints de métricas e cron jobs
- **Sem cron jobs automáticos:** Funcionalidades de background removidas
- **Endpoints mantidos:** Auth, Users, Patients, Diet Plans, Consultations, Notifications, Health

## 🔑 Configuração de Variáveis de Ambiente

### 1. MongoDB Connection String

**ONDE COLOCAR:** Dashboard do Vercel → Settings → Environment Variables

**Passo a passo:**
1. Acesse: https://vercel.com/dashboard
2. Encontre o projeto: `nutrition-backend-api`
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Configure:
   - **Name:** `MONGODB_URI`
   - **Value:** `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
   - **Environment:** Production, Preview, and Development

### 2. Outras Variáveis Necessárias

```env
JWT_SECRET=sua_chave_secreta_jwt_muito_forte_aqui
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app_gmail
FRONTEND_URL=https://seu-frontend.vercel.app
```

## 📡 Endpoints Disponíveis

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/forgot-password` - Recuperar senha
- `POST /api/auth/reset-password` - Redefinir senha

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Criar paciente
- `GET /api/patients/:id` - Buscar paciente
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Deletar paciente

### Planos Alimentares
- `GET /api/diet-plans` - Listar planos
- `POST /api/diet-plans` - Criar plano
- `GET /api/diet-plans/:id` - Buscar plano
- `PUT /api/diet-plans/:id` - Atualizar plano
- `DELETE /api/diet-plans/:id` - Deletar plano

### Consultas
- `GET /api/consultations` - Listar consultas
- `POST /api/consultations` - Criar consulta
- `GET /api/consultations/:id` - Buscar consulta
- `PUT /api/consultations/:id` - Atualizar consulta
- `DELETE /api/consultations/:id` - Deletar consulta

### Notificações
- `GET /api/notifications` - Listar notificações
- `POST /api/notifications` - Criar notificação
- `PUT /api/notifications/:id/read` - Marcar como lida

### Métricas
- `GET /api/metrics/dashboard` - Dashboard de métricas
- `GET /api/metrics/reports` - Relatórios
- `POST /api/metrics/export` - Exportar Excel

### Sistema
- `GET /api/health` - Status da API

## ⏰ Cron Jobs Configurados

- **Notificações:** Diário às 09:00
- **Métricas:** Diário às 18:00  
- **Limpeza:** Diário às 03:00

## 🔧 Comandos de Deploy

```bash
# Deploy de produção
npx vercel --prod

# Deploy de preview
npx vercel

# Ver logs
vercel logs <deployment-url>

# Ver projetos
vercel list
```

## 📊 Próximos Passos

1. ✅ **Deploy realizado**
2. 🔄 **Configurar variáveis de ambiente**
3. 🔄 **Testar endpoints**
4. 🔄 **Conectar frontend**
5. 🔄 **Configurar domínio personalizado**

## 🚨 Importante

- A API está protegida por autenticação Vercel em produção
- Use o dashboard para gerenciar variáveis de ambiente
- Nunca commite strings de conexão no código
- Os cron jobs estão limitados ao plano gratuito (1x por dia)

## 📞 Suporte

Se houver problemas, verifique:
1. Variáveis de ambiente configuradas
2. MongoDB Atlas com IPs liberados
3. Logs do Vercel para erros