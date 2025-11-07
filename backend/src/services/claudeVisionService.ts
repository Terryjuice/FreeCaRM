import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

interface DamageAnalysis {
  type: 'scratch' | 'dent' | 'crack' | 'paint_damage' | 'broken_part' | 'rust' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  location: {
    part: string;
    side: 'front' | 'rear' | 'left' | 'right' | 'top' | 'interior';
  };
  description: string;
  confidence: number;
}

export class ClaudeVisionService {
  private client: Anthropic | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || null;
    if (this.apiKey) {
      this.initializeClient();
    }
  }

  private initializeClient(): void {
    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });
      console.log('✅ Claude Vision API initialized');
    }
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.initializeClient();
  }

  public isConfigured(): boolean {
    return this.client !== null && this.apiKey !== null;
  }

  async analyzeDamage(imagePath: string): Promise<DamageAnalysis[]> {
    if (!this.isConfigured()) {
      throw new Error('Claude API key not configured. Please set ANTHROPIC_API_KEY.');
    }

    try {
      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Determine image type
      const ext = path.extname(imagePath).toLowerCase();
      const mediaType = this.getMediaType(ext);

      const message = await this.client!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: `You are an expert vehicle damage assessor. Analyze this vehicle image and identify ALL visible damages. For each damage found, provide:

1. Type: scratch, dent, crack, paint_damage, broken_part, rust, or other
2. Severity: minor, moderate, or severe
3. Location: specific part (e.g., "front bumper", "driver door", "hood") and side (front, rear, left, right, top, interior)
4. Description: detailed description of the damage
5. Confidence: your confidence level (0.0 to 1.0)

Return the response ONLY as a valid JSON array of damage objects. Example format:
[
  {
    "type": "scratch",
    "severity": "minor",
    "location": {
      "part": "front bumper",
      "side": "front"
    },
    "description": "Light surface scratch approximately 15cm long on the lower left section of the front bumper",
    "confidence": 0.85
  }
]

If no damage is visible, return an empty array: []

IMPORTANT: Return ONLY the JSON array, no other text.`,
              },
            ],
          },
        ],
      });

      // Parse Claude's response
      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('No JSON found in Claude response:', responseText);
        return [];
      }

      const damages: DamageAnalysis[] = JSON.parse(jsonMatch[0]);

      // Validate and sanitize the response
      return damages.filter(this.validateDamage).map(this.sanitizeDamage);
    } catch (error) {
      console.error('Claude Vision API error:', error);
      throw error;
    }
  }

  private getMediaType(ext: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
    const types: Record<string, 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return types[ext] || 'image/jpeg';
  }

  private validateDamage(damage: any): boolean {
    const validTypes = ['scratch', 'dent', 'crack', 'paint_damage', 'broken_part', 'rust', 'other'];
    const validSeverities = ['minor', 'moderate', 'severe'];
    const validSides = ['front', 'rear', 'left', 'right', 'top', 'interior'];

    return (
      damage &&
      validTypes.includes(damage.type) &&
      validSeverities.includes(damage.severity) &&
      damage.location &&
      typeof damage.location.part === 'string' &&
      validSides.includes(damage.location.side) &&
      typeof damage.description === 'string' &&
      typeof damage.confidence === 'number' &&
      damage.confidence >= 0 &&
      damage.confidence <= 1
    );
  }

  private sanitizeDamage(damage: any): DamageAnalysis {
    return {
      type: damage.type,
      severity: damage.severity,
      location: {
        part: damage.location.part.toLowerCase(),
        side: damage.location.side,
      },
      description: damage.description,
      confidence: Math.min(Math.max(damage.confidence, 0), 1),
    };
  }

  // Batch analyze multiple images
  async analyzeMultipleImages(imagePaths: string[]): Promise<Map<string, DamageAnalysis[]>> {
    const results = new Map<string, DamageAnalysis[]>();

    for (const imagePath of imagePaths) {
      try {
        const damages = await this.analyzeDamage(imagePath);
        results.set(imagePath, damages);
      } catch (error) {
        console.error(`Failed to analyze ${imagePath}:`, error);
        results.set(imagePath, []);
      }
    }

    return results;
  }
}
