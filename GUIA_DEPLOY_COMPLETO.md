# 🚀 GUIA COMPLETO DE DEPLOY - Sistema Nutrição

## ✅ TODOS OS ERROS CORRIGIDOS!

### Erros que foram resolvidos:
1. ✅ Import paths dos services (PlanView.tsx, PendingInvites.tsx)
2. ✅ Tipos TypeScript do singleton MongoDB
3. ✅ Build do backend compilando sem erros
4. ✅ Estrutura Vercel serverless configurada

---

## 📋 PARTE 1: DEPLOY DO BACKEND (Vercel)

### Passo 1: Preparar MongoDB Atlas

1. **Acesse**: https://cloud.mongodb.com
2. **Login** com sua conta
3. **Network Access** (menu lateral):
   - Click em "Add IP Address"
   - Escolha "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`
   - Click "Confirm"
   
4. **Verifique a conexão** (seu URI já está no .env):
   ```
   mongodb+srv://nutrition-user:0ZcKwPVlFlIxWkEw@nutrition-cluster.9pwdwca.mongodb.net/?appName=nutrition-cluster
   ```

### Passo 2: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 3: Deploy do Backend

```bash
# Entre na pasta do backend
cd /home/anasouza/Documentos/Programacao/nutrition-project/backend

# Login no Vercel
vercel login
# Siga as instruções no navegador

# Deploy de teste (preview)
vercel

# Responda às perguntas:
# - Set up and deploy? Yes
# - Which scope? Escolha sua conta
# - Link to existing project? No
# - Project name? nutrition-backend (ou outro nome)
# - In which directory? ./ (deixe vazio, já está na pasta certa)
# - Override settings? No
```

### Passo 4: Configurar Variáveis de Ambiente no Vercel

Após o primeiro deploy, vá para o painel do Vercel:

1. **Acesse**: https://vercel.com/dashboard
2. **Selecione** seu projeto `nutrition-backend`
3. **Settings** → **Environment Variables**
4. **Adicione TODAS estas variáveis**:

```bash
# Firebase Backend
FIREBASE_PROJECT_ID=nutriplan-cce27
FIREBASE_PRIVATE_KEY_ID=4b4a0939b638e470bd71bf3fb3ede5850beec87e
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@nutriplan-cce27.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=103643145897764525825
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40nutriplan-cce27.iam.gserviceaccount.com

# FIREBASE_PRIVATE_KEY (ATENÇÃO: copie COM as quebras de linha \n)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQChtG9JZiE2J565
JEMg/4H2hLaGW9PxfiGw962oan58hpLJgpedRi0xTllWRYU+9zxtxFQRLzOxpPcP
Ln76WkAiey9sFUTxJ82VYgynvyby2wjKts8dCyDv1FsCdAjRoIWk39SemgwPL26q
U9qKk30ySyCOFu/0DtzC2+gPoC9MFJSSeRr+492jHhLxOcz0PXGR1g0rpE0Zngrt
ZAeFHKxvDGphvZxcNwBFMejkMTyAbozzZt3Gg/gY3uwoG2j8pJlaBNTmcQ97xiux
k9RnNmxrdaxFsmGL9qbupiiE6kvPzl5m2ftBaG+rhkq+Mec9ZbiFavVsEELfders
rYdrgSglAgMBAAECggEACx/mBWoDSuh64PMqXcYg43F0j9XCxPsPx6RNIX2sv1W6
xNDj1qwR8THEr6IPbVTbpr7k/FxU9W8LQtNzZOHPRmVXI9vAEcnSjj5f7y0VZDZx
amYdOuWdxHdwM2usLPpwIfb2zQUoDeYOJPr+g/Nq9N96Q+GMFyxBP8lFM8iqDapu
CFD5uYP6szSN1LOtHTPKi6mCW0YQSML+msfRYgFQpSoC4EEE6pXVcmAwSrhduu/8
iwCvO/7EM+CDx7THbVCl3VJughyB6TZ5iyXA+J32Hbxs8YH5oQSNq9p4U1qs02E+
n2QIkG7TJlj2xTrU9Ab1TZXeKiNhleR2J+LYAEjpAQKBgQDdfxnBx9EZNHZwHh82
CJtzpdSemXx9cFSfDbR0u8XPxnYDthRnMN7OBEpPD1uPIwL1jU7O/7L+wh9zpbWd
gnoslA6FZkfly+ZNfM8oxuycNhc7i483x6SfsPo7ORfYUxYIhKz19n22N4tokMqR
XQr2kBO4TaMk09TZViOAxxISIQKBgQC65PH9IPIzk8Fa6ITQySKXyaHGuVjugKLA
rWSdeJjXN+ZOd6goNUuNM9QH5Ow2R++TmF5pvJiPzlKf+j8VIkRJiKlKDotGz9ag
c5GGNM75+j/kaOP1s1BmOpjz0R8X4TdBq/iPFspFLX3A7nBVhlhV0br1MqCwWcsB
0kpJsRAdhQKBgGI0VTYuos3bDdwd7talME8xKjj7ck+ne01d5TGQg17g7jgtBZTO
/So4ir3M4FpxOoGmmld61WDQruM2iHSCgiq7pkiNFbmUEtMuUCcTM5r6/IgBE4m2
sY3ACOIzKRhXlkBGmu0e0ZP1wpClCbszloXFUYj4mynb5dZKs8kH+kIhAoGARx0g
ewnTPw7kztuU1gECmbEOTphuH2pxA1G27DhcJ+BMUOU05f/JfLQQ5OQVgV4D6ixb
GG67ulRumhLVeAwu4bAPgm9gTZR9/VWcNO3ZJ8MyFo5W10HgwNVhJ70V0LdQmDuA
e6nXU1VI+WWA9voEmLsSIYSfIhs4pLvIqpumHyUCgYEAid0H3j0V7WnAJIOHda3x
8LeL08KuJkeIr/jPbe9V6Rl4Z5bC6QWlAOJJsiDvPoJ/1mWkvsELkbF0g/bFp7AJ
M0D2n+p4hdzmcONEX66IUNrk/DZd9Fz/3NJsH8cn+wIhawQXcPPWqjS+b0cD1av8
2QYuXe2/JEaxyKhDnaqYtH0=
-----END PRIVATE KEY-----"

# MongoDB Atlas
MONGODB_URI=mongodb+srv://nutrition-user:0ZcKwPVlFlIxWkEw@nutrition-cluster.9pwdwca.mongodb.net/?appName=nutrition-cluster

# JWT
JWT_SECRET=2d1623683e3b734caaf8a166cd0ef868556ea66858d1c6885ced64f25a9d26f8fecc57c20dc9025b33501d2a8dacd3c693d649b87c96192a69a3bf54922e2b
JWT_EXPIRES_IN=7d

# Email ProtonMail
SMTP_HOST=mail.protonmail.ch
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=nutriplan.noreply@protonmail.com
SMTP_PASS=W0lJIlxISgc6SFUc
FROM_EMAIL=Sistema NutriPlan <nutriplan.noreply@protonmail.com>

# Server Config
NODE_ENV=production
CLIENT_URL=https://SEU-FRONTEND.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=10485760
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

⚠️ **IMPORTANTE**: 
- Para `FIREBASE_PRIVATE_KEY`, cole TODO o conteúdo incluindo `-----BEGIN` e `-----END`
- O `CLIENT_URL` precisa ser atualizado depois que você fizer deploy do frontend

### Passo 5: Deploy em Produção

Depois de configurar as variáveis:

```bash
# Ainda na pasta backend
vercel --prod
```

🎉 **Seu backend está no ar!** Anote a URL (ex: `https://nutrition-backend.vercel.app`)

### Passo 6: Testar o Backend

```bash
# Health check
curl https://SEU-BACKEND.vercel.app/api/health

# Deve retornar algo como:
# {"status":"ok","timestamp":"2025-11-30T..."}
```

---

## 📋 PARTE 2: DEPLOY DO FRONTEND (Vercel)

### Passo 1: Atualizar Variáveis de Ambiente

No arquivo `.env.local` do frontend, atualize:

```bash
# Firebase (mantém o mesmo)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAntjb33qcT3npeTn0nytftfJhv5ONbyQs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutriplan-cce27.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutriplan-cce27
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutriplan-cce27.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=80744976918
NEXT_PUBLIC_FIREBASE_APP_ID=1:80744976918:web:cf5aa2f33d1492a7491b37

# Backend API - ATUALIZE COM A URL DO SEU BACKEND
NEXT_PUBLIC_API_URL=https://SEU-BACKEND.vercel.app/api

# Environment
NEXT_PUBLIC_ENV=production
NODE_ENV=production
```

### Passo 2: Deploy do Frontend

```bash
# Entre na pasta raiz do projeto (onde está o frontend)
cd /home/anasouza/Documentos/Programacao/nutrition-project

# Deploy
vercel

# Responda:
# - Set up and deploy? Yes
# - Which scope? Escolha sua conta
# - Link to existing project? No
# - Project name? nutrition-frontend (ou outro nome)
# - In which directory? ./ 
# - Override settings? No
```

### Passo 3: Configurar Variáveis no Painel Vercel

1. Vá para https://vercel.com/dashboard
2. Selecione o projeto `nutrition-frontend`
3. Settings → Environment Variables
4. Adicione:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAntjb33qcT3npeTn0nytftfJhv5ONbyQs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nutriplan-cce27.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nutriplan-cce27
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nutriplan-cce27.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=80744976918
NEXT_PUBLIC_FIREBASE_APP_ID=1:80744976918:web:cf5aa2f33d1492a7491b37
NEXT_PUBLIC_API_URL=https://SEU-BACKEND.vercel.app/api
NEXT_PUBLIC_ENV=production
```

### Passo 4: Deploy em Produção

```bash
vercel --prod
```

🎉 **Frontend no ar!** Anote a URL (ex: `https://nutrition-frontend.vercel.app`)

### Passo 5: ATUALIZAR CLIENT_URL no Backend

**MUITO IMPORTANTE!** Volte no painel do backend:

1. https://vercel.com/dashboard
2. Selecione `nutrition-backend`
3. Settings → Environment Variables
4. **Edite** a variável `CLIENT_URL`
5. Mude para: `https://SEU-FRONTEND.vercel.app`
6. **Salve** e faça **Redeploy**:
   - Vá em Deployments
   - Click nos 3 pontinhos do último deploy
   - "Redeploy"

---

## ✅ CHECKLIST FINAL

### Backend:
- [ ] MongoDB Atlas com IP `0.0.0.0/0` na whitelist
- [ ] Vercel CLI instalado (`npm install -g vercel`)
- [ ] Deploy feito (`vercel --prod`)
- [ ] Todas as variáveis configuradas no painel
- [ ] Health check funcionando (`/api/health`)

### Frontend:
- [ ] `.env.local` atualizado com URL do backend
- [ ] Deploy feito (`vercel --prod`)
- [ ] Variáveis configuradas no painel
- [ ] Site abrindo no navegador

### Integração:
- [ ] `CLIENT_URL` do backend atualizado com URL do frontend
- [ ] Backend redeployado após atualizar `CLIENT_URL`
- [ ] Login funcionando
- [ ] Dashboard carregando dados

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### Erro: "Cannot connect to MongoDB"
**Solução**: Verifique se adicionou `0.0.0.0/0` no MongoDB Atlas

### Erro: "CORS blocked"
**Solução**: 
1. Verifique se `CLIENT_URL` está correto no backend
2. Faça redeploy do backend

### Erro: "API request failed"
**Solução**: 
1. Verifique se `NEXT_PUBLIC_API_URL` está correto no frontend
2. Teste o backend diretamente: `curl https://seu-backend.vercel.app/api/health`

### Erro: "Firebase not initialized"
**Solução**: Verifique se todas as variáveis `NEXT_PUBLIC_FIREBASE_*` estão configuradas

---

## 🎯 URLs Finais

Após completar tudo, você terá:

- **Backend**: `https://nutrition-backend.vercel.app`
- **Frontend**: `https://nutrition-frontend.vercel.app`
- **MongoDB**: `mongodb+srv://nutrition-cluster.9pwdwca.mongodb.net`

---

## 📞 Comandos Rápidos

```bash
# Verificar status do backend
curl https://SEU-BACKEND.vercel.app/api/health

# Ver logs do Vercel
vercel logs

# Forçar novo deploy
vercel --prod --force

# Ver lista de projetos
vercel list
```

---

**🎉 PRONTO! Seu sistema está em produção!**

Qualquer dúvida, consulte:
- Painel Vercel: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Documentação Vercel: https://vercel.com/docs
