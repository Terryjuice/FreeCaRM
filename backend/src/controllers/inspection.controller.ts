import { Response } from 'express';
import Inspection from '../models/Inspection.model';
import Damage from '../models/Damage.model';
import Settings from '../models/Settings.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { DamageDetectionService } from '../services/damageDetection.service';
import { CostEstimationService } from '../services/costEstimation.service';

const damageDetectionService = new DamageDetectionService();
const costEstimationService = new CostEstimationService();

export const createInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vehicleInfo, notes, location } = req.body;
    const userId = req.user?._id;

    const inspection = new Inspection({
      userId,
      vehicleInfo,
      notes,
      location,
      status: 'draft',
    });

    await inspection.save();

    res.status(201).json({
      message: 'Inspection created successfully',
      inspection,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inspection' });
  }
};

export const getInspections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { status, limit = 20, offset = 0 } = req.query;

    const query: any = { userId };
    if (status) query.status = status;

    const inspections = await Inspection.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .populate('damages');

    const total = await Inspection.countDocuments(query);

    res.json({
      inspections,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get inspections' });
  }
};

export const getInspectionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const inspection = await Inspection.findOne({ _id: id, userId }).populate('damages');

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    res.json({ inspection });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get inspection' });
  }
};

export const updateInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const updates = req.body;

    const inspection = await Inspection.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    res.json({
      message: 'Inspection updated successfully',
      inspection,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inspection' });
  }
};

export const deleteInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const inspection = await Inspection.findOneAndDelete({ _id: id, userId });

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    // Delete associated damages
    await Damage.deleteMany({ inspectionId: id });

    res.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inspection' });
  }
};

export const uploadInspectionImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { angle } = req.body;
    const userId = req.user?._id;

    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const inspection = await Inspection.findOne({ _id: id, userId });

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    inspection.images.push({
      angle,
      url: imageUrl,
      uploadedAt: new Date(),
      analyzed: false,
    });

    if (inspection.status === 'draft') {
      inspection.status = 'in_progress';
    }

    await inspection.save();

    res.json({
      message: 'Image uploaded successfully',
      image: {
        angle,
        url: imageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const analyzeInspectionImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const inspection = await Inspection.findOne({ _id: id, userId });

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    if (inspection.images.length === 0) {
      res.status(400).json({ error: 'No images to analyze' });
      return;
    }

    // Load user settings to get Claude API key
    const settings = await Settings.findOne({ userId }).select('+anthropicApiKey');
    if (settings?.anthropicApiKey) {
      damageDetectionService.setClaudeApiKey(settings.anthropicApiKey);
    }

    inspection.status = 'analyzing';
    await inspection.save();

    // Analyze images for damages
    const detectedDamages = [];

    for (const image of inspection.images) {
      if (!image.analyzed) {
        const imagePath = `.${image.url}`;
        const damages = await damageDetectionService.detectDamages(imagePath);

        for (const damageData of damages) {
          const estimatedCost = costEstimationService.estimateCost(
            damageData.type,
            damageData.severity
          );

          const damage = new Damage({
            inspectionId: inspection._id,
            type: damageData.type,
            severity: damageData.severity,
            location: damageData.location,
            imageUrl: image.url,
            boundingBox: damageData.boundingBox,
            confidence: damageData.confidence,
            estimatedCost,
            aiDetected: true,
            verified: false,
          });

          await damage.save();
          detectedDamages.push(damage);
          inspection.damages.push(damage._id as any);
        }

        image.analyzed = true;
      }
    }

    // Calculate total estimated cost
    const allDamages = await Damage.find({ inspectionId: inspection._id });
    inspection.totalEstimatedCost = allDamages.reduce(
      (sum, damage) => sum + damage.estimatedCost.total,
      0
    );

    inspection.status = 'completed';
    inspection.completedAt = new Date();
    await inspection.save();

    res.json({
      message: 'Analysis completed successfully',
      inspection,
      damages: detectedDamages,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze images' });
  }
};
