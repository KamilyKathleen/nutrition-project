# 🔄 ADAPTAÇÃO VERCEL - PLANO DE REFATORAÇÃO

## 🎯 **OBJETIVO: MongoDB Atlas + Vercel Serverless**

### **🔧 MUDANÇAS NECESSÁRIAS:**

#### **1️⃣ REMOVER BULL QUEUES:**

```typescript
// ❌ ATUAL (Não funciona no Vercel)
import Bull from 'bull';
const notificationQueue = Bull('notifications');

// ✅ NOVO (Vercel compatible)
import { sendEmailDirect } from './EmailService';
// Envio direto ou usar Vercel Cron Jobs
```

#### **2️⃣ SUBSTITUIR REDIS POR DATABASE:**

```typescript
// ❌ ATUAL
const cache = redis.get('key');

// ✅ NOVO  
const cache = await CacheModel.findOne({ key });
```

#### **3️⃣ CRON JOBS → VERCEL CRON:**

```typescript
// ❌ ATUAL (Background process)
setInterval(() => {
  processMetrics();
}, 60000);

// ✅ NOVO (Vercel Cron)
// /api/cron/metrics.ts
export default async function handler() {
  await processMetrics();
  return { success: true };
}
```

---

## 📂 **NOVA ESTRUTURA VERCEL:**

```
api/
├── auth/
│   ├── login.ts
│   ├── register.ts
│   └── forgot-password.ts
├── users/
│   ├── [id].ts
│   └── index.ts
├── patients/
│   ├── [id].ts
│   └── index.ts
├── cron/
│   ├── notifications.ts
│   └── metrics.ts
└── webhooks/
    └── email-status.ts
```

---

## ⏱️ **CRONOGRAMA DE ADAPTAÇÃO:**

### **Dia 1: Base**
- [ ] Criar estrutura `/api`
- [ ] Migrar rotas básicas (auth, users)
- [ ] Configurar MongoDB Atlas

### **Dia 2: Refatoração**  
- [ ] Remover Bull/Redis
- [ ] Adaptar NotificationService
- [ ] Implementar Vercel Cron

### **Dia 3: Deploy**
- [ ] Configurar vercel.json
- [ ] Deploy e testes
- [ ] Ajustes finais

---

## 🔧 **VERCEL.JSON CONFIGURAÇÃO:**

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/metrics", 
      "schedule": "0 * * * *"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

---

## 📧 **ADAPTAÇÃO DE EMAILS:**

```typescript
// ❌ ATUAL (Bull Queue)
await notificationQueue.add('send-email', {
  to: user.email,
  template: 'welcome'
});

// ✅ NOVO (Direto ou Vercel Cron)
// Opção 1: Envio direto
await EmailService.sendWelcome(user);

// Opção 2: Agendar via DB + Cron
await EmailQueue.create({
  to: user.email,
  template: 'welcome',
  scheduledFor: new Date()
});
```

---

## 📊 **MÉTRICAS SEM BACKGROUND:**

```typescript
// ❌ ATUAL (Background process)
class MetricService {
  startBackgroundCollection() {
    setInterval(this.collect, 60000);
  }
}

// ✅ NOVO (Event-driven)
class MetricService {
  static async recordOnRequest(req, res, next) {
    await this.record('api_request', {
      endpoint: req.path,
      method: req.method
    });
    next();
  }
}
```

---

## 🎯 **RESULTADO ESPERADO:**

✅ **MongoDB Atlas** (mesmo que antes)
✅ **Vercel Serverless** (gratuito)
✅ **Deploy automático** via Git
✅ **Edge performance** global
✅ **Escalabilidade** automática

**Custo:** **$0/mês** (planos gratuitos)

---

## ⚠️ **TRADE-OFFS:**

| Recurso | Antes | Depois |
|---------|--------|---------|
| **Queues** | Bull/Redis | Vercel Cron |
| **Background** | Persistente | Event-driven |
| **Cache** | Redis | MongoDB/Memory |
| **Complexidade** | Alta | Média |
| **Custo** | $5+/mês | $0/mês |
| **Latência** | Baixa | Baixa-Média |