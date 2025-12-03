# 🏗️ Arquitetura do Sistema - Nutrition Project

## 📋 Visão Geral

O sistema de nutrição é uma aplicação full-stack construída com:
- **Frontend**: Next.js + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: MongoDB + Mongoose
- **Autenticação**: JWT
- **Deploy**: Vercel (Frontend + Backend)

## 🔧 Arquitetura Backend

### Padrão MVC (Model-View-Controller)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │────│   Routes/API    │────│   Controllers   │
│   (Next.js)     │    │   (Express)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Middlewares   │    │    Services     │
                       │  (Auth, Valid)  │    │  (Business)     │
                       └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │    MongoDB      │
                                               │   (Mongoose)    │
                                               └─────────────────┘
```

### 📁 Estrutura de Camadas

#### 1. **Routes Layer** (`/routes`)
- Define endpoints da API
- Aplica middlewares específicos
- Validação de entrada
- Rate limiting

#### 2. **Controllers Layer** (`/controllers`)
- Lógica de controle de requisições
- Processamento de entrada/saída
- Orquestração de serviços
- Tratamento de erros

#### 3. **Services Layer** (`/services`)
- Lógica de negócio
- Interação com banco de dados
- Processamento de dados
- Integrações externas

#### 4. **Middlewares Layer** (`/middlewares`)
- Autenticação e autorização
- Validação de dados
- Rate limiting
- Tratamento de erros
- Logging

#### 5. **Models/Types Layer** (`/types`)
- Definição de interfaces
- Tipos TypeScript
- Validações de schema

## 🔐 Fluxo de Autenticação

```
1. Usuario → Login (email/senha)
2. Backend → Valida credenciais
3. Backend → Gera JWT token
4. Frontend → Armazena token
5. Frontend → Envia token em requests (Bearer)
6. Backend → Valida token em middleware
7. Backend → Libera acesso aos recursos
```

### Níveis de Acesso:
- **Admin**: Acesso total
- **Nutritionist**: Gerenciar pacientes e planos nutricionais
- **Student**: Gerenciar próprios pacientes

## 📊 Modelo de Dados

### Principais Entidades:

```typescript
User {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  role: 'student' | 'nutritionist' | 'admin'
  isActive: boolean
}

Patient {
  id: string
  name: string
  studentId: string (FK)
  birthDate: Date
  gender: Gender
  medicalHistory: string
}

NutritionalAssessment {
  id: string
  patientId: string (FK)
  studentId: string (FK)
  anthropometricData: Object
  foodRecord: Object
  physicalActivity: Object
}

DietPlan {
  id: string
  patientId: string (FK)
  studentId: string (FK)
  targetCalories: number
  meals: Array<Meal>
}
```

### Relacionamentos:
- User (1) → (N) Patient
- Patient (1) → (N) NutritionalAssessment
- Patient (1) → (N) DietPlan
- Patient (1) → (N) Consultation

## 🛡️ Segurança

### Implementações:
1. **Autenticação JWT**
   - Tokens com expiração
   - Refresh token pattern

2. **Autorização RBAC**
   - Role-Based Access Control
   - Middleware de verificação

3. **Validação de Dados**
   - Joi schemas
   - Sanitização de entrada

4. **Rate Limiting**
   - 100 req/15min geral
   - 5 req/15min para login

5. **Segurança HTTP**
   - Helmet headers
   - CORS configurado
   - HTTPS obrigatório

## 🚀 Performance

### Otimizações:
1. **Paginação**
   - Limit/offset padrão: 20
   - Máximo: 100 registros

2. **Indexação**
   - Índices compostos no Firestore
   - Consultas otimizadas

3. **Caching**
   - Cache de consultas frequentes
   - TTL configurável

4. **Compressão**
   - Gzip para responses
   - Minificação em produção

## 📈 Monitoramento

### Métricas:
- Response time (< 2s)
- Error rate (< 1%)
- Uptime (99%+)
- Memory usage
- CPU utilization

### Logging:
- Morgan para requests
- Winston para aplicação
- Error tracking
- Performance metrics

## 🔄 CI/CD Pipeline

```
1. Commit → GitHub
2. GitHub Actions → Build & Test
3. Tests Pass → Deploy to Vercel
4. Health Check → Notify Team
```

### Environments:
- **Development**: localhost
- **Staging**: staging.nutrition-app.vercel.app
- **Production**: nutrition-app.vercel.app

## 📦 Deployment

### Vercel Configuration:
```json
{
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/server.ts"
    }
  ]
}
```

### Environment Variables:
- Firebase credentials
- JWT secrets
- Database URLs
- API keys

## 🧪 Testing Strategy

### Test Pyramid:
1. **Unit Tests** (70%)
   - Services logic
   - Utilities functions
   - Models validation

2. **Integration Tests** (20%)
   - API endpoints
   - Database operations
   - Authentication flow

3. **E2E Tests** (10%)
   - Critical user journeys
   - Cross-browser testing
   - Performance testing

### Tools:
- Jest + Supertest
- Firebase Test SDK
- Coverage reports
- Performance benchmarks

## 🔮 Roadmap Técnico

### Fase 1 (Atual):
- ✅ Arquitetura base
- ✅ Autenticação
- ✅ CRUD básico
- 🔄 Testes unitários

### Fase 2:
- 📋 Relatórios avançados
- 📋 Integração APIs nutricionais
- 📋 PWA features
- 📋 Notificações push

### Fase 3:
- 📋 Machine Learning
- 📋 Análise preditiva
- 📋 Chatbot nutricional
- 📋 Integração wearables

## 🤝 Padrões de Desenvolvimento

### Code Style:
- ESLint + Prettier
- TypeScript strict mode
- Conventional commits
- Husky pre-commit hooks

### Git Workflow:
- Feature branches
- Pull request reviews
- Automated testing
- Semantic versioning

### Documentation:
- JSDoc para funções
- README atualizado
- API documentation
- Architecture decisions