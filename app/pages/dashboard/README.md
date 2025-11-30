# Dashboard - Estrutura Organizada

Esta pasta contém os dashboards do sistema, organizados por papel de usuário.

## 📁 Estrutura

```
dashboard/
├── page.tsx                    # Página principal que roteia entre dashboards
├── nutritionist/               # Dashboard do Nutricionista
│   ├── NutritionistDashboard.tsx
│   ├── components/            # Componentes específicos do nutricionista
│   │   ├── DashboardCard.tsx
│   │   ├── OverviewCards.tsx
│   │   ├── PatientList.tsx
│   │   └── QuickActions.tsx
│   └── modals/                # Modais do nutricionista
│       ├── AddPatientModal.tsx
│       ├── AnthropometricEvaluationModal.tsx
│       ├── ConsultationsCalendarModal.tsx
│       ├── CreatePlanModal.tsx
│       ├── EditConsultationModal.tsx
│       ├── EditPatientModal.tsx
│       ├── InvitePatientModal.tsx
│       ├── NewEvaluationModal.tsx
│       ├── PatientHistoryModal.tsx
│       ├── PendingInvites.tsx
│       └── ScheduleAppointmentModal.tsx
├── patient/                    # Dashboard do Paciente
│   ├── PatientDashboard.tsx
│   └── components/            # Componentes específicos do paciente
│       ├── PlanView.tsx
│       └── ProgressView.tsx
└── shared/                     # Tipos e componentes compartilhados
    └── types.ts
```

## 🎯 Responsabilidades

### Nutritionist (Nutricionista)
- **Dashboard Principal**: Visão geral de pacientes, consultas agendadas e ações rápidas
- **Gerenciamento de Pacientes**: Lista, adiciona, edita pacientes
- **Consultas**: Agenda e gerencia consultas
- **Avaliações**: Cria avaliações nutricionais e antropométricas
- **Planos Alimentares**: Cria e gerencia planos
- **Convites**: Envia convites para vincular pacientes

### Patient (Paciente)
- **Dashboard Principal**: Visão geral do progresso e plano alimentar
- **Progresso**: Acompanhamento de peso, medidas e evolução
- **Plano Alimentar**: Visualização do plano criado pelo nutricionista
- **Consultas**: Visualiza consultas agendadas
- **Convites Pendentes**: Aceita/rejeita convites de nutricionistas

### Shared (Compartilhado)
- **Types**: Interfaces TypeScript compartilhadas entre nutricionista e paciente
- Componentes que são usados por ambos os papéis

## 🔄 Fluxo de Imports

```typescript
// ✅ Correto - Importar types de shared
import { Patient } from '../../shared/types';

// ✅ Correto - Importar componentes da mesma pasta
import DashboardCard from './DashboardCard';

// ✅ Correto - Importar de outra role quando necessário
import DashboardCard from '../nutritionist/components/DashboardCard';
```

## 📝 Convenções

1. **Componentes de UI**: Vão em `components/`
2. **Modais/Dialogs**: Vão em `modals/`
3. **Types compartilhados**: Vão em `shared/`
4. **Imports relativos**: Use caminhos relativos claros (`../shared/types`)
5. **Nomeação**: PascalCase para componentes, camelCase para funções

## 🚀 Benefícios da Organização

- ✅ **Clareza**: Fácil identificar componentes por papel de usuário
- ✅ **Manutenibilidade**: Mudanças em um papel não afetam o outro
- ✅ **Escalabilidade**: Fácil adicionar novos componentes/modais
- ✅ **Separação de Responsabilidades**: Cada pasta tem um propósito claro
- ✅ **Reutilização**: Shared contém código comum
