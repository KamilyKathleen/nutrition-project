/**
 * 🍽️ MODELO DE PLANO DIETÉTICO
 * ============================
 * Sistema completo de planos alimentares personalizados
 */

import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '@/utils/encryption';

/**
 * 🎯 INTERFACE DO PLANO DIETÉTICO
 */
export interface IDietPlan extends Document {
  patientId: mongoose.Types.ObjectId;
  nutritionistId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  targetCalories: number;
  targetProteins: number; // gramas
  targetCarbohydrates: number; // gramas
  targetFats: number; // gramas
  meals: Array<{
    type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
    time: string; // formato HH:MM
    foods: Array<{
      name: string;
      quantity: number;
      unit: string;
      calories?: number;
      proteins?: number;
      carbohydrates?: number;
      fats?: number;
      fiber?: number;
    }>;
    instructions?: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Métodos de instância
  getNutritionalSummary(): any;
}

/**
 * 🍽️ SCHEMA DO PLANO DIETÉTICO
 */
const dietPlanSchema = new Schema<IDietPlan>({
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
  title: {
    type: String,
    required: [true, 'Título do plano é obrigatório'],
    trim: true,
    minlength: [3, 'Título deve ter pelo menos 3 caracteres'],
    maxlength: [100, 'Título deve ter no máximo 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição deve ter no máximo 500 caracteres'],
    // 🔐 Criptografia para descrições sensíveis
    set: encrypt,
    get: decrypt
  },
  startDate: {
    type: Date,
    required: [true, 'Data de início é obrigatória'],
    index: true
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: IDietPlan, endDate: Date) {
        return !endDate || endDate > this.startDate;
      },
      message: 'Data de fim deve ser posterior à data de início'
    }
  },
  targetCalories: {
    type: Number,
    required: [true, 'Meta de calorias é obrigatória'],
    min: [400, 'Meta de calorias deve ser pelo menos 400 kcal'],
    max: [15000, 'Meta de calorias deve ser no máximo 15000 kcal']
  },
  targetProteins: {
    type: Number,
    required: [true, 'Meta de proteínas é obrigatória'],
    min: [20, 'Meta de proteínas deve ser pelo menos 20g'],
    max: [300, 'Meta de proteínas deve ser no máximo 300g']
  },
  targetCarbohydrates: {
    type: Number,
    required: [true, 'Meta de carboidratos é obrigatória'],
    min: [50, 'Meta de carboidratos deve ser pelo menos 50g'],
    max: [800, 'Meta de carboidratos deve ser no máximo 800g']
  },
  targetFats: {
    type: Number,
    required: [true, 'Meta de gorduras é obrigatória'],
    min: [20, 'Meta de gorduras deve ser pelo menos 20g'],
    max: [200, 'Meta de gorduras deve ser no máximo 200g']
  },
  meals: [{
    type: {
      type: String,
      enum: ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'],
      required: [true, 'Tipo de refeição é obrigatório']
    },
    time: {
      type: String,
      required: [true, 'Horário da refeição é obrigatório'],
      validate: {
        validator: (time: string) => /^([0-1]?\d|2[0-3]):[0-5]\d$/.test(time),
        message: 'Formato de horário inválido (HH:MM)'
      }
    },
    foods: [{
      name: {
        type: String,
        required: [true, 'Nome do alimento é obrigatório'],
        trim: true,
        minlength: [2, 'Nome do alimento deve ter pelo menos 2 caracteres'],
        maxlength: [100, 'Nome do alimento deve ter no máximo 100 caracteres']
      },
      quantity: {
        type: Number,
        required: [true, 'Quantidade é obrigatória'],
        min: [0.1, 'Quantidade deve ser maior que 0']
      },
      unit: {
        type: String,
        required: [true, 'Unidade é obrigatória'],
        enum: ['g', 'kg', 'ml', 'l', 'unidade', 'fatia', 'colher', 'xícara', 'copo', 'porção']
      },
      calories: {
        type: Number,
        min: [0, 'Calorias não podem ser negativas'],
        max: [10000, 'Calorias por alimento não podem exceder 10000 kcal']
      },
      proteins: {
        type: Number,
        min: [0, 'Proteínas não podem ser negativas'],
        max: [10000, 'Proteínas por alimento não podem exceder 10000g']
      },
      carbohydrates: {
        type: Number,
        min: [0, 'Carboidratos não podem ser negativos'],
        max: [20000, 'Carboidratos por alimento não podem exceder 20000g']
      },
      fats: {
        type: Number,
        min: [0, 'Gorduras não podem ser negativas'],
        max: [10000, 'Gorduras por alimento não podem exceder 10000g']
      },
      fiber: {
        type: Number,
        min: [0, 'Fibras não podem ser negativas'],
        max: [10000, 'Fibras por alimento não podem exceder 10000g']
      }
    }],
    instructions: {
      type: String,
      trim: true,
      maxlength: [300, 'Instruções devem ter no máximo 300 caracteres'],
      // 🔐 Criptografia para instruções sensíveis
      set: encrypt,
      get: decrypt
    }
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { getters: true },
  toObject: { getters: true }
});

/**
 * 🎯 MIDDLEWARE PARA VALIDAR APENAS UM PLANO ATIVO POR PACIENTE
 */
dietPlanSchema.pre('save', async function(next) {
  if (this.isActive && this.isNew) {
    // Desativar outros planos ativos do mesmo paciente
    await mongoose.model('DietPlan').updateMany(
      { 
        patientId: this.patientId, 
        isActive: true,
        _id: { $ne: this._id }
      },
      { isActive: false }
    );
  }
  next();
});

/**
 * 📊 MIDDLEWARE PARA CALCULAR TOTAIS NUTRICIONAIS
 */
dietPlanSchema.pre('save', function(next) {
  let totalCalories = 0;
  let totalProteins = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  this.meals.forEach(meal => {
    meal.foods.forEach(food => {
      totalCalories += food.calories || 0;
      totalProteins += food.proteins || 0;
      totalCarbs += food.carbohydrates || 0;
      totalFats += food.fats || 0;
    });
  });

  // Armazenar totais calculados como propriedades virtuais
  (this as any).calculatedCalories = totalCalories;
  (this as any).calculatedProteins = totalProteins;
  (this as any).calculatedCarbs = totalCarbs;
  (this as any).calculatedFats = totalFats;

  next();
});

/**
 * 📅 MIDDLEWARE PARA AUTO-DESATIVAR PLANOS EXPIRADOS
 */
dietPlanSchema.pre('find', function() {
  // Desativar planos que passaram da data de fim
  this.updateMany(
    { 
      endDate: { $lt: new Date() },
      isActive: true 
    },
    { isActive: false }
  );
});

/**
 * 🔍 ÍNDICES PARA PERFORMANCE
 */
dietPlanSchema.index({ patientId: 1, isActive: 1 });
dietPlanSchema.index({ nutritionistId: 1, isActive: 1 });
dietPlanSchema.index({ startDate: 1, endDate: 1 });
dietPlanSchema.index({ createdAt: -1 });

/**
 * 🎯 MÉTODOS VIRTUAIS
 */
dietPlanSchema.virtual('duration').get(function() {
  if (!this.endDate) return null;
  const diffTime = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // dias
});

dietPlanSchema.virtual('isExpired').get(function() {
  return this.endDate && this.endDate < new Date();
});

dietPlanSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const diffTime = this.endDate.getTime() - new Date().getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
});

/**
 * 🎯 MÉTODOS DE INSTÂNCIA
 */
dietPlanSchema.methods.getNutritionalSummary = function() {
  let totalCalories = 0;
  let totalProteins = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalFiber = 0;

  this.meals.forEach((meal: any) => {
    meal.foods.forEach((food: any) => {
      totalCalories += food.calories || 0;
      totalProteins += food.proteins || 0;
      totalCarbs += food.carbohydrates || 0;
      totalFats += food.fats || 0;
      totalFiber += food.fiber || 0;
    });
  });

  return {
    calculated: {
      calories: totalCalories,
      proteins: totalProteins,
      carbohydrates: totalCarbs,
      fats: totalFats,
      fiber: totalFiber
    },
    targets: {
      calories: this.targetCalories,
      proteins: this.targetProteins,
      carbohydrates: this.targetCarbohydrates,
      fats: this.targetFats
    },
    compliance: {
      calories: Math.round((totalCalories / this.targetCalories) * 100),
      proteins: Math.round((totalProteins / this.targetProteins) * 100),
      carbohydrates: Math.round((totalCarbs / this.targetCarbohydrates) * 100),
      fats: Math.round((totalFats / this.targetFats) * 100)
    }
  };
};

export const DietPlanModel = mongoose.model<IDietPlan>('DietPlan', dietPlanSchema);