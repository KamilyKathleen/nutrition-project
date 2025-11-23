/**
 * 🏥 MODELO DE CONSULTAS
 * ====================
 * Sistema completo de agendamento e gestão de consultas
 */

import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * 🎯 INTERFACE DA CONSULTA
 */
export interface IConsultation extends Document {
  patientId: mongoose.Types.ObjectId;
  nutritionistId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  actualDate?: Date;
  duration: number; // minutos
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  type: 'initial' | 'follow_up' | 'emergency' | 'online' | 'in_person';
  
  // Dados da consulta (coletados durante/após)
  weight?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  vitalSigns?: {
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
  
  // Conteúdo da consulta
  chiefComplaint?: string; // Queixa principal
  symptoms?: string[];
  currentMedications?: string;
  observations: string;
  recommendations: string;
  followUpInstructions?: string;
  
  // Próximos passos
  nextAppointment?: Date;
  prescriptions?: Array<{
    type: 'diet' | 'supplement' | 'exercise' | 'other';
    description: string;
    instructions: string;
    duration?: string;
  }>;
  
  // Arquivos anexados
  attachments?: Array<{
    filename: string;
    filepath: string;
    mimetype: string;
    uploadDate: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 🏗️ SCHEMA DA CONSULTA
 */
const consultationSchema = new Schema<IConsultation>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'ID do paciente é obrigatório'],
    index: true
  },
  nutritionistId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do nutricionista é obrigatório'],
    index: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Data agendada é obrigatória'],
    index: true,
    validate: {
      validator: function(date: Date) {
        return date >= new Date();
      },
      message: 'Data agendada não pode ser no passado'
    }
  },
  actualDate: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        if (!date) return true;
        return date <= new Date();
      },
      message: 'Data real não pode ser no futuro'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duração é obrigatória'],
    min: [15, 'Duração mínima é 15 minutos'],
    max: [240, 'Duração máxima é 4 horas'],
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  type: {
    type: String,
    enum: ['initial', 'follow_up', 'emergency', 'online', 'in_person'],
    required: [true, 'Tipo da consulta é obrigatório'],
    default: 'follow_up'
  },
  
  // Dados vitais
  weight: {
    type: Number,
    min: [1, 'Peso deve ser positivo'],
    max: [500, 'Peso muito alto']
  },
  bloodPressure: {
    systolic: {
      type: Number,
      min: [60, 'Pressão sistólica muito baixa'],
      max: [300, 'Pressão sistólica muito alta']
    },
    diastolic: {
      type: Number,
      min: [40, 'Pressão diastólica muito baixa'],
      max: [200, 'Pressão diastólica muito alta']
    }
  },
  vitalSigns: {
    heartRate: {
      type: Number,
      min: [30, 'Frequência cardíaca muito baixa'],
      max: [250, 'Frequência cardíaca muito alta']
    },
    temperature: {
      type: Number,
      min: [30, 'Temperatura muito baixa'],
      max: [45, 'Temperatura muito alta']
    },
    oxygenSaturation: {
      type: Number,
      min: [70, 'Saturação de oxigênio muito baixa'],
      max: [100, 'Saturação de oxigênio máxima é 100%']
    }
  },
  
  // Conteúdo clínico (criptografado)
  chiefComplaint: {
    type: String,
    trim: true,
    maxlength: [500, 'Queixa principal muito longa'],
    set: encrypt,
    get: decrypt
  },
  symptoms: [{
    type: String,
    trim: true,
    maxlength: [200, 'Sintoma muito longo']
  }],
  currentMedications: {
    type: String,
    trim: true,
    maxlength: [1000, 'Lista de medicamentos muito longa'],
    set: encrypt,
    get: decrypt
  },
  observations: {
    type: String,
    required: [true, 'Observações são obrigatórias'],
    trim: true,
    maxlength: [2000, 'Observações muito longas'],
    set: encrypt,
    get: decrypt
  },
  recommendations: {
    type: String,
    required: [true, 'Recomendações são obrigatórias'],
    trim: true,
    maxlength: [2000, 'Recomendações muito longas'],
    set: encrypt,
    get: decrypt
  },
  followUpInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instruções de acompanhamento muito longas'],
    set: encrypt,
    get: decrypt
  },
  
  // Próximos passos
  nextAppointment: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        if (!date) return true;
        return date > new Date();
      },
      message: 'Próxima consulta deve ser no futuro'
    }
  },
  prescriptions: [{
    type: {
      type: String,
      enum: ['diet', 'supplement', 'exercise', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Descrição muito longa']
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Instruções muito longas']
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [100, 'Duração muito longa']
    }
  }],
  
  // Anexos
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    filepath: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { getters: true },
  toObject: { getters: true }
});

/**
 * 🎯 MIDDLEWARES
 */

// Middleware para validar conflito de horários
consultationSchema.pre('save', async function(next) {
  if (!this.isNew && !this.isModified('scheduledDate')) {
    return next();
  }

  const consultationTime = this.scheduledDate;
  const endTime = new Date(consultationTime.getTime() + (this.duration * 60000));

  // Verificar conflitos para o nutricionista
  const conflicts = await mongoose.model('Consultation').find({
    _id: { $ne: this._id },
    nutritionistId: this.nutritionistId,
    status: { $in: ['scheduled', 'rescheduled'] },
    $or: [
      {
        scheduledDate: {
          $gte: consultationTime,
          $lt: endTime
        }
      },
      {
        $expr: {
          $and: [
            { $lte: '$scheduledDate', consultationTime },
            { 
              $gt: {
                $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }]
              },
              consultationTime
            }
          ]
        }
      }
    ]
  });

  if (conflicts.length > 0) {
    const error = new Error('Conflito de horário: nutricionista já tem consulta agendada neste período');
    return next(error);
  }

  next();
});

// Middleware para atualizar status automaticamente
consultationSchema.pre('save', function(next) {
  const now = new Date();
  
  // Se a consulta passou e ainda está agendada, marcar como no_show
  if (this.status === 'scheduled' && this.scheduledDate < now && !this.actualDate) {
    const timePassed = now.getTime() - this.scheduledDate.getTime();
    const gracePeriod = 30 * 60 * 1000; // 30 minutos
    
    if (timePassed > gracePeriod) {
      this.status = 'no_show';
    }
  }
  
  next();
});

/**
 * 🎯 ÍNDICES
 */
consultationSchema.index({ patientId: 1, scheduledDate: -1 });
consultationSchema.index({ nutritionistId: 1, scheduledDate: -1 });
consultationSchema.index({ status: 1, scheduledDate: -1 });
consultationSchema.index({ scheduledDate: 1, status: 1 });

/**
 * 🎯 MÉTODOS ESTÁTICOS
 */

// Buscar consultas por período
consultationSchema.statics.findByDateRange = function(
  nutritionistId: string,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    nutritionistId: new mongoose.Types.ObjectId(nutritionistId),
    scheduledDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('patientId', 'name email phone');
};

// Estatísticas do nutricionista
consultationSchema.statics.getStatistics = function(nutritionistId: string) {
  return this.aggregate([
    {
      $match: {
        nutritionistId: new mongoose.Types.ObjectId(nutritionistId)
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
};

/**
 * 🎯 MÉTODOS DE INSTÂNCIA
 */

// Calcular duração real da consulta
consultationSchema.methods.getActualDuration = function() {
  if (!this.actualDate) return null;
  
  const start = this.scheduledDate.getTime();
  const end = this.actualDate.getTime();
  return Math.round((end - start) / (1000 * 60)); // em minutos
};

// Verificar se está atrasada
consultationSchema.methods.isLate = function() {
  if (this.status !== 'scheduled') return false;
  return new Date() > this.scheduledDate;
};

// Gerar resumo da consulta
consultationSchema.methods.getSummary = function() {
  return {
    id: this._id,
    patient: this.patientId,
    date: this.scheduledDate,
    status: this.status,
    type: this.type,
    duration: this.duration,
    hasVitalSigns: !!(this.weight || this.bloodPressure || this.vitalSigns),
    prescriptionsCount: this.prescriptions?.length || 0,
    attachmentsCount: this.attachments?.length || 0
  };
};

const ConsultationModel = mongoose.model<IConsultation>('Consultation', consultationSchema);

export default ConsultationModel;