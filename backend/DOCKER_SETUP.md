# 🐳 Docker Setup - Nutrition Project

## 🚨 **IMPORTANTE - SEGURANÇA**

**NUNCA commite senhas no código!** Este projeto agora usa variáveis de ambiente para proteger credenciais.

## 📋 **Setup Inicial**

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.docker.example .env.docker

# Editar e alterar TODAS as senhas
nano .env.docker
```

### 2. Alterar Senhas Obrigatoriamente

No arquivo `.env.docker`, mude:
- `MONGO_INITDB_ROOT_PASSWORD` - Senha do MongoDB
- `ME_CONFIG_BASICAUTH_PASSWORD` - Senha do Mongo Express

⚠️ **Use senhas fortes e únicas!**

### 3. Iniciar Containers

```bash
# Subir containers
docker-compose up -d

# Verificar status
docker-compose ps
```

## 🔗 **Acessos**

- **MongoDB**: `localhost:27017`
- **Mongo Express**: `http://localhost:8081`

## 🔒 **Segurança**

- ✅ Senhas em variáveis de ambiente
- ✅ Arquivo `.env.docker` no `.gitignore`
- ✅ Exemplo público sem credenciais reais
- ✅ Volumes persistentes para dados

## 🗑️ **Limpeza**

```bash
# Parar containers
docker-compose down

# Remover volumes (APAGA DADOS!)
docker-compose down -v
```

## 🔄 **Rotação de Senhas**

1. Altere senhas no `.env.docker`
2. Recrie containers: `docker-compose up -d --force-recreate`