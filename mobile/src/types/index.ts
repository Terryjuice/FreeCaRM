export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'inspector' | 'admin';
  phoneNumber?: string;
  company?: string;
  avatar?: string;
}

export interface VehicleInfo {
  vin?: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  mileage?: number;
  color?: string;
}

export interface InspectionImage {
  angle: ImageAngle;
  url: string;
  uploadedAt: Date;
  analyzed: boolean;
}

export type ImageAngle =
  | 'front'
  | 'rear'
  | 'left_side'
  | 'right_side'
  | 'front_left'
  | 'front_right'
  | 'rear_left'
  | 'rear_right'
  | 'interior'
  | 'dashboard'
  | 'vin_plate'
  | 'damage_closeup';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Inspection {
  _id: string;
  userId: string;
  vehicleInfo: VehicleInfo;
  status: 'draft' | 'in_progress' | 'analyzing' | 'completed' | 'cancelled';
  images: InspectionImage[];
  damages: Damage[];
  totalEstimatedCost: number;
  notes?: string;
  location?: Location;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Damage {
  _id: string;
  inspectionId: string;
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
