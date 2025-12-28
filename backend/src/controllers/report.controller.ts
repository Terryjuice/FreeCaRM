import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Inspection from '../models/Inspection.model';
import Damage from '../models/Damage.model';
import { ReportGenerationService } from '../services/reportGeneration.service';

const reportService = new ReportGenerationService();

export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { inspectionId } = req.params;
    const userId = req.user?._id;

    const inspection = await Inspection.findOne({ _id: inspectionId, userId }).populate('userId');

    if (!inspection) {
      res.status(404).json({ error: 'Inspection not found' });
      return;
    }

    if (inspection.status !== 'completed') {
      res.status(400).json({ error: 'Inspection is not completed yet' });
      return;
    }

    const damages = await Damage.find({ inspectionId });

    const reportPath = await reportService.generatePDFReport(inspection, damages, req.user!);

    res.json({
      message: 'Report generated successfully',
      reportPath,
      reportUrl: `/api/reports/download/${inspection._id}`,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const downloadReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reportId } = req.params;
    const userId = req.user?._id;

    const inspection = await Inspection.findOne({ _id: reportId, userId });

    if (!inspection) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const reportPath = `./uploads/reports/${reportId}.pdf`;

    res.download(reportPath, `inspection_report_${reportId}.pdf`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download report' });
  }
};
