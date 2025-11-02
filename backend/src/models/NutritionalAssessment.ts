import mongoose, { Schema, Document, Types } from 'mongoose';
import { NutritionalAssessment, AnthropometricData, FoodRecord, PhysicalActivity, MealType, ActivityIntensity } from '@/types';
import { encrypt, decrypt } from '@/utils/encryption';

export interface INutritionalAssessment extends Omit<NutritionalAssessment, 'id' | 'patientId' | 'nutritionistId'>, Document {
  _id: string;
  patientId: Types.ObjectId;
  nutritionistId: Types.ObjectId; // Atualizado para nutritionistId
}

const skinfoldMeasurementSchema = new Schema({
  location: { type: String, required: true },
  measurement: { type: Number, required: true }
}, { _id: false });

const anthropometricDataSchema = new Schema<AnthropometricData>({
  height: { type: Number, required: true, min: 50, max: 250 },
  weight: { type: Number, required: true, min: 20, max: 300 },
  bmi: { type: Number, min: 10, max: 50 },
  waistCircumference: { type: Number, min: 40, max: 200 },
  hipCircumference: { type: Number, min: 40, max: 200 },
  bodyFatPercentage: { type: Number, min: 0, max: 100 },
  muscleMass: { type: Number, min: 0, max: 100 },
  boneDensity: { type: Number, min: 0, max: 10 },
  skinfoldMeasurements: [skinfoldMeasurementSchema]
}, { _id: false });

const foodItemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  calories: { type: Number, min: 0 },
  proteins: { type: Number, min: 0 },
  carbohydrates: { type: Number, min: 0 },
  fats: { type: Number, min: 0 },
  fiber: { type: Number, min: 0 }
}, { _id: false });

const mealSchema = new Schema({
  type: { type: String, enum: Object.values(MealType), required: true },
  time: { type: String, required: true },
  foods: [foodItemSchema],
  calories: { type: Number, min: 0 }
}, { _id: false });

const foodRecordSchema = new Schema<FoodRecord>({
  date: { type: Date, required: true },
  meals: [mealSchema],
  totalCalories: { type: Number, min: 0 },
  notes: { type: String }
}, { _id: false });

const activitySchema = new Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true, min: 0 },
  intensity: { type: String, enum: Object.values(ActivityIntensity), required: true },
  frequency: { type: Number, required: true, min: 0, max: 7 }
}, { _id: false });

const physicalActivitySchema = new Schema<PhysicalActivity>({
  weeklyFrequency: { type: Number, required: true, min: 0, max: 7 },
  activities: [activitySchema],
  sedentaryTime: { type: Number, required: true, min: 0, max: 24 }
}, { _id: false });

const nutritionalAssessmentSchema = new Schema<INutritionalAssessment>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'ID do paciente é obrigatório']
  },
  nutritionistId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do nutricionista é obrigatório']
  },
  anthropometricData: {
    type: anthropometricDataSchema,
    required: [true, 'Dados antropométricos são obrigatórios']
  },
  foodRecord: {
    type: foodRecordSchema,
    default: null
  },
  physicalActivity: {
    type: physicalActivitySchema,
    default: null
  },
  observations: {
    type: String,
    trim: true,
    // Criptografia para observações sensíveis
    set: encrypt,
    get: decrypt
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes
nutritionalAssessmentSchema.index({ patientId: 1 });
nutritionalAssessmentSchema.index({ nutritionistId: 1 }); 
nutritionalAssessmentSchema.index({ createdAt: -1 });

// Transform function
nutritionalAssessmentSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.patientId) ret.patientId = ret.patientId.toString();
    if (ret.nutritionistId) ret.nutritionistId = ret.nutritionistId.toString();
    return ret;
  }
});

export const NutritionalAssessmentModel = mongoose.model<INutritionalAssessment>('NutritionalAssessment', nutritionalAssessmentSchema);