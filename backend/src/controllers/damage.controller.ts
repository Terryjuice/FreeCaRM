import { Response } from 'express';
import Damage from '../models/Damage.model';
import Inspection from '../models/Inspection.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { CostEstimationService } from '../services/costEstimation.service';

const costEstimationService = new CostEstimationService();

export const getDamagesByInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inspectionId } = req.params;
    const userId = req.user?._id;

    // Verify inspection belongs to user
    const inspection = await Inspection.findOne({ _id: inspectionId, userId });
    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    const damages = await Damage.find({ inspectionId });

    res.json({ damages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get damages' });
  }
};

export const getDamageById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const damage = await Damage.findById(id).populate('inspectionId');

    if (!damage) {
      res.status(404).json({ error: 'Damage not found' });
      return;
    }

    // Verify inspection belongs to user
    const inspection = await Inspection.findOne({
      _id: damage.inspectionId,
      userId,
    });

    if (!inspection) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ damage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get damage' });
  }
};

export const createManualDamage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inspectionId, type, severity, location, imageUrl, description } = req.body;
    const userId = req.user?._id;

    // Verify inspection belongs to user
    const inspection = await Inspection.findOne({ _id: inspectionId, userId });
    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    const estimatedCost = costEstimationService.estimateCost(type, severity);

    const damage = new Damage({
      inspectionId,
      type,
      severity,
      location,
      imageUrl,
      description,
      estimatedCost,
      aiDetected: false,
      verified: true,
      confidence: 1.0,
    });

    await damage.save();

    // Update inspection
    inspection.damages.push(damage._id as any);
    inspection.totalEstimatedCost += estimatedCost.total;
    await inspection.save();

    res.status(201).json({
      message: 'Damage created successfully',
      damage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create damage' });
  }
};

export const updateDamage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?._id;

    const damage = await Damage.findById(id);

    if (!damage) {
      res.status(404).json({ error: 'Damage not found' });
      return;
    }

    // Verify inspection belongs to user
    const inspection = await Inspection.findOne({
      _id: damage.inspectionId,
      userId,
    });

    if (!inspection) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Recalculate cost if type or severity changed
    if (updates.type || updates.severity) {
      const newType = updates.type || damage.type;
      const newSeverity = updates.severity || damage.severity;
      updates.estimatedCost = costEstimationService.estimateCost(newType, newSeverity);
    }

    Object.assign(damage, updates);
    await damage.save();

    // Recalculate total inspection cost
    const allDamages = await Damage.find({ inspectionId: inspection._id });
    inspection.totalEstimatedCost = allDamages.reduce(
      (sum, d) => sum + d.estimatedCost.total,
      0
    );
    await inspection.save();

    res.json({
      message: 'Damage updated successfully',
      damage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update damage' });
  }
};

export const deleteDamage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const damage = await Damage.findById(id);

    if (!damage) {
      res.status(404).json({ error: 'Damage not found' });
      return;
    }

    // Verify inspection belongs to user
    const inspection = await Inspection.findOne({
      _id: damage.inspectionId,
      userId,
    });

    if (!inspection) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await damage.deleteOne();

    // Update inspection
    inspection.damages = inspection.damages.filter(
      (damageId) => damageId.toString() !== id
    );
    inspection.totalEstimatedCost -= damage.estimatedCost.total;
    await inspection.save();

    res.json({ message: 'Damage deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete damage' });
  }
};
