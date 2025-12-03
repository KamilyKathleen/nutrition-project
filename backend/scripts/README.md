# 🛠️ Scripts do Backend

## Estrutura de Pastas

### `/scripts/debug/`
Scripts de debug (desenvolvimento):
- `debug-joao.js` - Debug específico para testes

### `/scripts/database/`
Scripts de gerenciamento do banco de dados:
- `cleanup-db.js` - Limpeza e manutenção do MongoDB
- `init-mongo.js` - Script de inicialização do MongoDB (usado no Docker)

### `/scripts/utilities/`
Utilitários e ferramentas:
- `checkDietPlan.js` - Verificar planos alimentares no banco
- `listPatientsAndPlans.js` - Listar pacientes e seus planos
- `fix-imports.sh` - Corrigir imports TypeScript
- `test-results-*.json` - Resultados de execução de testes

### `/scripts/clearFirebase.js` & `/scripts/clearFirebaseSimple.js`
Scripts para limpar dados do Firebase (desenvolvimento)

## Como Usar

### Inicialização do MongoDB
```bash
# O init-mongo.js é executado automaticamente pelo Docker
docker-compose up -d
```

### Limpeza do Banco
```bash
node scripts/database/cleanup-db.js
```

### Verificar Dados
```bash
node scripts/utilities/listPatientsAndPlans.js
node scripts/utilities/checkDietPlan.js
```

## ⚠️ Importante
- Scripts de debug não vão para produção
- Sempre faça backup antes de executar scripts de limpeza
- Os scripts de teste estão na pasta `/tests`
