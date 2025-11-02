#!/bin/bash

echo "🍃 MongoDB Setup para Nutrition Project"
echo "======================================="

# Verificar se MongoDB está instalado
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB não encontrado."
    echo "📥 Instalando MongoDB..."
    
    # Ubuntu/Debian
    if command -v apt &> /dev/null; then
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
    
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y mongodb-org
    
    # macOS
    elif command -v brew &> /dev/null; then
        brew tap mongodb/brew
        brew install mongodb-community
    
    else
        echo "❌ Sistema operacional não suportado para instalação automática."
        echo "Por favor, instale o MongoDB manualmente: https://docs.mongodb.com/manual/installation/"
        exit 1
    fi
fi

# Verificar se MongoDB está rodando
if ! pgrep -x "mongod" > /dev/null; then
    echo "🚀 Iniciando MongoDB..."
    
    # Tentar iniciar o serviço
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mongod
        sudo systemctl enable mongod
    elif command -v brew &> /dev/null; then
        brew services start mongodb/brew/mongodb-community
    else
        # Iniciar manualmente
        mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log
    fi
    
    sleep 3
fi

# Verificar conexão
echo "🔍 Verificando conexão com MongoDB..."
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB está rodando!"
else
    echo "❌ Erro ao conectar ao MongoDB."
    exit 1
fi

# Criar banco de dados e usuário (opcional)
echo "🗄️  Configurando banco de dados..."
mongosh nutrition-project --eval "
  db.createUser({
    user: 'nutrition_user',
    pwd: 'nutrition_password',
    roles: [
      { role: 'readWrite', db: 'nutrition-project' },
      { role: 'readWrite', db: 'nutrition-project-test' }
    ]
  })
" 2>/dev/null || echo "ℹ️  Usuário já existe ou não foi possível criar."

echo ""
echo "🎉 MongoDB configurado com sucesso!"
echo ""
echo "📊 Informações da conexão:"
echo "  URI: mongodb://localhost:27017/nutrition-project"
echo "  URI Teste: mongodb://localhost:27017/nutrition-project-test"
echo ""
echo "🛠️  Comandos úteis:"
echo "  mongosh                    - Conectar ao MongoDB shell"
echo "  mongosh nutrition-project  - Conectar ao banco do projeto"
echo "  show dbs                   - Listar bancos de dados"
echo "  use nutrition-project      - Usar banco do projeto"
echo "  show collections           - Listar coleções"