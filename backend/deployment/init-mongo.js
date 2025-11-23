// 🚀 Script de Inicialização do MongoDB
// Por que precisamos desse script?
// - Cria usuário específico para a aplicação
// - Define permissões corretas
// - Cria estrutura inicial do banco

// 👤 Criar usuário da aplicação
db = db.getSiblingDB('nutrition_db');

// 🔒 Usuário com permissões específicas
db.createUser({
  user: 'nutrition_app',
  pwd: 'nutrition_app_2024',
  roles: [
    {
      role: 'readWrite',        // Pode ler e escrever
      db: 'nutrition_db'        // Apenas neste banco
    }
  ]
});

// 📋 Criar coleções iniciais (opcional)
db.createCollection('users');
db.createCollection('patients');
db.createCollection('nutritional_assessments');
db.createCollection('diet_plans');
db.createCollection('consultations');
db.createCollection('blog_posts');
db.createCollection('reports');

// 🔍 Criar índices importantes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "cpf": 1 }, { unique: true });
db.patients.createIndex({ "cpf": 1 }, { unique: true });
db.patients.createIndex({ "userId": 1 });

// ✅ Log de sucesso
print('🎉 Banco nutrition_db inicializado com sucesso!');
print('👤 Usuário nutrition_app criado');
print('📋 Coleções criadas');
print('🔍 Índices configurados');