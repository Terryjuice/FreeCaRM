import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import * as fs from 'fs';
import { ClaudeVisionService } from './claudeVisionService';

interface DetectedDamage {
  type: 'scratch' | 'dent' | 'crack' | 'paint_damage' | 'broken_part' | 'rust' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  location: {
    part: string;
    side: 'front' | 'rear' | 'left' | 'right' | 'top' | 'interior';
  };
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

export class DamageDetectionService {
  private model: tf.GraphModel | null = null;
  private readonly modelPath = process.env.MODEL_PATH || './models';
  private claudeVisionService: ClaudeVisionService;

  constructor() {
    this.loadModel();
    this.claudeVisionService = new ClaudeVisionService();
  }

  private async loadModel(): Promise<void> {
    try {
      // In production, load actual trained model
      // For now, we'll use a mock implementation
      console.log('⚠️  Using mock AI model for damage detection');
      console.log('   In production, load your trained YOLO/TensorFlow model here');
    } catch (error) {
      console.error('Failed to load AI model:', error);
    }
  }

  public setClaudeApiKey(apiKey: string): void {
    this.claudeVisionService.setApiKey(apiKey);
  }

  async detectDamages(imagePath: string): Promise<DetectedDamage[]> {
    try {
      // Use Claude Vision API if configured
      if (this.claudeVisionService.isConfigured()) {
        console.log('🤖 Using Claude Vision API for damage detection');
        const claudeResults = await this.claudeVisionService.analyzeDamage(imagePath);

        // Convert Claude results to DetectedDamage format
        return claudeResults.map((result) => ({
          type: result.type,
          severity: result.severity,
          location: result.location,
          boundingBox: {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          }, // Claude doesn't provide bounding boxes in this implementation
          confidence: result.confidence,
        }));
      }

      // Fallback to mock detection
      console.log('⚠️  Using mock detection (Claude API not configured)');
      const mockDamages = await this.mockDetection(imagePath);
      return mockDamages;
    } catch (error) {
      console.error('Damage detection error:', error);
      // Fallback to mock on error
      return this.mockDetection(imagePath);
    }
  }

  private async preprocessImage(imagePath: string): Promise<Buffer> {
    // Resize and normalize image for model input
    const processedImage = await sharp(imagePath)
      .resize(640, 640, { fit: 'contain', background: { r: 0, g: 0, b: 0 } })
      .toBuffer();

    return processedImage;
  }

  private async mockDetection(imagePath: string): Promise<DetectedDamage[]> {
    // Mock detection - in production, replace with actual AI inference
    const damages: DetectedDamage[] = [];

    // Simulate finding 1-3 damages
    const numDamages = Math.floor(Math.random() * 3) + 1;

    const damageTypes: Array<'scratch' | 'dent' | 'crack' | 'paint_damage' | 'broken_part' | 'rust'> = [
      'scratch',
      'dent',
      'crack',
      'paint_damage',
      'broken_part',
      'rust',
    ];

    const severities: Array<'minor' | 'moderate' | 'severe'> = ['minor', 'moderate', 'severe'];

    const parts = [
      'front bumper',
      'rear bumper',
      'hood',
      'trunk',
      'front left door',
      'front right door',
      'rear left door',
      'rear right door',
      'left fender',
      'right fender',
      'roof',
      'windshield',
    ];

    const sides: Array<'front' | 'rear' | 'left' | 'right' | 'top' | 'interior'> = [
      'front',
      'rear',
      'left',
      'right',
      'top',
    ];

    for (let i = 0; i < numDamages; i++) {
      damages.push({
        type: damageTypes[Math.floor(Math.random() * damageTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        location: {
          part: parts[Math.floor(Math.random() * parts.length)],
          side: sides[Math.floor(Math.random() * sides.length)],
        },
        boundingBox: {
          x: Math.floor(Math.random() * 500),
          y: Math.floor(Math.random() * 500),
          width: Math.floor(Math.random() * 100) + 50,
          height: Math.floor(Math.random() * 100) + 50,
        },
        confidence: Math.random() * 0.3 + 0.7, // 0.7 - 1.0
      });
    }

    return damages;
  }

  // Method to train or fine-tune model (for future implementation)
  async trainModel(trainingData: any[]): Promise<void> {
    console.log('Model training not implemented yet');
  }
}
