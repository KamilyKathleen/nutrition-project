# 🔥 Firebase Authentication + Internal Notifications System

## 📋 Visão Geral

Este projeto implementa um sistema completo de autenticação Firebase com notificações internas, substituindo o sistema de email que apresentava problemas de conectividade (ProtonMail timeout). A solução oferece:

- ✅ **Autenticação Firebase** com Google Login e email/senha
- ✅ **Sistema de notificações internas** no dashboard
- ✅ **Convites por notificação** ao invés de email
- ✅ **Recuperação de senha** via Firebase
- ✅ **APIs RESTful** para gerenciamento de notificações

## 🏗️ Arquitetura

### Backend
```
backend/
├── lib/
│   ├── firebase-admin.ts      # Firebase Admin SDK
│   ├── firebase-client.ts     # Firebase Client SDK  
│   └── mongodb.ts             # MongoDB connection
├── models/
│   ├── InternalNotification.ts # Modelo de notificações
│   └── PendingInvite.ts       # Convites pendentes
├── services/
│   ├── InternalNotificationService.ts
│   └── InternalInviteService.ts
├── middlewares/
│   └── auth.ts                # Middleware Firebase Auth
└── api/
    └── notifications/         # APIs de notificação
```

### Frontend
```
app/
├── components/
│   └── FirebaseLogin.tsx      # Componente de login
└── hooks/
    └── useNotifications.tsx   # Hook para notificações
```

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install firebase firebase-admin
```

### 2. Configurar Firebase

#### a) Criar Projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative Authentication > Sign-in methods > Email/Password e Google

#### b) Obter Credenciais Web App
```javascript
// Configuração Web App (Frontend)
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "project.firebaseapp.com",
  projectId: "project-id",
  // ... outras configurações
};
```

#### c) Gerar Service Account (Backend)
1. Project Settings > Service Accounts
2. Generate New Private Key
3. Baixar arquivo JSON

### 3. Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Frontend
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
# ... outras variáveis frontend

# Backend  
FIREBASE_PROJECT_ID=project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
# ... outras variáveis backend

# MongoDB (existente)
MONGODB_URI=mongodb+srv://...
```

## 📡 APIs Disponíveis

### Notificações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/notifications` | Listar notificações do usuário |
| `POST` | `/api/notifications` | Criar nova notificação |
| `PATCH` | `/api/notifications/[id]` | Marcar como lida |
| `DELETE` | `/api/notifications/[id]` | Deletar notificação |
| `POST` | `/api/notifications/mark-all-read` | Marcar todas como lidas |
| `GET` | `/api/notifications/stats` | Estatísticas |

### Parâmetros de Query (GET /api/notifications)

```javascript
?type=appointment          // Filtrar por tipo
&isRead=false             // Apenas não lidas  
&priority=high            // Por prioridade
&limit=10                 // Limitar resultados
&page=1                   // Paginação
```

## 🔐 Autenticação

### Frontend

```typescript
import FirebaseClientAuth from '@/lib/firebase-client';

// Login com Google
const result = await FirebaseClientAuth.loginWithGoogle();

// Login com email/senha
const result = await FirebaseClientAuth.loginWithEmail(email, password);

// Obter token para APIs
const token = await FirebaseClientAuth.getCurrentToken();
```

### Backend (Middleware)

```typescript
import { authMiddleware } from '@/middlewares/auth';

// Verificar autenticação
const authResult = await authMiddleware(request);
if (!authResult.success) {
  return NextResponse.json({ error: authResult.error }, { status: 401 });
}

// Verificar role específica
const authResult = await requireNutritionist(request);
```

### Headers de Requisição

```javascript
headers: {
  'Authorization': `Bearer ${firebaseToken}`,
  'Content-Type': 'application/json'
}
```

## 🔔 Sistema de Notificações

### Tipos de Notificação

- `appointment` - Consultas agendadas
- `diet_plan` - Planos alimentares
- `reminder` - Lembretes gerais
- `system` - Notificações do sistema
- `invite` - Convites para a plataforma

### Prioridades

- `low` - Baixa prioridade
- `medium` - Média prioridade  
- `high` - Alta prioridade

### Templates Automáticos

```typescript
// Convite automático
await InternalNotificationService.createInviteNotification(
  recipientId,
  nutritionistName,
  inviteToken
);

// Consulta agendada
await InternalNotificationService.createAppointmentNotification(
  patientId,
  appointmentDate,
  nutritionistName
);
```

## 🎯 Uso no Frontend

### Hook de Notificações

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function Dashboard() {
  const {
    notifications,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification
  } = useNotifications();

  return (
    <div>
      <h2>Notificações ({stats?.unread})</h2>
      {notifications.map(notif => (
        <div key={notif._id} onClick={() => markAsRead(notif._id)}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### Componente de Login

```typescript
import FirebaseLogin from '@/components/FirebaseLogin';

function LoginPage() {
  return <FirebaseLogin />;
}
```

## 🔄 Migração do Sistema de Email

### Antes (Email)
- ❌ Dependência de SMTP externo (ProtonMail)
- ❌ Problemas de conectividade e firewall
- ❌ Emails podem ir para spam
- ❌ Não funciona offline

### Depois (Notificações Internas)
- ✅ Sistema interno confiável
- ✅ Notificações em tempo real
- ✅ Controle total sobre entrega
- ✅ Funciona sempre que usuário acessa dashboard

### Processo de Convite

#### Antigo Sistema (Email)
1. Nutricionista convida paciente
2. Sistema envia email com link
3. **PROBLEMA**: Email não chega (timeout SMTP)

#### Novo Sistema (Notificação)
1. Nutricionista convida paciente por email
2. Sistema cria `PendingInvite` no banco
3. Se email já tem conta → notificação interna
4. Se email não tem conta → convite fica pendente
5. Quando usuário se cadastra → notificação aparece automaticamente

## 👥 Roles e Permissões

### Configurar Roles no Firebase

```typescript
import { setUserRole } from '@/lib/firebase-admin';

// Definir role para usuário
await setUserRole(uid, 'nutritionist');
await setUserRole(uid, 'patient'); 
await setUserRole(uid, 'admin');
```

### Middleware de Roles

```typescript
// Apenas nutricionistas
const authResult = await requireNutritionist(request);

// Apenas pacientes (ou nutricionistas/admin)
const authResult = await requirePatient(request);

// Apenas administradores
const authResult = await requireAdmin(request);
```

## 📊 Monitoramento e Stats

### Estatísticas Disponíveis

```typescript
{
  total: 25,           // Total de notificações
  unread: 3,           // Não lidas
  byType: {            // Por tipo
    appointment: 10,
    reminder: 8,
    invite: 7
  },
  byPriority: {        // Por prioridade
    high: 2,
    medium: 15,
    low: 8
  }
}
```

## 🚀 Deployment

### 1. Variáveis de Ambiente

Configure todas as variáveis no seu provedor (Vercel, Railway, etc.):

```bash
# Firebase (obrigatório)
NEXT_PUBLIC_FIREBASE_API_KEY=...
FIREBASE_PRIVATE_KEY=...
# ... todas as outras

# MongoDB (existente)
MONGODB_URI=...
```

### 2. Build e Deploy

```bash
npm run build
npm start
```

## 🔍 Troubleshooting

### Erro: "Cannot find module '@/lib/firebase-client'"

Configure o `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Erro: "Firebase not initialized"

Verifique se todas as variáveis de ambiente estão configuradas:

```bash
echo $NEXT_PUBLIC_FIREBASE_API_KEY
echo $FIREBASE_PROJECT_ID
```

### Notificações não aparecem

1. Verificar se usuário está autenticado
2. Verificar token Firebase válido
3. Verificar logs do servidor para erros
4. Testar endpoint diretamente com Postman

### Problemas de CORS

Configure headers CORS no Next.js:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,PATCH' },
        ],
      },
    ];
  },
};
```

## 📝 Próximos Passos

1. **Integrar com sistema existente**
   - Conectar modelos User/Patient/Nutritionist
   - Migrar JWT para Firebase tokens
   - Atualizar middleware de autenticação

2. **Implementar notificações push**
   - Service Worker para notificações no navegador
   - Push notifications com VAPID keys

3. **Dashboard de notificações**
   - Interface visual para gerenciar notificações
   - Filtros avançados e paginação
   - Marcar múltiplas como lidas

4. **Testes automatizados**
   - Testes unitários para services
   - Testes de integração para APIs
   - Testes E2E para fluxo de autenticação

---

## ✨ Benefícios da Nova Arquitetura

- **Confiabilidade**: Sistema interno sem dependências externas
- **Performance**: Notificações carregam mais rápido que emails
- **UX**: Usuário vê notificações imediatamente no dashboard
- **Controle**: Total controle sobre entrega e visualização
- **Escalabilidade**: Firebase Auth escala automaticamente
- **Segurança**: Tokens JWT do Firebase são mais seguros
- **Manutenção**: Menos código para manter (sem SMTP)

---

**Status**: ✅ Sistema implementado e pronto para integração
**Próxima etapa**: Integrar com modelos existentes e testar em produção