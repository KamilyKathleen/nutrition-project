# 🔧 Environment Configuration Guide

Esta pasta centraliza todas as configurações de ambiente do projeto.

## 📁 Estrutura

```
config/
├── env-templates/          # Templates de configuração
│   ├── .env.example       # Desenvolvimento básico
│   ├── .env.production.example  # Produção completa
│   └── .env.docker.example      # Docker/containers
└── README.md              # Este arquivo
```

## 🚀 Configuração Rápida

### 1. Desenvolvimento Local
```bash
# Copie o template básico
cp config/env-templates/.env.example .env

# Edite conforme necessário
nano .env
```

### 2. Deploy em Produção
```bash
# Use o template de produção
cp config/env-templates/.env.production.example .env.production

# Configure TODAS as variáveis críticas
# - JWT_SECRET (64+ caracteres únicos)
# - MONGODB_URI (string de conexão real)
# - FIREBASE_* (credenciais reais se usar)
```

### 3. Docker Development
```bash
# Para desenvolvimento com Docker
cp config/env-templates/.env.docker.example .env.docker

# Ajuste senhas e configurações
```

## ⚠️ Segurança

### Nunca Faça
❌ Commit arquivos `.env` reais  
❌ Use senhas padrão em produção  
❌ Compartilhe credenciais em texto  
❌ Deixe JWT_SECRET simples  

### Sempre Faça  
✅ Use senhas fortes únicas  
✅ Configure Firebase corretamente  
✅ Teste configurações antes do deploy  
✅ Mantenha backup seguro das credenciais  

## 🔑 Variáveis Críticas

| Variável | Desenvolvimento | Produção | Obrigatório |
|----------|----------------|----------|-------------|  
| `NODE_ENV` | development | production | ✅ |
| `JWT_SECRET` | qualquer | 64+ chars únicos | ✅ |
| `MONGODB_URI` | local | Atlas/cloud | ✅ |
| `FIREBASE_*` | opcional | real credentials | ⚠️ |
| `EMAIL_*` | opcional | real service | ⚠️ |

## 📚 Documentação

- **Detalhes técnicos**: [../docs/development/ENV_VARIABLES.md](../docs/development/ENV_VARIABLES.md)
- **Deploy guides**: [../docs/deployment/](../docs/deployment/)
- **Segurança**: [../docs/security/](../docs/security/)

---

**Última atualização**: 20 de novembro de 2025