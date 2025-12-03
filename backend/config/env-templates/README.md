# 🔐 Environment Configuration Templates

Esta pasta contém templates de configuração de ambiente para diferentes cenários.

## 📁 Arquivos Disponíveis

### `.env.example`
Template básico para desenvolvimento local. Contém:
- Configurações básicas do servidor
- MongoDB local
- JWT e segurança
- Rate limiting
- Upload de arquivos

### `.env.production.example`
Template completo para produção. Inclui:
- Configurações de segurança avançadas
- Integração com Firebase
- Configurações de email (Nodemailer)
- Rate limiting de produção
- Logs e monitoramento
- Configurações de CORS e HTTPS

### `.env.docker.example`
Template para deployment com Docker. Contém:
- Configurações do MongoDB containerizado
- Mongo Express para administração
- Senhas e usuários para containers

## 🚀 Como Usar

### Para Desenvolvimento
```bash
cp config/env-templates/.env.example .env
# Edite o .env com suas configurações locais
```

### Para Produção
```bash
cp config/env-templates/.env.production.example .env.production
# Configure TODAS as variáveis antes do deploy
```

### Para Docker
```bash
cp config/env-templates/.env.docker.example .env.docker
# Ajuste senhas e configurações do Docker
```

## ⚠️ Importante

- **NUNCA** commite arquivos `.env` reais no Git
- **SEMPRE** mude senhas padrão em produção
- **CONFIGURE** Firebase Admin SDK com credenciais reais
- **GERE** JWT secrets únicos e seguros

## 🔧 Variáveis Críticas

### Obrigatórias para Produção
- `JWT_SECRET` - Chave JWT única (64+ caracteres)
- `MONGODB_URI` - String de conexão MongoDB
- `FIREBASE_*` - Credenciais Firebase Admin
- `EMAIL_*` - Configurações de email (se usar)

### Opcionais
- `REDIS_*` - Cache Redis
- `SENTRY_*` - Monitoramento de erros
- `UPLOAD_*` - Configurações de upload

---

**Documentação completa**: [../../docs/development/ENV_VARIABLES.md](../../docs/development/ENV_VARIABLES.md)