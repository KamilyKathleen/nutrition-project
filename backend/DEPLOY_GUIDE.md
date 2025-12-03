# 🚀 Guia de Deploy - Backend no Vercel

## 📋 Pré-requisitos

### 1. MongoDB Atlas
- ✅ URI já configurada no `.env`: `mongodb+srv://nutrition-user:0ZcKwPVlFlIxWkEw@nutrition-cluster.9pwdwca.mongodb.net/?appName=nutrition-cluster`
- ⚠️ **AÇÃO NECESSÁRIA**: Adicionar IP `0.0.0.0/0` na whitelist do MongoDB Atlas (permite Vercel se conectar)

### 2. Conta Vercel
- Criar conta em [vercel.com](https://vercel.com)
- Instalar Vercel CLI: `npm i -g vercel`

## 📁 Arquivos Configurados

### ✅ Já preparados:
- `vercel.json` - Configuração do Vercel
- `api/index.ts` - Handler serverless
- `src/app.ts` - Express app adaptado para serverless
- `src/config/database.ts` - Conexão MongoDB com singleton pattern

## 🔧 Variáveis de Ambiente (Vercel)

Configure estas variáveis no painel do Vercel:

```bash
# Firebase
FIREBASE_PROJECT_ID=nutriplan-cce27
FIREBASE_PRIVATE_KEY_ID=4b4a0939b638e470bd71bf3fb3ede5850beec87e
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@nutriplan-cce27.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=103643145897764525825
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40nutriplan-cce27.iam.gserviceaccount.com

# Server
NODE_ENV=production
CLIENT_URL=https://seu-frontend.vercel.app

# MongoDB Atlas
MONGODB_URI=mongodb+srv://nutrition-user:0ZcKwPVlFlIxWkEw@nutrition-cluster.9pwdwca.mongodb.net/?appName=nutrition-cluster

# JWT
JWT_SECRET=2d1623683e3b734caaf8a166cd0ef868556ea66858d1c6885ced64f25a9d26f8fecc57c20dc9025b33501d2a8dacd3c693d649b87c96192a69a3bf54922e2b
JWT_EXPIRES_IN=7d

# Email (ProtonMail)
SMTP_HOST=mail.protonmail.ch
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=nutriplan.noreply@protonmail.com
SMTP_PASS=W0lJIlxISgc6SFUc
FROM_EMAIL=Sistema NutriPlan <nutriplan.noreply@protonmail.com>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=10485760
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

## 🚀 Deploy

### Método 1: Via CLI (Recomendado)

```bash
# Na pasta backend
cd backend

# Login no Vercel
vercel login

# Deploy de teste
vercel

# Deploy em produção
vercel --prod
```

### Método 2: Via GitHub

1. Push do código para GitHub
2. Importar projeto no painel Vercel
3. Configurar variáveis de ambiente
4. Deploy automático!

## 🧪 Testar Deploy

Após o deploy, testar:

```bash
# Health check
curl https://seu-backend.vercel.app/api/health

# Login
curl -X POST https://seu-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"senha123"}'
```

## ⚙️ Configurações Importantes

### MongoDB Atlas - Whitelist IP
1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Vá em Network Access
3. Adicione IP: `0.0.0.0/0` (permite todos - necessário para Vercel)
4. Ou adicione IPs específicos do Vercel (mais seguro)

### Vercel - Configurações do Projeto
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `backend`

## 📊 Monitoramento

Após deploy, monitore:
- Logs no painel Vercel
- Uso de bandwidth
- Tempo de execução das functions
- Erros de conexão com MongoDB

## 🔒 Segurança

### ✅ Já implementado:
- CORS configurado
- Helmet.js para headers de segurança
- Rate limiting
- JWT authentication
- Variáveis de ambiente seguras

### ⚠️ Recomendações:
- Trocar JWT_SECRET em produção
- Configurar domínio customizado
- Habilitar SSL (Vercel faz automaticamente)
- Revisar CORS origins para produção

## 🐛 Troubleshooting

### Erro: "Cannot connect to MongoDB"
- Verificar whitelist de IPs no Atlas
- Confirmar MONGODB_URI está correta
- Verificar senha e usuário

### Erro: "Function timeout"
- Aumentar `maxDuration` no `vercel.json`
- Otimizar queries do MongoDB
- Adicionar índices nas collections

### Erro: "Module not found"
- Rodar `npm run build` localmente
- Verificar `tsconfig.json`
- Limpar cache: `vercel --force`

## 📝 Próximos Passos

1. ✅ Deploy backend
2. ⏳ Configurar domínio customizado
3. ⏳ Deploy frontend
4. ⏳ Conectar frontend ao backend
5. ⏳ Testar sistema completo
6. ⏳ Configurar CI/CD com GitHub Actions

---

**Status**: ✅ Pronto para Deploy  
**Plataforma**: Vercel Serverless  
**Database**: MongoDB Atlas  
**Estimativa**: 5-10 minutos para primeiro deploy
