// Script de inicialização do MongoDB
// Este arquivo é executado automaticamente quando o container é criado pela primeira vez

db = db.getSiblingDB('nutrition_db');

// Criar coleções se não existirem
db.createCollection('users');
db.createCollection('patients');
db.createCollection('consultations');
db.createCollection('patientinvites');

print('✅ Banco de dados nutrition_db inicializado com sucesso!');
