# Documentação Completa do Sistema - Nutriplan

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Sistema de Autenticação](#sistema-de-autenticação)
6. [Funcionalidades Implementadas](#funcionalidades-implementadas)
7. [API Endpoints](#api-endpoints)
8. [Deploy e Ambientes](#deploy-e-ambientes)

---

## Visão Geral

**Nutriplan** é uma plataforma web completa para gestão nutricional que conecta nutricionistas e pacientes, facilitando o acompanhamento nutricional, agendamento de consultas, criação de planos alimentares e compartilhamento de conteúdo educativo.

### Objetivos do Sistema
- Facilitar a comunicação entre nutricionistas e pacientes
- Centralizar informações nutricionais e consultas
- Automatizar o agendamento e gestão de consultas
- Disponibilizar planos alimentares personalizados
- Compartilhar conteúdo educativo sobre nutrição

---

## Arquitetura do Sistema

### Estrutura Geral
```
Frontend (Next.js) ←→ Backend (Express.js) ←→ MongoDB Atlas
         ↓                    ↓
   Firebase Auth      Vercel Serverless
```

### Componentes Principais

#### **Frontend**
- **Framework**: Next.js 15.5.4 com App Router
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **Ícones**: Lucide React
- **Deploy**: Vercel

#### **Backend**
- **Framework**: Express.js com TypeScript
- **Runtime**: Node.js em Vercel Serverless Functions
- **Validação**: Joi, express-validator
- **Segurança**: bcrypt, jsonwebtoken
- **Deploy**: Vercel

#### **Banco de Dados**
- **Sistema**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose
- **Criptografia**: AES-256-CBC para dados sensíveis

#### **Autenticação**
- **Sistema Híbrido**: Firebase Authentication + JWT customizado
- **Recuperação de Senha**: Firebase `sendPasswordResetEmail()`

---

## Tecnologias Utilizadas

### Frontend Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 15.5.4 | Framework React com SSR |
| React | 19.x | Biblioteca UI |
| TypeScript | 5.x | Linguagem tipada |
| Tailwind CSS | 3.x | Framework CSS utilitário |
| Lucide React | - | Biblioteca de ícones |
| Firebase | 11.1.0 | Autenticação de usuários |

### Backend Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Express.js | 4.x | Framework web |
| TypeScript | 5.x | Linguagem tipada |
| Mongoose | 8.x | ODM MongoDB |
| JWT | 9.x | Autenticação via tokens |
| bcryptjs | 2.x | Hash de senhas |
| Firebase Admin | 13.x | Validação de tokens Firebase |
| Joi | 17.x | Validação de schemas |

### Ferramentas de Deploy

| Serviço | Uso |
|---------|-----|
| Vercel | Deploy frontend e backend serverless |
| MongoDB Atlas | Banco de dados em nuvem |
| Firebase | Autenticação e recuperação de senha |
| Git/GitHub | Controle de versão |

---

## Estrutura do Banco de Dados

### Coleções MongoDB

#### **Users** (Usuários)
```typescript
{
  _id: ObjectId
  name: string
  email: string (unique, index)
  password: string (bcrypt hash)
  role: 'patient' | 'nutritionist' | 'admin'
  firebaseUid?: string (unique)
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### **Patients** (Pacientes)
```typescript
{
  _id: ObjectId
  name: string
  email: string
  birthDate?: Date
  gender?: 'male' | 'female' | 'other'
  notes?: string
  nutritionistId: ObjectId (ref: User)
  userId?: ObjectId (ref: User)
  status: 'linked' | 'not_linked' | 'invite_pending'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**: `nutritionistId`, `email`, `isActive`, `name` (text search)

#### **Consultations** (Consultas)
```typescript
{
  _id: ObjectId
  patientId: ObjectId (ref: Patient)
  nutritionistId: ObjectId (ref: User)
  scheduledDate: Date
  actualDate?: Date
  duration: number // minutos
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
  type: 'initial' | 'follow_up' | 'emergency' | 'online' | 'in_person'
  
  // Dados coletados na consulta
  weight?: number
  bloodPressure?: { systolic: number, diastolic: number }
  vitalSigns?: { heartRate?, temperature?, oxygenSaturation? }
  
  // Conteúdo
  chiefComplaint?: string
  symptoms?: string[]
  currentMedications?: string
  observations: string (encrypted)
  recommendations: string (encrypted)
  followUpInstructions?: string
  
  // Metadados
  nextAppointmentDate?: Date
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**: `patientId`, `nutritionistId`, `scheduledDate`, `status`

#### **DietPlans** (Planos Alimentares)
```typescript
{
  _id: ObjectId
  patientId: ObjectId (ref: Patient)
  nutritionistId: ObjectId (ref: User)
  title: string
  description?: string
  
  // Metas nutricionais
  targetCalories?: number
  targetProteins?: number
  targetCarbohydrates?: number
  targetFats?: number
  
  // Período
  startDate: Date
  endDate?: Date
  isActive: boolean
  
  // Refeições
  meals: [
    {
      type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'
      time: string
      foods: [
        {
          name: string
          quantity: number
          unit: string
          calories?: number
          proteins?: number
          carbohydrates?: number
          fats?: number
        }
      ]
      instructions?: string
    }
  ]
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**: `patientId`, `nutritionistId`, `isActive`, `startDate`

#### **NutritionalAssessments** (Avaliações Nutricionais)
```typescript
{
  _id: ObjectId
  patientId: ObjectId (ref: Patient)
  nutritionistId: ObjectId (ref: User)
  
  // Dados antropométricos
  anthropometricData: {
    weight: number
    height: number
    bmi: number
    bodyFat?: number
    muscleMass?: number
    waistCircumference?: number
    hipCircumference?: number
  }
  
  // Registro alimentar
  foodRecord?: {
    breakfast: string[]
    lunch: string[]
    dinner: string[]
    snacks: string[]
    waterIntake: number
  }
  
  // Atividade física
  physicalActivity?: {
    weeklyFrequency: number
    activities: [{ type: string, duration: number, intensity: string }]
    sedentaryTime: number
  }
  
  observations?: string (encrypted)
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**: `patientId`, `nutritionistId`, `createdAt`

#### **PatientInvites** (Convites)
```typescript
{
  _id: ObjectId
  nutritionistId: ObjectId (ref: User)
  patientEmail: string
  patientName?: string
  inviteToken: string (unique)
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expiresAt: Date
  sentAt: Date
  acceptedAt?: Date
  message?: string
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**: `nutritionistId + status`, `patientEmail + status`, `inviteToken`

#### **Blogs** (Posts do Blog)
```typescript
{
  _id: ObjectId
  title: string
  content: string
  excerpt?: string
  author: ObjectId (ref: User)
  
  category: 'nutrition' | 'recipes' | 'health' | 'lifestyle' | 'news'
  tags: string[]
  featuredImage?: string
  
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**: `author`, `status`, `category`, `publishedAt`, `tags`

### Relacionamentos

```
User (nutritionist) 1 ─── N Patient
User (nutritionist) 1 ─── N Consultation
User (nutritionist) 1 ─── N DietPlan
User (nutritionist) 1 ─── N NutritionalAssessment
User (nutritionist) 1 ─── N PatientInvite
User (nutritionist) 1 ─── N Blog

Patient 1 ─── N Consultation
Patient 1 ─── N DietPlan
Patient 1 ─── N NutritionalAssessment
```

---

## Sistema de Autenticação

### Fluxo de Autenticação Híbrida (Firebase + JWT)

#### 1. Registro de Usuário
```
1. Frontend → Firebase: createUserWithEmailAndPassword()
2. Frontend → Backend: POST /api/auth/hybrid/register
   - Headers: Authorization: Bearer <firebase_token>
   - Body: { name, email, role, phone? }
3. Backend valida Firebase token
4. Backend cria User no MongoDB
5. Backend gera JWT customizado
6. Backend retorna: { user, token: JWT }
```

#### 2. Login
```
1. Frontend → Firebase: signInWithEmailAndPassword()
2. Frontend → Backend: POST /api/auth/hybrid/login
   - Headers: Authorization: Bearer <firebase_token>
3. Backend valida Firebase token
4. Backend busca User no MongoDB
5. Backend gera JWT customizado
6. Backend retorna: { user, token: JWT }
```

#### 3. Requisições Autenticadas
```
Frontend → Backend API
Headers: Authorization: Bearer <custom_JWT>

Backend Middleware:
- Verifica JWT
- Extrai userId, email, role
- Adiciona req.user ao contexto
```

#### 4. Recuperação de Senha
```
1. Frontend: Modal "Esqueci a senha"
2. Frontend → Firebase: sendPasswordResetEmail(email)
3. Firebase envia email com link de reset
4. Usuário clica no link
5. Firebase abre página de redefinição
6. Usuário define nova senha
```

### Estrutura do JWT Customizado

```typescript
{
  userId: string      // MongoDB _id
  email: string       // Email do usuário
  role: string        // 'patient' | 'nutritionist' | 'admin'
  iat: number         // Issued at
  exp: number         // Expiration (24h)
}
```

### Middleware de Autorização

```typescript
authenticate()              // Verifica se está autenticado
authorize(['nutritionist']) // Verifica role específica
requireNutritionist()       // Atalho para nutritionist
requirePatient()            // Atalho para patient
requireAdmin()              // Atalho para admin
```

---

## Funcionalidades Implementadas

### Funcionalidades de Paciente

#### 1. Autenticação
-  Registro com Firebase
-  Login com Firebase
-  Recuperação de senha via email (Firebase)

#### 2. Dashboard
-  Visualização da próxima consulta agendada
-  Acesso ao plano alimentar ativo

#### 3. Convites
-  Receber convites de nutricionistas
-  Visualizar nutricionista vinculado

#### 4. Consultas
-  Visualizar próxima consulta agendada
-  Ver data e horário da consulta

#### 5. Planos Alimentares
-  Acessar plano alimentar ativo
-  Visualizar refeições detalhadas
-  Ver orientações do nutricionista

###  Funcionalidades de Nutricionista

#### 1. Gestão de Pacientes
-  Enviar convites para pacientes (por email)
-  Listar pacientes vinculados
-  Editar informações de pacientes
-  Visualizar lista simplificada de pacientes
-  Buscar pacientes

#### 2. Consultas
-  Agendar consultas com pacientes
-  Visualizar calendário de consultas (dia/semana/mês)
-  Editar consultas agendadas
-  Marcar consultas como concluídas
-  Registrar observações e recomendações
-  Cancelar consultas
-  Ver agenda do dia
-  Estatísticas de consultas

#### 3. Planos Alimentares
-  Criar planos alimentares personalizados
-  Definir metas nutricionais (calorias, macros)
-  Adicionar múltiplas refeições
-  Especificar alimentos, quantidades e horários
-  Ativar/desativar planos
-  Listar planos por paciente
-  Editar planos existentes

#### 4. Avaliações Nutricionais
-  Criar avaliações antropométricas
-  Registrar peso, altura, IMC, circunferências
-  Documentar registro alimentar
-  Registrar atividade física
-  Adicionar observações criptografadas

#### 5. Blog
-  Criar posts educativos
-  Categorizar posts (nutrição, receitas, saúde, estilo de vida, notícias)
-  Adicionar tags
-  Publicar/arquivar posts
-  Deletar posts
-  Definição automática de `publishedAt` ao publicar

### 🌐 Funcionalidades Públicas

#### 1. Página Inicial
-  Apresentação do sistema
-  Cards de funcionalidades principais
-  Seção de posts recentes do blog
-  Call-to-action para registro/login

#### 2. Blog Público
-  Visualizar posts publicados
-  Filtrar por categoria
-  Buscar por título/conteúdo
-  Paginação de posts
-  Exibição de posts recentes na home

#### 3. FAQ (Perguntas Frequentes)
-  Informações sobre funcionalidades
-  Como funciona o sistema
-  Guias de uso

---

##  API Endpoints

###  Autenticação

#### Hybrid Auth (Firebase + JWT)
```
POST   /api/auth/hybrid/register    # Registro com Firebase
POST   /api/auth/hybrid/login       # Login com Firebase
POST   /api/auth/hybrid/refresh     # Renovar JWT
```

###  Usuários
```
GET    /api/users                   # Listar usuários (admin)
GET    /api/users/:id               # Buscar usuário
PUT    /api/users/:id               # Atualizar usuário
DELETE /api/users/:id               # Deletar usuário (admin)
```

###  Consultas
```
POST   /api/consultations                      # Criar consulta (nutritionist)
GET    /api/consultations                      # Listar consultas (nutritionist)
GET    /api/consultations/:id                  # Buscar consulta específica
PUT    /api/consultations/:id                  # Atualizar consulta
DELETE /api/consultations/:id                  # Deletar consulta
PATCH  /api/consultations/:id/complete         # Marcar como concluída
GET    /api/consultations/schedule/today       # Agenda do dia
GET    /api/consultations/schedule/week        # Agenda semanal
GET    /api/consultations/patient/:patientId   # Consultas de paciente
GET    /api/consultations/statistics           # Estatísticas
```

###  Planos Alimentares
```
POST   /api/diet-plans              # Criar plano (nutritionist)
GET    /api/diet-plans              # Listar planos (nutritionist)
GET    /api/diet-plans/:id          # Buscar plano específico
PUT    /api/diet-plans/:id          # Atualizar plano
DELETE /api/diet-plans/:id          # Deletar plano
GET    /api/diet-plans/patient/:id  # Planos de um paciente
GET    /api/diet-plans/active       # Plano ativo (patient)
```

###  Avaliações Nutricionais
```
POST   /api/assessments             # Criar avaliação (nutritionist)
GET    /api/assessments             # Listar avaliações (nutritionist)
GET    /api/assessments/:id         # Buscar avaliação específica
PUT    /api/assessments/:id         # Atualizar avaliação
DELETE /api/assessments/:id         # Deletar avaliação
GET    /api/assessments/patient/:id # Avaliações de um paciente
```

###  Pacientes
```
POST   /api/patients                # Adicionar paciente (nutritionist)
GET    /api/patients                # Listar pacientes (nutritionist)
GET    /api/patients/:id            # Buscar paciente específico
PUT    /api/patients/:id            # Atualizar paciente
DELETE /api/patients/:id            # Deletar paciente
GET    /api/patients/:id/history    # Histórico completo do paciente
```

###  Convites
```
POST   /api/invites                 # Enviar convite (nutritionist)
GET    /api/invites                 # Listar convites enviados
GET    /api/invites/pending         # Convites pendentes (patient)
POST   /api/invites/:token/accept   # Aceitar convite (patient)
POST   /api/invites/:token/reject   # Rejeitar convite (patient)
GET    /api/invites/:token          # Buscar convite por token
DELETE /api/invites/:id             # Cancelar convite (nutritionist)
```

###  Blog

#### Rotas Públicas
```
GET    /api/blog/public             # Listar posts publicados
GET    /api/blog/public/:id         # Buscar post por ID
GET    /api/blog/public/category/:category  # Posts por categoria
GET    /api/blog/public/categories  # Listar categorias
```

#### Rotas Autenticadas (Nutritionist)
```
POST   /api/blog                    # Criar post
GET    /api/blog                    # Listar meus posts
GET    /api/blog/:id                # Buscar post específico
PUT    /api/blog/:id                # Atualizar post
DELETE /api/blog/:id                # Deletar post
```

###  Dashboard
```
GET    /api/dashboard/stats         # Estatísticas gerais (role-based)
```

---

##  Deploy e Ambientes

### Ambientes de Produção

#### Frontend
- **URL**: https://nutrition-frontend-nqd0i9fi2-ana-souzas-projects-43d2dfc4.vercel.app
- **Deploy**: Vercel (automatic from git)
- **Branch**: backend

#### Backend
- **URL**: https://nutrition-backend-7pellbasr-ana-souzas-projects-43d2dfc4.vercel.app/api
- **Deploy**: Vercel Serverless Functions
- **Branch**: backend

#### Banco de Dados
- **Serviço**: MongoDB Atlas
- **Região**: Cloud Provider (AWS/GCP/Azure)
- **Conexão**: Via string de conexão em variáveis de ambiente

### Variáveis de Ambiente

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://nutrition-backend-7pellbasr-ana-souzas-projects-43d2dfc4.vercel.app/api
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase_auth_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<firebase_project_id>
# ... outras configs Firebase
```

#### Backend (.env)
```bash
MONGO_URI=<mongodb_atlas_connection_string>
JWT_SECRET=<jwt_secret_key>
FIREBASE_PROJECT_ID=<firebase_project_id>
FIREBASE_PRIVATE_KEY=<firebase_private_key>
FIREBASE_CLIENT_EMAIL=<firebase_client_email>
ENCRYPTION_KEY=<encryption_key_32_bytes>
```

### Configuração Vercel

#### Frontend
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Environment Variables**: Configuradas no dashboard Vercel

#### Backend
- **Framework Preset**: Other
- **Build Command**: `npm run build` (se necessário)
- **Output Directory**: `dist`
- **Serverless Functions**: Habilitado
- **API Routes**: `/api/*` mapeado para serverless functions

### Processo de Deploy

1. **Commit das alterações**
   ```bash
   git add .
   git commit -m "descrição das mudanças"
   git push origin backend
   ```

2. **Deploy automático no Vercel**
   - Vercel detecta push no branch `backend`
   - Executa build automático
   - Deploy em poucos segundos

3. **Verificação**
   - Frontend: Acessar URL de produção
   - Backend: Testar endpoint `/api/health` ou similar
   - Logs: Verificar no dashboard Vercel

---

##  Notas Importantes

### Segurança
- Senhas armazenadas com bcrypt (10 rounds)
- Dados sensíveis (observações, recomendações) criptografados com AES-256-CBC
- JWT com expiração de 24 horas
- Validação de role em todos os endpoints protegidos
- Firebase tokens validados no backend

### Estado Atual do Sistema
-  Autenticação funcionando (Firebase + JWT)
-  CRUD completo de consultas
-  CRUD completo de planos alimentares
-  CRUD completo de avaliações
-  Sistema de convites funcionando
-  Blog com publicação funcionando
-  Dashboards personalizados

---

##  Estrutura de Pastas

### Frontend
```
app/
├── components/         # Componentes reutilizáveis
├── pages/             # Páginas da aplicação
│   ├── dashboard/     # Dashboards (patient/nutritionist)
│   ├── login/         # Página de login
│   ├── register/      # Página de registro
│   ├── blog/          # Páginas do blog
│   └── frequentlyAsked/  # FAQ
├── services/          # Serviços de API
└── globals.css        # Estilos globais
```

### Backend
```
backend/
├── src/
│   ├── controllers/   # Controladores de rotas
│   ├── services/      # Lógica de negócio
│   ├── models/        # Modelos Mongoose
│   ├── routes/        # Definição de rotas
│   ├── middlewares/   # Middlewares (auth, error, etc)
│   ├── utils/         # Utilitários (encryption, etc)
│   ├── config/        # Configurações
│   └── types/         # Tipos TypeScript
└── tests/             # Testes
```

---

**Última atualização**: Dezembro 2025  
**Versão**: 1.0.0  
