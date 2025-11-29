import FirebaseLoginIntegrated from '../../components/FirebaseLoginIntegrated';

/**
 * 🔥 PÁGINA DE TESTE FIREBASE
 * ===========================
 * Página para testar o sistema Firebase integrado
 */

export default function FirebaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔥 Firebase Authentication
          </h1>
          <p className="text-gray-600">
            Sistema integrado Firebase + Backend NutriPlan
          </p>
        </div>

        <FirebaseLoginIntegrated />

        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">📋 Como funciona:</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-600">
                🔐 Frontend (Firebase)
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Login com Google (OAuth)</li>
                <li>• Login com email/senha</li>
                <li>• Registro de novos usuários</li>
                <li>• Token JWT do Firebase</li>
                <li>• Recuperação de senha automática</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-600">
                🏥 Backend (NutriPlan)
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Integração com Firebase tokens</li>
                <li>• Criação automática de usuários</li>
                <li>• Roles (patient, nutritionist, admin)</li>
                <li>• Dados salvos no MongoDB</li>
                <li>• APIs protegidas por Firebase Auth</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Para Produção:</h4>
            <p className="text-sm text-yellow-700">
              1. Configure as variáveis de ambiente Firebase no `.env`<br/>
              2. Obtenha Service Account Key do Firebase Console<br/>
              3. Configure domínios autorizados no Firebase Console<br/>
              4. Teste todas as funcionalidades antes do deploy
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-800 mb-2">✅ Benefícios:</h4>
            <p className="text-sm text-green-700">
              • <strong>Sem problemas de email</strong> - Firebase cuida da autenticação<br/>
              • <strong>Login social</strong> - Google, Facebook, Apple, etc.<br/>
              • <strong>Segurança</strong> - Tokens JWT criptografados<br/>
              • <strong>Escalabilidade</strong> - Firebase escala automaticamente<br/>
              • <strong>UX moderna</strong> - Login em um clique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}