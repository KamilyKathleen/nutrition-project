# 🎯 Sistema de Status de Pacientes com Avisos de Expiração de Convites

## 📋 Resumo das Mudanças

Implementação completa do sistema de status de pacientes com avisos visuais sobre a expiração de convites.

## ✨ Funcionalidades Implementadas

### 1. **Novos Status de Pacientes**
Os pacientes agora têm 4 possíveis status:

- **🟢 Vinculado** - Paciente com conta ativa no sistema
- **🔵 Convite Pendente** - Convite enviado, aguardando aceitação
- **🟡 Convite Urgente** - Convite prestes a expirar (≤ 2 dias)
- **🔴 Convite Expirado** - Convite expirou (> 7 dias)
- **⚪ Não Vinculado** - Paciente sem convite enviado

### 2. **Sistema de Avisos de Expiração**

#### Constantes de Controle:
```typescript
const INVITE_EXPIRATION_DAYS = 7;           // Convite expira em 7 dias
const INVITE_URGENT_THRESHOLD_DAYS = 2;     // Aviso urgente com 2 dias restantes
```

#### Avisos Visuais:
- **Clock icon** (⏰) - Convite pendente com tempo restante
- **Clock icon pulsante** (⏰💛) - Convite urgente (≤ 2 dias)
- **AlertCircle icon** (⚠️) - Convite expirado

### 3. **Contador de Dias Restantes**

A lista de pacientes agora mostra:
- **"Expira em X dias"** - Para convites com mais de 2 dias
- **"Expira em X dias"** (laranja, negrito) - Para convites urgentes (≤ 2 dias)

## 📁 Arquivos Modificados

### 1. `app/pages/dashboard/PatientList.tsx`

**Adicionado:**
- Import de ícones `Clock` e `AlertCircle`
- Constantes de expiração de convites
- Função `getDaysUntilExpiration()` - Calcula dias restantes
- Função `getPatientStatusInfo()` - Retorna status e visual do paciente
- Nova renderização da célula de status com badges dinâmicos e contador

### 2. `app/pages/dashboard/types.ts`

**Adicionado ao tipo `Patient`:**
```typescript
inviteDate?: string;  // Data do convite para vinculação
inviteId?: string;    // ID do convite pendente
```

## 🎨 Visual dos Status

| Status | Cor | Ícone | Expiração Visível |
|--------|-----|-------|-------------------|
| Vinculado | Verde | - | Não |
| Convite Pendente (>2 dias) | Azul | ⏰ | Sim |
| Convite Urgente (≤2 dias) | Amarelo | ⏰ (pulsante) | Sim (laranja) |
| Convite Expirado | Vermelho | ⚠️ | Não |
| Não Vinculado | Cinza | - | Não |

## 🔧 Lógica de Funcionamento

### Fluxo de Status:

1. **Sistema verifica se paciente está "Ativo"**
   - Se SIM → Status: "Vinculado" (Verde)
   - Se NÃO → Prossegue para verificação de convite

2. **Sistema verifica se existe `inviteDate`**
   - Se NÃO → Status: "Não Vinculado" (Cinza)
   - Se SIM → Calcula dias restantes

3. **Cálculo de Expiração:**
   ```typescript
   daysLeft = expirationDate - currentDate
   ```

4. **Classificação por Dias Restantes:**
   - `daysLeft ≤ 0` → "Convite Expirado" (Vermelho)
   - `0 < daysLeft ≤ 2` → "Convite Pendente" (Amarelo, urgente)
   - `daysLeft > 2` → "Convite Pendente" (Azul, normal)

## 💡 Exemplo de Uso

### Estrutura de Dados de Paciente:
```typescript
{
  id: "123",
  name: "João Silva",
  email: "joao@email.com",
  status: "Inativo",
  inviteDate: "2025-01-15T10:00:00Z",  // Data do convite
  inviteId: "abc456"                    // ID do convite
}
```

### Visual na Tabela:
```
┌─────────────────────────────────────────────────┐
│ Nome        │ Status                            │
├─────────────┼───────────────────────────────────┤
│ João Silva  │ [⏰ Convite Pendente] (Azul)     │
│             │ Expira em 5 dias                  │
└─────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Nome        │ Status                            │
├─────────────┼───────────────────────────────────┤
│ Maria Costa │ [⏰ Convite Pendente] (Amarelo)   │
│             │ Expira em 1 dia (laranja/negrito) │
└─────────────┴───────────────────────────────────┘
```

## 🚀 Próximos Passos (Integração Backend)

Para completar a funcionalidade, será necessário:

1. **Backend retornar campos adicionais:**
   - `inviteDate` - Data de criação do convite
   - `inviteId` - ID do convite na tabela PatientInvite

2. **Atualizar endpoint de listagem:**
   ```typescript
   GET /api/patients
   Response: {
     id: string,
     name: string,
     email: string,
     status: 'Ativo' | 'Inativo',
     inviteDate?: string,
     inviteId?: string
   }
   ```

3. **Sincronizar com backend:**
   - Backend já possui sistema de convites em `PatientInviteService.ts`
   - Expira em 7 dias (linha 58: `expiresAt.setDate(expiresAt.getDate() + 7)`)
   - Frontend agora está alinhado com essa lógica

## ✅ Benefícios

1. **Visibilidade:** Nutricionistas veem imediatamente status de vinculação
2. **Urgência:** Avisos visuais destacados para convites prestes a expirar
3. **Ação Proativa:** Contador de dias permite reenviar convites antes da expiração
4. **UX Melhorada:** Cores e ícones facilitam identificação rápida
5. **Consistência:** Alinhado com lógica de 7 dias do backend

## 🎯 Impacto no Usuário

- ⏱️ **Economia de tempo:** Identificação imediata de status
- 🎨 **Visual intuitivo:** Cores e ícones auto-explicativos
- ⚡ **Ações rápidas:** Saber quando reenviar convites
- 📊 **Gestão eficiente:** Acompanhamento claro do processo de vinculação

---

**Data da Implementação:** 23 de Janeiro de 2025
**Versão:** 1.0
**Desenvolvedor:** Ana Souza
