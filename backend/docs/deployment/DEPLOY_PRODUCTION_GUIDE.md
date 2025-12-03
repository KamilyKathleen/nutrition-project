# 🚀 GUIA COMPLETO: DESENVOLVIMENTO → PRODUÇÃO

## � ÍNDICE
1. [Preparação do Código](#1-preparação-do-código)
2. [Banco de Dados (MongoDB)](#2-banco-de-dados-mongodb)
3. [Hospedagem do Backend](#3-hospedagem-do-backend)
4. [Configurações de Produção](#4-configurações-de-produção)
5. [Deploy e CI/CD](#5-deploy-e-cicd)
6. [Monitoramento](#6-monitoramento)

---

## 1️⃣ PREPARAÇÃO DO CÓDIGO

### ✅ Checklist Pré-Deploy:
- [ ] ✅ Todos os testes passando (`npm test`)
- [ ] ✅ Build sem erros (`npm run build`)
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Logs de produção implementados
- [ ] ✅ Rate limiting ativo
- [ ] ✅ CORS configurado
- [ ] ✅ Validações de entrada
- [ ] ✅ Tratamento de erros

### 🔧 Ajustes Necessários:
```bash
# 1. Instalar dependências de produção
npm ci --only=production

# 2. Build da aplicação
npm run build

# 3. Testar em ambiente similar à produção
NODE_ENV=production npm start
```

---

## 2️⃣ BANCO DE DADOS (MONGODB)

### 🌐 **OPÇÃO 1: MongoDB Atlas (Recomendado)**

**Vantagens:**
- ✅ Gerenciado pela MongoDB
- ✅ Backup automático
- ✅ Escalabilidade automática
- ✅ Monitoramento integrado
- ✅ Segurança avançada

**Passos:**
1. **Criar conta:** https://cloud.mongodb.com
2. **Criar cluster:**
   ```
   - Escolher região (ex: São Paulo - sa-east-1)
   - Tier: M0 (gratuito) ou M10+ (produção)
   - Configurar usuário e senha
   ```
3. **Configurar rede:**
   ```
   - Adicionar IPs permitidos (0.0.0.0/0 para qualquer IP)
   - Ou IPs específicos do servidor
   ```
4. **String de conexão:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nutrition_prod
   ```

### 🏠 **OPÇÃO 2: MongoDB Self-Hosted**

**Para VPS/Servidor próprio:**
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar serviço
sudo systemctl start mongod
sudo systemctl enable mongod

# Configurar segurança
sudo mongo
> use admin
> db.createUser({
    user: "admin",
    pwd: "senhaSegura123",
    roles: ["userAdminAnyDatabase", "readWriteAnyDatabase"]
  })
```

---

## 3️⃣ HOSPEDAGEM DO BACKEND

### 🚀 **OPÇÃO 1: Railway (Fácil e Rápido)**

**Por que Railway:**
- ✅ Deploy automático via Git
- ✅ Suporte nativo ao Node.js
- ✅ Variáveis de ambiente fáceis
- ✅ SSL automático
- ✅ $5/mês para começar

**Passos:**
1. **Conta:** https://railway.app
2. **Conectar repositório GitHub**
3. **Deploy automático:**
   ```bash
   # Railway detecta automaticamente Node.js
   # Usar o package.json existente
   ```

### 🌊 **OPÇÃO 2: Render (Gratuito para começar)**

**Vantagens:**
- ✅ Plano gratuito (com limitações)
- ✅ Deploy via Git
- ✅ SSL automático
- ✅ Monitoramento básico

**Configuração:**
```yaml
# render.yaml
services:
  - type: web
    name: nutrition-backend
    env: node
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /health
```

### ☁️ **OPÇÃO 3: DigitalOcean App Platform**

**Para mais controle:**
```yaml
name: nutrition-backend
services:
- name: api
  source_dir: /backend
  github:
    repo: KamilyKathleen/nutrition-project
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
```

### 🏗️ **OPÇÃO 4: VPS Tradicional (AWS/Azure/GCP)**

**Para máximo controle:**
```bash
# 1. Configurar servidor Ubuntu
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx

# 2. Configurar Node.js via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 3. Configurar PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# 4. Configurar Nginx
sudo nano /etc/nginx/sites-available/nutrition-api
```

---

## 4️⃣ CONFIGURAÇÕES DE PRODUÇÃO

### 🔧 Criar arquivo `.env.production`:

```bash
# 🔐 SEGURANÇA CRÍTICA
NODE_ENV=production
JWT_SECRET=gere_uma_chave_de_64_caracteres_super_segura_aqui_123456789
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# 🌐 SERVIDOR
PORT=3000
HOST=0.0.0.0
API_URL=https://sua-api-nutrition.railway.app
FRONTEND_URL=https://seu-nutrition-app.vercel.app

# 📊 MONGODB (Atlas)
MONGODB_URI=mongodb+srv://admin:suaSenha@cluster0.abc123.mongodb.net/nutrition_prod?retryWrites=true&w=majority
MONGODB_DB_NAME=nutrition_production

# 🔴 REDIS (Railway/Redis Cloud)
REDIS_URL=rediss://default:senha@redis-host:6379

# 📧 EMAIL (SendGrid)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=SG.sua_chave_sendgrid_aqui
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=Sistema de Nutrição

# 📈 MONITORAMENTO
LOG_LEVEL=warn
ENABLE_MORGAN_LOGGING=false

# 🔒 SEGURANÇA
CORS_ORIGINS=https://seu-nutrition-app.vercel.app
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_HOUR=1000

# ⚡ PERFORMANCE
ENABLE_COMPRESSION=true
MONGODB_CONNECTION_POOL_SIZE=10
```

### 🛠️ Arquivo `ecosystem.config.js` (PM2):

```javascript
module.exports = {
  apps: [{
    name: 'nutrition-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

---

## 5️⃣ DEPLOY E CI/CD

### 🔄 GitHub Actions (CI/CD Automático):

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build project
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Railway
      run: |
        curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
```

### 🚀 Script de Deploy Manual:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy para produção..."

# 1. Testes
echo "🧪 Executando testes..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Testes falharam! Deploy cancelado."
  exit 1
fi

# 2. Build
echo "🏗️ Building aplicação..."
npm run build

# 3. Deploy
echo "☁️ Fazendo deploy..."
git add .
git commit -m "Deploy: $(date)"
git push origin main

echo "✅ Deploy concluído!"
```

---

## 6️⃣ MONITORAMENTO

### 📊 **Ferramentas Essenciais:**

1. **Logs:**
   ```bash
   # Winston para logs estruturados
   npm install winston
   ```

2. **Uptime Monitoring:**
   - UptimeRobot (gratuito)
   - Pingdom

3. **Performance:**
   - New Relic
   - Sentry (erros)

4. **Health Check Endpoint:**
   ```typescript
   // /health
   app.get('/health', (req, res) => {
     res.json({
       status: 'OK',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       environment: process.env.NODE_ENV
     });
   });
   ```

---

## 🎯 PLANO DE AÇÃO RECOMENDADO:

### **Semana 1: Preparação**
1. ✅ Configurar MongoDB Atlas
2. ✅ Ajustar código para produção
3. ✅ Configurar variáveis de ambiente
4. ✅ Testes finais

### **Semana 2: Deploy**
1. 🚀 Deploy no Railway/Render
2. 📧 Configurar SendGrid
3. 🔴 Adicionar Redis
4. 📊 Monitoramento básico

### **Semana 3: Otimização**
1. 🎯 Performance tuning
2. 📈 Métricas avançadas
3. 🔒 Segurança adicional
4. 💾 Backup automático

---

## 💰 CUSTOS ESTIMADOS (MENSAL):

| Serviço | Custo | Observação |
|---------|--------|------------|
| **MongoDB Atlas** | $0-9 | M0 gratuito, M10 $9/mês |
| **Railway/Render** | $0-5 | Gratuito com limitações |
| **Redis** | $0-5 | Redis Cloud gratuito 30MB |
| **SendGrid** | $0-15 | 100 emails/dia grátis |
| **Domínio** | $10/ano | .com via Namecheap |
| **Total Inicial** | **$0-15/mês** | **Escala conforme uso** |

---

## 🚨 PRÓXIMOS PASSOS IMEDIATOS:

```bash
# 1. Configurar MongoDB Atlas AGORA
# 2. Criar conta Railway/Render
# 3. Ajustar variáveis de ambiente
# 4. Primeiro deploy de teste
```

**Quer que eu te ajude a implementar alguma dessas etapas específicas?** 🚀