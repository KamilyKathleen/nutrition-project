# 🚀 Deployment Files

Esta pasta contém arquivos específicos para deployment e configuração de produção.

## 📁 Estrutura

### `vercel-api/`
API routes adaptadas para deployment na Vercel, seguindo a estrutura de `api/` do Next.js.

### Arquivos de Configuração

- **`ecosystem.config.js`** - Configuração PM2 para deployment tradicional
- **`init-mongo.js`** - Script de inicialização do MongoDB
- **`vercel.json`** - Configuração específica da Vercel (na raiz do projeto)

## 🔧 Como Usar

### Deploy na Vercel
1. Configure as variáveis de ambiente
2. Use a estrutura em `vercel-api/`
3. Execute `vercel --prod`

### Deploy Tradicional (PM2)
1. Configure `ecosystem.config.js`
2. Execute `pm2 start ecosystem.config.js`

### Inicialização do MongoDB
```bash
node init-mongo.js
```

---

**Documentação completa**: [../docs/deployment/](../docs/deployment/)