const mongoose = require('mongoose');

async function cleanupDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('✅ MongoDB conectado');

    const db = mongoose.connection.db;
    
    // Verificar se a coleção users existe
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length > 0) {
      console.log('📂 Coleção users encontrada');
      
      // Listar todos os índices
      const indexes = await db.collection('users').indexes();
      console.log('📋 Índices atuais:', indexes.map(i => i.name));
      
      // Remover o índice firebaseUid_1 se existir
      try {
        await db.collection('users').dropIndex('firebaseUid_1');
        console.log('🗑️ Índice firebaseUid_1 removido');
      } catch (error) {
        console.log('ℹ️ Índice firebaseUid_1 não existe ou já foi removido');
      }
      
      // Remover documentos com firebaseUid: null
      const result = await db.collection('users').deleteMany({ firebaseUid: null });
      console.log(`🧹 Removidos ${result.deletedCount} documentos com firebaseUid: null`);
      
      // Recriar o índice sparse corretamente
      await db.collection('users').createIndex(
        { firebaseUid: 1 }, 
        { 
          unique: true, 
          sparse: true,
          name: 'firebaseUid_1_sparse'
        }
      );
      console.log('✅ Novo índice sparse criado');
      
    } else {
      console.log('ℹ️ Coleção users não existe');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado');
    process.exit(0);
  }
}

cleanupDB();