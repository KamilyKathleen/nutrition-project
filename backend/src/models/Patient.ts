import mongoose, { Schema, Document } from 'mongoose';
import { Patient, Gender } from '../types';

export interface IPatient extends Omit<Patient, 'id' | 'nutritionistId' | 'userId' | '_id'>, Document {
  nutritionistId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  status?: 'linked' | 'not_linked' | 'invite_pending';
}

const patientSchema = new Schema<IPatient>({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    sparse: true, // Allows multiple null values
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return !email || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Email inválido'
    }
  },
  birthDate: {
    type: Date,
    required: false // Tornando opcional temporariamente
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: false // Tornando opcional temporariamente
  },
  notes: {
    type: String,
    trim: true
  },
  nutritionistId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do nutricionista é obrigatório']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // Opcional, usado quando paciente é vinculado a uma conta de usuário
  },
  status: {
    type: String,
    enum: ['linked', 'not_linked', 'invite_pending'],
    default: 'not_linked'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
patientSchema.index({ nutritionistId: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ isActive: 1 });
patientSchema.index({ name: 'text' }); // Text search index

// Transform function to format output
patientSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.nutritionistId) {
      ret.nutritionistId = ret.nutritionistId.toString();
    }
    if (ret.userId) {
      ret.userId = ret.userId.toString();
    }
    return ret;
  }
});

export const PatientModel = mongoose.model<IPatient>('Patient', patientSchema);