import mongoose, { Document, Schema } from 'mongoose';

export interface IDamage extends Document {
  inspectionId: mongoose.Types.ObjectId;
  type: 'scratch' | 'dent' | 'crack' | 'paint_damage' | 'broken_part' | 'rust' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  location: {
    part: string;
    side: 'front' | 'rear' | 'left' | 'right' | 'top' | 'interior';
  };
  imageUrl: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  estimatedCost: {
    labor: number;
    parts: number;
    total: number;
  };
  description?: string;
  aiDetected: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DamageSchema = new Schema<IDamage>(
  {
    inspectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Inspection',
      required: true,
    },
    type: {
      type: String,
      enum: ['scratch', 'dent', 'crack', 'paint_damage', 'broken_part', 'rust', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe'],
      required: true,
    },
    location: {
      part: {
        type: String,
        required: true,
        trim: true,
      },
      side: {
        type: String,
        enum: ['front', 'rear', 'left', 'right', 'top', 'interior'],
        required: true,
      },
    },
    imageUrl: {
      type: String,
      required: true,
    },
    boundingBox: {
      x: { type: Number },
      y: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    estimatedCost: {
      labor: { type: Number, default: 0 },
      parts: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    description: {
      type: String,
    },
    aiDetected: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
DamageSchema.index({ inspectionId: 1 });
DamageSchema.index({ type: 1, severity: 1 });

export default mongoose.model<IDamage>('Damage', DamageSchema);
