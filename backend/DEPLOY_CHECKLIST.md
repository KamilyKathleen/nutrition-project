# Backend Deploy - Checklist de Produção

## ✅ Configurações Concluídas

### 1. Estrutura Vercel
- ✅ `/api/index.ts` - Handler serverless criado
- ✅ `vercel.json` - Configuração atualizada para Vercel
- ✅ `@vercel/node` instalado

### 2. MongoDB
- ✅ Conexão singleton para serverless (evita múltiplas conexões)
- ✅ MongoDB Atlas URI no `.env` 
- ✅ Pattern de cache global implementado

### 3. TypeScript Build
- ✅ `tsconfig.json` atualizado (exclui testes)
- ✅ Build funcionando sem erros
- ✅ Tipos globais para Vercel criados

### 4. Arquivos de Ambiente
- ✅ `.env` - Desenvolvimento
- ✅ `.env.production` - Produção (template)

## 📋 Próximos Passos para Deploy

### Passo 1: MongoDB Atlas - Whitelist IPs
1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Network Access → Add IP Address
3. Adicione: `0.0.0.0/0` (permite Vercel)

### Passo 2: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 3: Deploy Backend
```bash
cd backend
vercel login
vercel
```

### Passo 4: Configurar Variáveis no Vercel
No painel do Vercel, adicione todas as variáveis do `.env.production`:
- Firebase credentials
- MongoDB Atlas URI
- JWT Secret
- SMTP configs
- CLIENT_URL (URL do frontend quando estiver no ar)

### Passo 5: Deploy em Produção
```bash
vercel --prod
```

## 🎯 URL Esperada
Após deploy: `https://seu-projeto-backend.vercel.app`

## 🧪 Testar Após Deploy
```bash
# Health check
curl https://seu-backend.vercel.app/api/health

# Documentação
https://seu-backend.vercel.app/api/docs
```

## ⚠️ Importante
- Atualize `CLIENT_URL` no Vercel com a URL do frontend
- Troque JWT_SECRET em produção
- Configure CORS para apontar apenas para seu frontend

---

**Status**: ✅ Backend pronto para deploy no Vercel  
**Próximo**: Configurar frontend para apontar para backend em produção
