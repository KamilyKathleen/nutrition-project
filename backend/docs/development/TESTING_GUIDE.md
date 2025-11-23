# 🧪 Como Testar a API no Vercel

## 🔐 **PROBLEMA:** API protegida por autenticação Vercel

## ✅ **SOLUÇÕES:**

### **Opção 1 - Desabilitar Proteção (Recomendado para testes):**

1. **Dashboard Vercel:** https://vercel.com/dashboard
2. **Projeto:** nutrition-backend-api
3. **Settings → Deployment Protection**
4. **Disable Protection** temporariamente

### **Opção 2 - Testar Endpoints Específicos:**

Depois de desabilitar proteção, teste:

```bash
# Health Check
curl https://nutrition-backend-d004z7myi-ana-souzas-projects-43d2dfc4.vercel.app/api/health

# Registro de usuário
curl -X POST https://nutrition-backend-d004z7myi-ana-souzas-projects-43d2dfc4.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario", 
    "email": "teste@exemplo.com",
    "password": "123456",
    "role": "nutritionist"
  }'

# Login
curl -X POST https://nutrition-backend-d004z7myi-ana-souzas-projects-43d2dfc4.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "123456"
  }'
```

## 🎯 **STATUS ATUAL:**

✅ **MongoDB Atlas:** Conectado e funcionando
✅ **Variáveis Vercel:** Configuradas  
✅ **Deploy:** Realizado com sucesso
🔄 **Teste API:** Aguardando remoção da proteção

## 📋 **PRÓXIMOS PASSOS:**

1. 🔓 Desabilitar proteção Vercel
2. 🧪 Testar endpoints
3. 📧 Testar envio de email  
4. 🚀 Conectar frontend
5. 🔒 Reabilitar proteção