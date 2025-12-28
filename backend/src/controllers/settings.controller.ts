import { Response } from 'express';
import Settings from '../models/Settings.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClaudeVisionService } from '../services/claudeVisionService';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    let settings = await Settings.findOne({ userId });

    if (!settings) {
      // Create default settings
      settings = new Settings({
        userId,
        preferences: {
          autoAnalyze: false,
          notificationsEnabled: true,
        },
      });
      await settings.save();
    }

    res.json({
      settings: {
        preferences: settings.preferences,
        hasApiKey: !!settings.anthropicApiKey,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { preferences } = req.body;

    let settings = await Settings.findOne({ userId });

    if (!settings) {
      settings = new Settings({ userId });
    }

    if (preferences) {
      settings.preferences = { ...settings.preferences, ...preferences };
    }

    await settings.save();

    res.json({
      message: 'Settings updated successfully',
      settings: {
        preferences: settings.preferences,
        hasApiKey: !!settings.anthropicApiKey,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const setApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      res.status(400).json({ error: 'API key is required' });
      return;
    }

    // Validate API key by testing it
    const claudeService = new ClaudeVisionService();
    claudeService.setApiKey(apiKey);

    if (!claudeService.isConfigured()) {
      res.status(400).json({ error: 'Invalid API key format' });
      return;
    }

    let settings = await Settings.findOne({ userId });

    if (!settings) {
      settings = new Settings({ userId });
    }

    settings.anthropicApiKey = apiKey;
    await settings.save();

    res.json({
      message: 'API key saved successfully',
      hasApiKey: true,
    });
  } catch (error: any) {
    console.error('Set API key error:', error);
    res.status(500).json({ error: error.message || 'Failed to save API key' });
  }
};

export const testApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const settings = await Settings.findOne({ userId }).select('+anthropicApiKey');

    if (!settings || !settings.anthropicApiKey) {
      res.status(400).json({ error: 'No API key configured' });
      return;
    }

    const claudeService = new ClaudeVisionService();
    claudeService.setApiKey(settings.anthropicApiKey);

    if (!claudeService.isConfigured()) {
      res.status(400).json({ error: 'API key is not valid' });
      return;
    }

    res.json({
      message: 'API key is valid',
      status: 'connected',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to test API key' });
  }
};
