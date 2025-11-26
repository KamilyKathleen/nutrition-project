import mongoose, { Schema, Document } from 'mongoose';
import { Patient, Gender, Address } from '../types';

export interface IPatient extends Omit<Patient, 'id' | 'nutritionistId'>, Document {
  _id: string;
  nutritionistId: mongoose.Types.ObjectId;
}

const addressSchema = new Schema<Address>({
  street: {
    type: String,
    required: [true, 'Rua é obrigatória'],
    trim: true
  },
  number: {
    type: String,
    required: [true, 'Número é obrigatório'],
    trim: true
  },
  neighborhood: {
    type: String,
    required: [true, 'Bairro é obrigatório'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Cidade é obrigatória'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Estado é obrigatório'],
    trim: true,
    maxlength: [2, 'Estado deve ter 2 caracteres']
  },
  zipCode: {
    type: String,
    required: [true, 'CEP é obrigatório'],
    trim: true
  }
}, { _id: false });

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
    required: [true, 'Data de nascimento é obrigatória']
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: [true, 'Gênero é obrigatório']
  },
  address: {
    type: addressSchema,
    default: null
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
    return ret;
  }
});

export const PatientModel = mongoose.model<IPatient>('Patient', patientSchema);