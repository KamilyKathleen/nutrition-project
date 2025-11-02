#!/bin/bash

echo "🍎 Nutrition Project - Setup do Backend"
echo "======================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Verificar se npm está disponível
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm encontrado: $NPM_VERSION"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado! Por favor, configure suas variáveis de ambiente."
else
    echo "✅ Arquivo .env já existe."
fi

# Verificar TypeScript
echo ""
echo "🔧 Verificando TypeScript..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript OK!"
else
    echo "⚠️  Avisos do TypeScript encontrados (normal durante desenvolvimento)"
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Configure o arquivo .env com suas credenciais do Firebase"
echo "2. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo "3. Acesse http://localhost:8000/health para verificar se está funcionando"
echo ""
echo "📚 Comandos disponíveis:"
echo "  npm run dev      - Servidor de desenvolvimento"
echo "  npm run build    - Build para produção"
echo "  npm start        - Servidor de produção"
echo "  npm test         - Executar testes"
echo "  npm run lint     - Verificar código"