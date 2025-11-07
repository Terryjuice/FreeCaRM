import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  userId: mongoose.Types.ObjectId;
  anthropicApiKey?: string;
  preferences: {
    autoAnalyze: boolean;
    notificationsEnabled: boolean;
    defaultLaborRate?: number;
    defaultPartsMarkup?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    anthropicApiKey: {
      type: String,
      select: false, // Don't return in queries by default for security
    },
    preferences: {
      autoAnalyze: {
        type: Boolean,
        default: false,
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      defaultLaborRate: {
        type: Number,
      },
      defaultPartsMarkup: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);
