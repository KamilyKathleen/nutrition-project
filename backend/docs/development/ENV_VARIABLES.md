# 🔑 Configuração de Variáveis de Ambiente - Vercel

## 📍 ONDE CONFIGURAR:
1. **Dashboard Vercel:** https://vercel.com/dashboard
2. **Projeto:** `nutrition-backend-api`
3. **Settings → Environment Variables**
4. **Para cada variável:** Add New → Name/Value → Save

## ⚠️ OBRIGATÓRIAS (Sistema não funciona sem elas):

### 🗄️ **MONGODB_URI** (Obrigatória)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrition_db?retryWrites=true&w=majority
```
**Como obter:**
1. MongoDB Atlas → Clusters → Connect
2. Connect your application → Copy connection string
3. Substitua `<username>`, `<password>` e `<database>`

### 🔐 **JWT_SECRET** (Obrigatória)
```
JWT_SECRET=sua_chave_super_secreta_jwt_com_pelo_menos_32_caracteres
```
**Gerar chave:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 📧 EMAIL (Obrigatórias para recuperação de senha):

### **SMTP_HOST**
```
SMTP_HOST=smtp.gmail.com
```

### **SMTP_PORT**
```
SMTP_PORT=587
```

### **SMTP_USER**
```
SMTP_USER=seu_email@gmail.com
```

### **SMTP_PASS**
```
SMTP_PASS=sua_senha_de_app_gmail
```
**⚠️ Como obter senha de app Gmail:**
1. Google Account → Security → 2-Step Verification → App passwords
2. Generate app password → Copy code

### **FROM_EMAIL**
```
FROM_EMAIL=noreply@seu-dominio.com
```

## 🌐 FRONTEND (Obrigatória para reset de senha):

### **FRONTEND_URL**
```
FRONTEND_URL=https://seu-frontend.vercel.app
```

## 🔧 OPCIONAIS (Melhoram segurança/funcionalidade):

### **CORS_ORIGINS**
```
CORS_ORIGINS=https://seu-frontend.vercel.app,http://localhost:3000
```

### **SMTP_SECURE**
```
SMTP_SECURE=false
```

### **NODE_ENV**
```
NODE_ENV=production
```

## 📝 RESUMO - ORDEM DE PRIORIDADE:

### 🚨 **CRÍTICAS (App quebra sem elas):**
1. `MONGODB_URI`
2. `JWT_SECRET`

### ⚡ **IMPORTANTES (Funcionalidades específicas):**
3. `SMTP_HOST`
4. `SMTP_PORT`
5. `SMTP_USER`
6. `SMTP_PASS`
7. `FRONTEND_URL`

### 🔧 **OPCIONAIS (Melhorias):**
8. `FROM_EMAIL`
9. `CORS_ORIGINS`
10. `SMTP_SECURE`
11. `NODE_ENV`

## ✅ **EXEMPLO COMPLETO:**

```env
# 🗄️ Banco de Dados (OBRIGATÓRIO)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nutrition?retryWrites=true&w=majority

# 🔐 Autenticação (OBRIGATÓRIO)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# 📧 Email (PARA RESET DE SENHA)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=app@exemplo.com
SMTP_PASS=abcd1234efgh5678
FROM_EMAIL=noreply@exemplo.com

# 🌐 Frontend (PARA LINKS DE RESET)
FRONTEND_URL=https://nutrition-frontend.vercel.app

# 🔧 Configurações (OPCIONAIS)
CORS_ORIGINS=https://nutrition-frontend.vercel.app
SMTP_SECURE=false
NODE_ENV=production
```

## 🚀 **DEPOIS DE CONFIGURAR:**
1. ✅ Todas as variáveis no Vercel
2. ✅ Deploy automático será executado
3. ✅ Teste os endpoints
4. ✅ Frontend pode conectar na API