# 🍎 Nutrition Project - Backend API

Sistema de Planejamento e Avaliação de Dietas - API Backend

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Tokens de autenticação
- **Joi** - Validação de dados
- **BCrypt** - Hash de senhas

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (Firebase, ambiente)
│   ├── controllers/     # Controladores da API
│   ├── middlewares/     # Middlewares (auth, validation, etc)
│   ├── services/        # Serviços de negócio
│   ├── routes/          # Definição das rotas
│   ├── types/           # Tipos e interfaces TypeScript
│   ├── utils/           # Utilitários
│   ├── app.ts           # Configuração do Express
│   └── server.ts        # Servidor principal
├── tests/               # Testes automatizados
├── docs/                # Documentação
└── dist/                # Código compilado
```

## 🔧 Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar o arquivo .env com suas configurações
```

### 3. Configurar MongoDB
- Instalar MongoDB localmente ou usar MongoDB Atlas
- Configurar a string de conexão no .env
- O banco será criado automaticamente na primeira conexão

## 🏃‍♂️ Como Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Testes
```bash
npm test
npm run test:watch
```

## 📚 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Recuperar senha
- `POST /api/auth/reset-password` - Redefinir senha

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Criar paciente
- `GET /api/patients/:id` - Buscar paciente
- `PUT /api/patients/:id` - Atualizar paciente
- `DELETE /api/patients/:id` - Deletar paciente

### Avaliações Nutricionais
- `GET /api/nutritional-assessments` - Listar avaliações
- `POST /api/nutritional-assessments` - Criar avaliação
- `GET /api/nutritional-assessments/:id` - Buscar avaliação
- `PUT /api/nutritional-assessments/:id` - Atualizar avaliação

### Planos Alimentares
- `GET /api/diet-plans` - Listar planos
- `POST /api/diet-plans` - Criar plano
- `GET /api/diet-plans/:id` - Buscar plano
- `PUT /api/diet-plans/:id` - Atualizar plano

### Consultas
- `GET /api/consultations` - Listar consultas
- `POST /api/consultations` - Agendar consulta
- `GET /api/consultations/:id` - Buscar consulta
- `PUT /api/consultations/:id` - Atualizar consulta

### Blog
- `GET /api/blog/posts` - Listar posts
- `POST /api/blog/posts` - Criar post
- `GET /api/blog/posts/:id` - Buscar post
- `PUT /api/blog/posts/:id` - Atualizar post

### Relatórios
- `GET /api/reports` - Listar relatórios
- `POST /api/reports/generate` - Gerar relatório
- `GET /api/reports/:id/download` - Download relatório

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação:

```typescript
Authorization: Bearer <token>
```

### Níveis de Acesso
- **Admin**: Acesso total ao sistema
- **Nutritionist**: Gerenciar pacientes e planos nutricionais
- **Student**: Gerenciar próprios pacientes e dados

## 📊 Modelos de Dados

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: 'student' | 'nutritionist' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Patient
```typescript
{
  id: string;
  name: string;
  email?: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛡️ Segurança

- **Rate Limiting**: 100 requests por 15 minutos
- **CORS**: Configurado para frontend
- **Helmet**: Headers de segurança
- **Validação**: Joi para validação de entrada
- **Criptografia**: BCrypt para senhas

## 📈 Performance

- **Compressão**: Gzip habilitado
- **Caching**: Cache de queries implementado
- **Paginação**: Resultados paginados
- **Indexação**: Índices otimizados no Firestore

## 🧪 Testes

- **Unitários**: Jest + Supertest
- **Integração**: Testes de API
- **Cobertura**: Meta de 80%

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```dockerfile
# Disponível em breve
```

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato:
- Email: suporte@nutrition-project.com
- Issues: [GitHub Issues](https://github.com/nutrition-project/backend/issues)