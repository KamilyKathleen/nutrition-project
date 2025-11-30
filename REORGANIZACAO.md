# 📋 Reorganização da Estrutura do Projeto

## ✅ Mudanças Realizadas

### 🗂️ Arquivos Movidos

#### Raiz do Projeto → `/docs/`
- ✅ `FIREBASE_NOTIFICATIONS_README.md` → `docs/status/`
- ✅ `FIREBASE_CONFIG_STATUS.md` → `docs/status/`
- ✅ `HYBRID_AUTH_STATUS.md` → `docs/status/`
- ✅ `MUDANCAS_STATUS_PACIENTES.md` → `docs/status/`
- ✅ `DESENVOLVIMENTO_CONCLUIDO.md` → `docs/status/`
- ✅ `A3 - Nutrição.pdf` → `docs/dev/` (não vai para Git)
- ✅ `resumoAtt.txt` → `docs/dev/` (não vai para Git)

#### Raiz do Projeto → `/scripts/`
- ✅ `debug-auth.js` → `scripts/debug/` (não vai para Git)
- ✅ `test-auth-console.js` → `scripts/debug/` (não vai para Git)

#### Backend → `/backend/scripts/`
- ✅ `debug-joao.js` → `scripts/debug/`
- ✅ `cleanup-db.js` → `scripts/database/`
- ✅ `checkDietPlan.js` → `scripts/utilities/`
- ✅ `listPatientsAndPlans.js` → `scripts/utilities/`
- ✅ `fix-imports.sh` → `scripts/utilities/`
- ✅ `test-results-*.json` → `scripts/utilities/`

### 🗑️ Arquivos/Pastas Removidos
- ✅ `/app/test-firebase/` - Pasta de testes Firebase não necessária em produção

### 📝 Arquivos Criados
- ✅ `/docs/README.md` - Documentação da estrutura de docs
- ✅ `/scripts/README.md` - Documentação dos scripts da raiz
- ✅ `/backend/scripts/README.md` - Documentação dos scripts do backend
- ✅ `.gitignore` atualizado para ignorar pastas de desenvolvimento

## 🏗️ Nova Estrutura de Pastas

```
nutrition-project/
├── app/                          # Frontend Next.js
│   ├── components/              # Componentes React
│   ├── contexts/                # Contexts (Auth, etc)
│   ├── pages/                   # Páginas da aplicação
│   │   ├── blog/               # Blog (paciente e nutricionista)
│   │   ├── dashboard/          # Dashboard do nutricionista
│   │   ├── login/              # Login
│   │   └── register/           # Registro
│   └── services/               # Serviços de API
│
├── backend/                     # Backend Express + MongoDB
│   ├── src/                    # Código fonte
│   │   ├── config/            # Configurações
│   │   ├── controllers/       # Controllers
│   │   ├── middlewares/       # Middlewares
│   │   ├── models/            # Models Mongoose
│   │   ├── routes/            # Rotas
│   │   ├── services/          # Services
│   │   └── types/             # TypeScript types
│   ├── tests/                 # Testes automatizados
│   ├── scripts/               # Scripts utilitários
│   │   ├── debug/            # Scripts de debug (dev only)
│   │   ├── database/         # Scripts de banco de dados
│   │   └── utilities/        # Utilitários gerais
│   ├── docs/                  # Documentação do backend
│   └── deployment/            # Arquivos de deploy
│
├── docs/                       # Documentação do projeto
│   ├── status/                # Status de features
│   └── dev/                   # Docs de desenvolvimento (não commitados)
│
├── scripts/                    # Scripts da raiz
│   └── debug/                 # Scripts de debug (não commitados)
│
├── lib/                       # Bibliotecas compartilhadas
└── public/                    # Arquivos estáticos

```

## 🎯 Benefícios da Reorganização

### ✨ Organização
- ✅ Pastas bem definidas e com propósito claro
- ✅ Separação entre código de produção e desenvolvimento
- ✅ Documentação organizada por categoria

### 🔒 Segurança
- ✅ Arquivos sensíveis e de desenvolvimento não vão para o Git
- ✅ Scripts de debug isolados
- ✅ `.gitignore` atualizado

### 🚀 Produção
- ✅ Build mais limpo (sem arquivos desnecessários)
- ✅ Deploy mais rápido
- ✅ Redução do tamanho do bundle

### 👥 Colaboração
- ✅ Estrutura clara para novos desenvolvedores
- ✅ README em cada pasta importante
- ✅ Convenções de nomenclatura consistentes

## 📚 Guias de Uso

### Para Desenvolvimento
```bash
# Scripts de debug estão em /scripts/debug/
node scripts/debug/debug-auth.js

# Scripts do backend em /backend/scripts/
node backend/scripts/utilities/listPatientsAndPlans.js
```

### Para Documentação
- Status de features: `/docs/status/`
- Docs de desenvolvimento: `/docs/dev/` (local only)
- README de cada módulo nas respectivas pastas

### Para Deploy
```bash
# Build do frontend
cd app && npm run build

# Build do backend
cd backend && npm run build

# Apenas código de produção será incluído
```

## ⚠️ Importante

### Arquivos que NÃO vão para o Git:
- `/docs/dev/` - Documentos de desenvolvimento
- `/scripts/debug/` - Scripts de debug
- `*.pdf` - PDFs de documentação
- `test-results-*.json` - Resultados de testes
- `resumoAtt.txt` - Resumos de atualização

### Arquivos que SIM vão para o Git:
- `/docs/status/` - Status de implementações
- `/backend/scripts/database/` - Scripts de banco
- `/backend/scripts/utilities/` - Utilitários (exceto resultados de teste)
- Todos os READMEs

## 🔄 Próximos Passos

1. ✅ Revisar e atualizar READMEs principais
2. ⏳ Adicionar mais documentação nas pastas `/docs/status/`
3. ⏳ Criar scripts de automação em `/backend/scripts/utilities/`
4. ⏳ Documentar APIs no Swagger/OpenAPI
5. ⏳ Adicionar diagramas de arquitetura em `/docs/`

---

**Data da Reorganização:** 30 de novembro de 2025
**Status:** ✅ Concluída
