/**
 * 🔍 SCRIPT DE DEBUG - COPIE E COLE NO CONSOLE DO NAVEGADOR
 * ===========================================================
 * Para verificar o estado da autenticação
 */

console.log('\n🔍 ===== DEBUG DE AUTENTICAÇÃO =====\n');

// 1. Verificar localStorage
const token = localStorage.getItem('authToken');
const user = localStorage.getItem('nutriplan_user');

console.log('📦 localStorage.authToken:', token ? '✅ EXISTE' : '❌ NÃO EXISTE');
if (token) {
    console.log('   Preview:', token.substring(0, 50) + '...');
    
    // Tentar decodificar JWT
    try {
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('   Payload decodificado:', payload);
            
            // Verificar expiração
            if (payload.exp) {
                const expDate = new Date(payload.exp * 1000);
                const now = new Date();
                const isExpired = expDate < now;
                console.log('   Expira em:', expDate.toLocaleString('pt-BR'));
                console.log('   Status:', isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO');
            }
        }
    } catch (e) {
        console.error('   ❌ Erro ao decodificar JWT:', e.message);
    }
}

console.log('\n👤 localStorage.nutriplan_user:', user ? '✅ EXISTE' : '❌ NÃO EXISTE');
if (user) {
    try {
        const userData = JSON.parse(user);
        console.log('   Dados do usuário:', userData);
    } catch (e) {
        console.error('   ❌ Erro ao parsear user:', e.message);
    }
}

// 2. Testar requisição ao backend
console.log('\n🌐 Testando requisição ao backend...\n');
fetch('http://localhost:8000/api/blog', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        title: 'Teste de Post - Debug',
        excerpt: 'Este é um post de teste para debug de autenticação do sistema.',
        content: 'Conteúdo de teste com mais de 200 caracteres para atender aos requisitos mínimos do sistema de blog. Este post está sendo criado apenas para verificar se a autenticação está funcionando corretamente e se o token JWT está sendo validado pelo backend.',
        category: 'nutrition',
        tags: ['teste', 'debug'],
        status: 'draft'
    })
})
.then(response => {
    console.log('📡 Status da resposta:', response.status, response.statusText);
    return response.json();
})
.then(data => {
    console.log('✅ Resposta do backend:', data);
})
.catch(error => {
    console.error('❌ Erro na requisição:', error);
});

console.log('\n🔍 ===== FIM DO DEBUG =====\n');
