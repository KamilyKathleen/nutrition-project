// Script para testar autenticação
console.log('=== DEBUG AUTENTICAÇÃO ===');
console.log('localStorage.authToken:', localStorage.getItem('authToken'));
console.log('localStorage.nutriplan_user:', localStorage.getItem('nutriplan_user'));
console.log('\n=== Teste de Requisição ===');
const token = localStorage.getItem('authToken');
if (token) {
  console.log('Token encontrado:', token.substring(0, 50) + '...');
  // Decodificar JWT (simples)
  const parts = token.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]));
    console.log('Payload do JWT:', payload);
  }
} else {
  console.log('❌ Nenhum token encontrado!');
}
