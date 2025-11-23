import mongoose, { Schema, Document } from 'mongoose';
import { User, UserRole } from '../types';

export interface IUser extends Omit<User, 'id'>, Document {
  _id: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Email inválido'
    }
  },
  // 🔥 CPF e phone removidos para usuários Firebase básicos
  // Usuários Firebase são identificados apenas por firebaseUid
  crn: {
    type: String,
    required: function(this: IUser): boolean {
      return this.role === 'nutritionist';
    },
    validate: {
      validator: function(crn: string) {
        return !crn || /^CRN-\d\/\d{4,5}$/.test(crn);
      },
      message: 'CRN deve ter formato válido (ex: CRN-3/1234)'
    }
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [8, 'Senha deve ter pelo menos 8 caracteres'],
    maxlength: [12, 'Senha deve ter no máximo 12 caracteres']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: [true, 'Tipo de usuário é obrigatório']
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // 🔥 Firebase fields - OBRIGATÓRIOS para usuários Firebase
  firebaseUid: {
    type: String,
    required: [true, 'Firebase UID é obrigatório'],
    unique: true,
    index: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  versionKey: false
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Transform function to format output
userSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Never return password in JSON
    return ret;
  }
});

export const UserModel = mongoose.model<IUser>('User', userSchema);