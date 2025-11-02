import mongoose, { Schema, Document } from 'mongoose';

/**
 * 📧 CONVITE DE PACIENTE
 * Sistema para nutricionistas convidarem pacientes
 */
export interface IPatientInvite extends Document {
  nutritionistId: mongoose.Types.ObjectId;
  patientEmail?: string;
  patientName?: string;
  inviteToken: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date;
  sentAt: Date;
  acceptedAt?: Date;
  message?: string; // Mensagem personalizada do nutricionista
  createdAt: Date;
  updatedAt: Date;
}

const patientInviteSchema = new Schema<IPatientInvite>({
  nutritionistId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do nutricionista é obrigatório']
  },
  patientEmail: {
    type: String,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return !email || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Email inválido'
    }
  },
  patientName: {
    type: String,
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  inviteToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'],
    default: 'PENDING'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL para auto-cleanup
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  message: {
    type: String,
    maxlength: [500, 'Mensagem deve ter no máximo 500 caracteres']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Validação: deve ter email OU nome
patientInviteSchema.pre('validate', function() {
  if (!this.patientEmail && !this.patientName) {
    this.invalidate('patientEmail', 'Email ou nome do paciente é obrigatório');
  }
});

// Índices para performance
patientInviteSchema.index({ nutritionistId: 1, status: 1 });
patientInviteSchema.index({ patientEmail: 1, status: 1 });
patientInviteSchema.index({ inviteToken: 1 });

export const PatientInviteModel = mongoose.model<IPatientInvite>('PatientInvite', patientInviteSchema);