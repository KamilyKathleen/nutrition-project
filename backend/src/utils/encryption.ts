import crypto from 'node:crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes
const ALGORITHM = 'aes-256-cbc';

/**
 * 🔐 CRIPTOGRAFIA DE DADOS SENSÍVEIS
 * Usado para proteger CPF, dados médicos, etc.
 */
export const encrypt = (text: string): string => {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Erro na criptografia:', error);
    return text; // Fallback - não criptografado
  }
};

/**
 * 🔓 DESCRIPTOGRAFIA DE DADOS SENSÍVEIS
 */
export const decrypt = (encryptedText: string): string => {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText;
    
    const [ivHex, encrypted] = parts;
    if (!ivHex || !encrypted) return encryptedText;
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro na descriptografia:', error);
    return encryptedText; // Fallback - retorna como está
  }
};

/**
 * 🔗 HASH PARA BUSCA (CPF, email)
 * Permite busca sem expor o dado original
 */
export const hashForSearch = (data: string): string => {
  if (!data) return '';
  
  return crypto
    .createHash('sha256')
    .update(data + (process.env.HASH_SALT || 'nutrition-app-salt'))
    .digest('hex');
};

/**
 * 🎭 ANONYMIZAÇÃO DE DADOS
 * Para relatórios e análises
 */
export const anonymizeString = (str: string, showLength: number = 3): string => {
  if (!str || str.length <= showLength) return '***';
  
  const visible = str.substring(0, showLength);
  const hidden = '*'.repeat(str.length - showLength);
  
  return visible + hidden;
};

/**
 * 📊 ANONYMIZAR DADOS DE PACIENTE
 */
export const anonymizePatient = (patient: any) => ({
  id: patient.id,
  ageRange: calculateAgeRange(patient.birthDate),
  gender: patient.gender,
  region: patient.address?.state || 'Não informado',
  hasAllergies: patient.allergies?.length > 0,
  allergiesCount: patient.allergies?.length || 0,
  medicationsCount: patient.medications?.length || 0,
  hasEmergencyContact: !!patient.emergencyContact,
  // Dados removidos para anonimização
  // name, cpf, phone, address completo, etc.
});

/**
 * 📅 CALCULAR FAIXA ETÁRIA
 */
const calculateAgeRange = (birthDate: Date): string => {
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  
  if (age < 18) return '0-17';
  if (age < 30) return '18-29';
  if (age < 50) return '30-49';
  if (age < 65) return '50-64';
  return '65+';
};