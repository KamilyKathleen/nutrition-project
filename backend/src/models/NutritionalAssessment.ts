import mongoose, { Schema, Document, Types } from 'mongoose';
import { NutritionalAssessment, AnthropometricData, FoodRecord, PhysicalActivity, LabResult, LabResultStatus, MealType, ActivityIntensity } from '@/types';

export interface INutritionalAssessment extends Omit<NutritionalAssessment, 'id' | 'patientId' | 'studentId'>, Document {
  _id: string;
  patientId: Types.ObjectId;
  studentId: Types.ObjectId;
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

const labResultSchema = new Schema<LabResult>({
  testName: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  referenceRange: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: Object.values(LabResultStatus), required: true }
});

const nutritionalAssessmentSchema = new Schema<INutritionalAssessment>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'ID do paciente é obrigatório']
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do aluno é obrigatório']
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
  labResults: [labResultSchema],
  observations: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
nutritionalAssessmentSchema.index({ patientId: 1 });
nutritionalAssessmentSchema.index({ studentId: 1 });
nutritionalAssessmentSchema.index({ createdAt: -1 });

// Transform function
nutritionalAssessmentSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (ret.patientId) ret.patientId = ret.patientId.toString();
    if (ret.studentId) ret.studentId = ret.studentId.toString();
    return ret;
  }
});

export const NutritionalAssessmentModel = mongoose.model<INutritionalAssessment>('NutritionalAssessment', nutritionalAssessmentSchema);