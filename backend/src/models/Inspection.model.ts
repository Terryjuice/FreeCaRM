import mongoose, { Document, Schema } from 'mongoose';

export interface IInspection extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleInfo: {
    vin?: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
    mileage?: number;
    color?: string;
  };
  status: 'draft' | 'in_progress' | 'analyzing' | 'completed' | 'cancelled';
  images: {
    angle: string;
    url: string;
    uploadedAt: Date;
    analyzed: boolean;
  }[];
  damages: mongoose.Types.ObjectId[];
  totalEstimatedCost: number;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const InspectionSchema = new Schema<IInspection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleInfo: {
      vin: { type: String, uppercase: true, trim: true },
      make: { type: String, required: true, trim: true },
      model: { type: String, required: true, trim: true },
      year: { type: Number, required: true },
      licensePlate: { type: String, uppercase: true, trim: true },
      mileage: { type: Number },
      color: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'analyzing', 'completed', 'cancelled'],
      default: 'draft',
    },
    images: [
      {
        angle: {
          type: String,
          required: true,
          enum: [
            'front',
            'rear',
            'left_side',
            'right_side',
            'front_left',
            'front_right',
            'rear_left',
            'rear_right',
            'interior',
            'dashboard',
            'vin_plate',
            'damage_closeup',
          ],
        },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        analyzed: { type: Boolean, default: false },
      },
    ],
    damages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Damage',
      },
    ],
    totalEstimatedCost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
InspectionSchema.index({ userId: 1, createdAt: -1 });
InspectionSchema.index({ status: 1 });
InspectionSchema.index({ 'vehicleInfo.vin': 1 });

export default mongoose.model<IInspection>('Inspection', InspectionSchema);
