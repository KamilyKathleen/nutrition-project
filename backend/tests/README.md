# 🧪 Testes - Nutriplan Backend

Este diretório contém os testes automatizados do backend usando **Jest**.

---

## O que é Jest?

**Jest** é um framework de testes JavaScript/TypeScript criado pelo Facebook. Ele permite:
-  Testar funções e componentes de forma isolada
-  Verificar se o código funciona como esperado
-  Detectar bugs antes de ir para produção
-  Garantir que mudanças não quebrem funcionalidades existentes

### Como executar os testes:

```bash
# Executar todos os testes
npm test

# Executar com cobertura de código
npm run test:coverage

# Executar em modo watch (monitora mudanças)
npm run test:watch

# Executar teste específico
npm test -- --testPathPattern="encryption.test"
```

---

##  Estrutura de Pastas

```
tests/
├── factories/          # Factories - Criam dados de teste
│   ├── patient.factory.ts
│   ├── user.factory.ts
│   └── consultation.factory.ts
│
├── mocks/             # Mocks - Simulam dependências
│   └── helpers.ts
│
├── unit/              # Testes CRUD Básicos
│   ├── user.crud.test.ts           # CRUD de usuários
│   └── consultation.crud.test.ts   # CRUD de consultas
│
└── README.md         # Esta documentação
```

---

##  O que são Factories?

**Factories** são funções que **criam dados de teste** de forma padronizada e reutilizável.

### Exemplo prático:

```typescript
//  SEM Factory - Repetitivo e difícil de manter
test('criar paciente 1', () => {
  const patient = {
    name: 'João',
    email: 'joao@test.com',
    birthDate: new Date('1990-01-01'),
    gender: 'male',
    nutritionistId: new mongoose.Types.ObjectId()
  };
  // ...teste
});

test('criar paciente 2', () => {
  const patient = {
    name: 'Maria',
    email: 'maria@test.com',
    birthDate: new Date('1992-05-15'),
    gender: 'female',
    nutritionistId: new mongoose.Types.ObjectId()
  };
  // ...teste
});

//  COM Factory - Reutilizável e fácil de manter
import { createPatientData } from '../factories/patient.factory';

test('criar paciente 1', () => {
  const patient = createPatientData({ name: 'João' });
  // ...teste
});

test('criar paciente 2', () => {
  const patient = createPatientData({ name: 'Maria' });
  // ...teste
});
```

### Vantagens das Factories:

-  **Menos código repetido**: Cria dados completos com valores padrão
-  **Fácil customização**: Pode sobrescrever apenas o que precisa
-  **Consistência**: Todos os testes usam dados no mesmo formato
-  **Manutenção**: Alterar em um lugar reflete em todos os testes

### Factories disponíveis:

#### `patient.factory.ts`
```typescript
// Criar paciente padrão
const patient = createPatientData();

// Criar paciente customizado
const patient = createPatientData({ 
  name: 'João Silva',
  email: 'joao@example.com' 
});

// Criar múltiplos pacientes
const patients = createMultiplePatients(5);

// Criar paciente sem email
const patient = createPatientWithoutEmail();
```

#### `user.factory.ts`
```typescript
// Criar usuário padrão
const user = createUserData();

// Criar nutricionista
const nutritionist = createNutritionistData();

// Criar paciente (usuário)
const patient = createPatientUserData();

// Criar admin
const admin = createAdminData();
```

#### `consultation.factory.ts`
```typescript
// Criar consulta padrão
const consultation = createConsultationData();

// Criar consulta agendada
const scheduled = createScheduledConsultation();

// Criar consulta completada
const completed = createCompletedConsultation();

// Criar consulta cancelada
const cancelled = createCancelledConsultation();

// Criar consulta presencial
const inPerson = createInPersonConsultation();
```

---

## O que são Mocks?

**Mocks** são **objetos falsos** que simulam comportamentos de dependências reais (banco de dados, APIs externas, etc.).

### Por que usar Mocks?

- **Testes mais rápidos**: Não precisa acessar banco de dados real
- **Testes isolados**: Testa apenas a função, não as dependências
- **Testes confiáveis**: Não depende de serviços externos
- **Simula cenários**: Pode simular erros, timeouts, etc.

### Exemplo prático:

```typescript
//  SEM Mock - Depende do banco de dados real
test('buscar paciente', async () => {
  // Precisa ter banco rodando, dados inseridos, etc.
  const patient = await Patient.findById('real-id-from-database');
  expect(patient.name).toBe('João');
});

//  COM Mock - Simula o banco de dados
import { createMockModel, createMockDocument } from '../mocks/helpers';

test('buscar paciente', async () => {
  const mockPatientModel = createMockModel();
  const mockPatient = createMockDocument({ name: 'João' });
  
  // Simula que o banco retornará esse paciente
  mockPatientModel.findById.mockResolvedValue(mockPatient);
  
  // Testa a lógica sem precisar do banco
  const patient = await mockPatientModel.findById('fake-id');
  expect(patient.name).toBe('João');
});
```

### Mocks disponíveis:

#### Mock de Modelo Mongoose
```typescript
import { createMockModel } from '../mocks/helpers';

const mockPatientModel = createMockModel();

// Agora pode simular comportamentos:
mockPatientModel.find.mockResolvedValue([patient1, patient2]);
mockPatientModel.findById.mockResolvedValue(patient);
mockPatientModel.create.mockResolvedValue(newPatient);
mockPatientModel.findByIdAndUpdate.mockResolvedValue(updatedPatient);
mockPatientModel.findByIdAndDelete.mockResolvedValue(deletedPatient);
```

#### Mock de Query Mongoose
```typescript
import { createMockQuery } from '../mocks/helpers';

const mockQuery = createMockQuery([patient1, patient2]);

// Simula query encadeada:
mockPatientModel.find.mockReturnValue(mockQuery);

await mockPatientModel
  .find()
  .select('name email')
  .sort({ name: 1 })
  .limit(10)
  .exec(); // Retorna [patient1, patient2]
```

#### Mock de Request/Response (Express)
```typescript
import { createMockRequest, createMockResponse, createMockNext } from '../mocks/helpers';

const req = createMockRequest({
  body: { name: 'Test' },
  params: { id: '123' },
  user: { id: 'user-123', role: 'nutritionist' }
});

const res = createMockResponse();
const next = createMockNext();

// Testa um controller:
await myController(req, res, next);

// Verifica o que foi chamado:
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({ success: true });
```

---

##  Tipos de Testes

### 1. **Testes Unitários** (`/unit`)

Testam **funções individuais** de forma isolada.

**Exemplo**: Testar se a função de criptografia funciona

```typescript
// tests/unit/utils/encryption.test.ts
test('deve criptografar um texto', () => {
  const texto = 'Dado sensível';
  const criptografado = encrypt(texto);
  
  expect(criptografado).not.toBe(texto);
  expect(criptografado).toContain(':');
});
```

**Arquivos de teste unitário:**
- `tests/unit/utils/encryption.test.ts` - Testa funções de criptografia
- `tests/unit/models/patient.test.ts` - Testa validação de dados de paciente
- `tests/unit/models/consultation.test.ts` - Testa validação de dados de consulta
- `tests/unit/services/patient.service.test.ts` - Testa serviço de pacientes com mocks

### 2. **Testes de Integração** (`/integration`)

Testam como **múltiplos componentes trabalham juntos**.

**Exemplo**: Testar relação entre nutricionista → paciente → consulta

```typescript
// tests/integration/factories.test.ts
test('deve criar fluxo completo', () => {
  const nutritionist = createNutritionistData();
  const patient = createPatientData({ nutritionistId: nutritionist.id });
  const consultation = createConsultationData({ 
    patientId: patient.id,
    nutritionistId: nutritionist.id 
  });
  
  expect(patient.nutritionistId).toBe(nutritionist.id);
  expect(consultation.patientId).toBe(patient.id);
});
```

---

## 📊 Como Funciona um Teste Jest

### Estrutura básica:

```typescript
describe('Nome do grupo de testes', () => {
  // Executa ANTES de cada teste
  beforeEach(() => {
    // Setup: preparar dados, limpar mocks, etc.
  });

  // Executa DEPOIS de cada teste
  afterEach(() => {
    // Cleanup: limpar dados, resetar mocks, etc.
  });

  test('deve fazer algo específico', () => {
    // 1. ARRANGE (Preparar)
    const input = 'dados de entrada';
    
    // 2. ACT (Executar)
    const result = minhaFuncao(input);
    
    // 3. ASSERT (Verificar)
    expect(result).toBe('resultado esperado');
  });

  it('é a mesma coisa que test()', () => {
    expect(1 + 1).toBe(2);
  });
});
```

### Principais matchers (verificadores):

```typescript
// Igualdade
expect(value).toBe(expected);           // Igualdade estrita (===)
expect(value).toEqual(expected);        // Igualdade profunda (objetos)

// Verdadeiro/Falso
expect(value).toBeTruthy();             // É verdadeiro
expect(value).toBeFalsy();              // É falso
expect(value).toBeNull();               // É null
expect(value).toBeUndefined();          // É undefined
expect(value).toBeDefined();            // Não é undefined

// Números
expect(value).toBeGreaterThan(3);       // Maior que
expect(value).toBeLessThan(5);          // Menor que
expect(value).toBeCloseTo(0.3);         // Aproximadamente igual

// Strings
expect(string).toContain('texto');      // Contém texto
expect(string).toMatch(/regex/);        // Match com regex

// Arrays
expect(array).toHaveLength(3);          // Tem tamanho 3
expect(array).toContain(item);          // Contém item

// Objetos
expect(obj).toHaveProperty('name');     // Tem propriedade
expect(obj.name).toBe('João');          // Propriedade tem valor

// Funções
expect(fn).toHaveBeenCalled();          // Foi chamada
expect(fn).toHaveBeenCalledWith(arg);   // Foi chamada com argumento
expect(fn).toHaveBeenCalledTimes(2);    // Foi chamada 2 vezes

// Erros
expect(() => fn()).toThrow();           // Lança erro
expect(() => fn()).toThrow('mensagem'); // Lança erro com mensagem

// Async
await expect(promise).resolves.toBe(value);  // Promise resolve com valor
await expect(promise).rejects.toThrow();     // Promise rejeita com erro
```

---

## 📈 Cobertura de Testes

A **cobertura** mede quanto do código está sendo testado.

```bash
npm run test:coverage
```

Gera um relatório mostrando:
- **% de linhas** cobertas
- **% de funções** cobertas
- **% de branches** (ifs, switches) cobertos
- **% de statements** cobertos

**Objetivo**: Ter pelo menos 70-80% de cobertura.

---

##  Resumo dos Testes Atuais

###  Testes CRUD Básicos (31 testes no total)

#### 1. User CRUD (`user.crud.test.ts`) - 12 testes
Testa operações básicas de usuários:
- ✅ CREATE - Criar novo usuário, validar email obrigatório
- ✅ READ - Buscar por ID, email, listar todos, tratar não encontrado
- ✅ UPDATE - Atualizar dados, tratar usuário inexistente
- ✅ DELETE - Deletar usuário, tratar usuário inexistente
- ✅ COUNT - Contar total de usuários, contar por role

#### 2. Consultation CRUD (`consultation.crud.test.ts`) - 19 testes
Testa operações básicas de consultas:
- ✅ CREATE - Criar nova consulta, validar data/paciente obrigatórios
- ✅ READ - Buscar por ID, listar por paciente/status/período
- ✅ UPDATE - Atualizar status, notas, cancelar consulta
- ✅ DELETE - Deletar consulta, tratar consulta inexistente
- ✅ COUNT - Contar por status (total, agendadas, completadas, por nutricionista)
- ✅ VALIDAÇÕES - Validar tipo e status válidos

#### 3. Patient CRUD (futuro)
Testa operações básicas de pacientes (a ser implementado)
*A ser implementado* - Seguirá o mesmo padrão dos outros CRUDs

---

##  Recursos para Aprender Mais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test-Driven Development (TDD)](https://www.freecodecamp.org/news/test-driven-development-what-it-is-and-what-it-is-not-41fa6bca02a2/)

