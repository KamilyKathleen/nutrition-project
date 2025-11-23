# 🔐 ANÁLISE DE SEGURANÇA ATUALIZADA - DADOS DE PACIENTES

## ✅ CAMPOS OBRIGATÓRIOS (4 campos):
1. **`name`** - Nome do paciente (baixo risco)
2. **`birthDate`** - Data de nascimento (médio risco - dados pessoais)
3. **`gender`** - Gênero (baixo risco - categoria)
4. **`nutritionistId`** - ID do nutricionista responsável (seguro - relacionamento)

## 🟡 CAMPOS OPCIONAIS (8 campos):

### **🚨 ALTO RISCO - DADOS SENSÍVEIS:**
- **`medicalHistory`** - Histórico médico
- **`allergies`** - Alergias (dados de saúde críticos)
- **`medications`** - Medicamentos em uso
- **`address`** - Endereço completo (localização física)

### **⚠️ MÉDIO RISCO:**
- **`email`** - Email pessoal
- **`phone`** - Telefone de contato
- **`notes`** - Observações (podem conter dados sensíveis)

### **🔒 BAIXO RISCO:**
- **`nutritionalGoals`** - Objetivos nutricionais

## ✅ CAMPOS REMOVIDOS POR SEGURANÇA:
- ❌ **`cpf`** - Removido (não necessário)
- ❌ **`occupation`** - Removido (não necessário)
- ❌ **`emergencyContact`** - Removido (não necessário)

## 🔄 MUDANÇAS ESTRUTURAIS:
- ✅ **`studentId` → `nutritionistId`** - Fluxo correto do sistema
- ✅ **Sistema de convites** - Nutricionista convida paciente por email/nome
- ✅ **Redução da superfície de ataque** - Menos dados sensíveis armazenados

## 🛡️ IMPLEMENTAÇÕES RECOMENDADAS

### 1. CRIPTOGRAFIA DE CAMPOS SENSÍVEIS

```typescript
// Implementar plugin de criptografia para Mongoose
import { encrypt, decrypt } from '@/utils/encryption';

const patientSchema = new Schema({
  // Campos sensíveis criptografados
  cpf: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  medicalHistory: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  allergies: [{
    type: String,
    set: encrypt,
    get: decrypt
  }],
  medications: [{
    type: String,
    set: encrypt,
    get: decrypt
  }]
});
```

### 2. HASHING DE DADOS IDENTIFICADORES

```typescript
// CPF hasheado para busca + criptografado para exibição
const patientSchema = new Schema({
  cpfHash: {
    type: String,
    index: true // Para busca
  },
  cpf: {
    type: String,
    set: encrypt,
    get: decrypt
  }
});
```

### 3. LOGS DE AUDITORIA

```typescript
// Middleware para auditoria de acesso a dados sensíveis
patientSchema.post('findOne', function(doc) {
  if (doc) {
    auditLog.create({
      action: 'PATIENT_ACCESS',
      userId: this.getOptions().userId,
      patientId: doc._id,
      fields: this.getOptions().select,
      timestamp: new Date()
    });
  }
});
```

### 4. CONTROLE DE ACESSO GRANULAR

```typescript
// Middleware para filtrar campos baseado na role
const filterSensitiveData = (user: User, patient: Patient) => {
  switch (user.role) {
    case 'STUDENT':
      // Estudantes veem dados limitados
      return omit(patient, ['cpf', 'medications']);
    
    case 'NUTRITIONIST':
      // Nutricionistas veem todos os dados
      return patient;
    
    case 'ADMIN':
      // Admins veem tudo + auditoria
      return { ...patient, auditInfo: true };
  }
};
```

### 5. ANONYMIZAÇÃO PARA RELATÓRIOS

```typescript
// Dados anonimizados para análises
const anonymizePatient = (patient: Patient) => ({
  ageRange: getAgeRange(patient.birthDate),
  gender: patient.gender,
  region: patient.address?.state,
  allergiesCount: patient.allergies?.length,
  // Sem dados identificadores
});
```

## 🔒 CONFIGURAÇÕES DE SEGURANÇA

### Environment Variables Necessárias:
```env
# Chaves de criptografia (rotacionar regularmente)
ENCRYPTION_KEY=your-256-bit-encryption-key
ENCRYPTION_IV=your-initialization-vector

# Configurações de auditoria
AUDIT_RETENTION_DAYS=90
SENSITIVE_DATA_ACCESS_LOG=true
```

### Backup e Recovery:
- Backups criptografados
- Chaves de criptografia em HSM ou Key Vault
- Processo de rotação de chaves documentado

## 📊 CONFORMIDADE LGPD/GDPR

### Direitos dos Titulares:
- **Acesso**: API para consultar dados pessoais
- **Retificação**: Endpoint para correção de dados
- **Exclusão**: Soft delete + hard delete após período
- **Portabilidade**: Export em formato estruturado

### Consentimento:
```typescript
const consentSchema = new Schema({
  patientId: ObjectId,
  dataProcessing: Boolean,
  medicalDataSharing: Boolean,
  researchParticipation: Boolean,
  timestamp: Date,
  ipAddress: String
});
```

## ⚠️ AÇÕES IMEDIATAS RECOMENDADAS

1. **Implementar criptografia para CPF, dados médicos**
2. **Adicionar logs de auditoria**
3. **Configurar backup criptografado**
4. **Criar política de retenção de dados**
5. **Documentar processos de segurança**
6. **Treinar equipe sobre LGPD**

## 🔄 MONITORAMENTO CONTÍNUO

- Alertas para acesso fora do horário
- Detecção de padrões suspeitos
- Relatórios mensais de acesso a dados sensíveis
- Auditoria trimestral de segurança