import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { IInspection } from '../models/Inspection.model';
import { IDamage } from '../models/Damage.model';
import { IUser } from '../models/User.model';

export class ReportGenerationService {
  private readonly reportsDir = './uploads/reports';

  constructor() {
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generatePDFReport(
    inspection: IInspection,
    damages: IDamage[],
    user: IUser
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reportPath = path.join(this.reportsDir, `${inspection._id}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(reportPath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc);

        // Inspection Details
        this.addInspectionDetails(doc, inspection, user);

        // Vehicle Information
        this.addVehicleInfo(doc, inspection);

        // Damages Summary
        this.addDamagesSummary(doc, damages);

        // Cost Breakdown
        this.addCostBreakdown(doc, damages, inspection.totalEstimatedCost);

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          resolve(reportPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument): void {
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('FreeCaRM', 50, 50)
      .fontSize(10)
      .font('Helvetica')
      .text('Vehicle Inspection Report', 50, 80);

    doc.moveDown(2);
  }

  private addInspectionDetails(doc: PDFKit.PDFDocument, inspection: IInspection, user: IUser): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Inspection Details', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Inspection ID: ${inspection._id}`)
      .text(`Inspector: ${user.firstName} ${user.lastName}`)
      .text(`Date: ${new Date(inspection.createdAt).toLocaleDateString()}`)
      .text(`Status: ${inspection.status.toUpperCase()}`)
      .moveDown();

    if (inspection.location?.address) {
      doc.text(`Location: ${inspection.location.address}`).moveDown();
    }
  }

  private addVehicleInfo(doc: PDFKit.PDFDocument, inspection: IInspection): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Vehicle Information', { underline: true })
      .moveDown(0.5);

    const vehicle = inspection.vehicleInfo;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Make: ${vehicle.make}`)
      .text(`Model: ${vehicle.model}`)
      .text(`Year: ${vehicle.year}`);

    if (vehicle.vin) doc.text(`VIN: ${vehicle.vin}`);
    if (vehicle.licensePlate) doc.text(`License Plate: ${vehicle.licensePlate}`);
    if (vehicle.mileage) doc.text(`Mileage: ${vehicle.mileage.toLocaleString()} miles`);
    if (vehicle.color) doc.text(`Color: ${vehicle.color}`);

    doc.moveDown(2);
  }

  private addDamagesSummary(doc: PDFKit.PDFDocument, damages: IDamage[]): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Damages Detected', { underline: true })
      .moveDown(0.5);

    if (damages.length === 0) {
      doc.fontSize(10).font('Helvetica').text('No damages detected').moveDown();
      return;
    }

    damages.forEach((damage, index) => {
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`${index + 1}. ${this.formatDamageType(damage.type)} - ${this.capitalize(damage.severity)}`);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`   Location: ${damage.location.part} (${damage.location.side})`)
        .text(`   Estimated Cost: $${damage.estimatedCost.total.toFixed(2)}`);

      if (damage.description) {
        doc.text(`   Description: ${damage.description}`);
      }

      doc.text(`   AI Confidence: ${(damage.confidence * 100).toFixed(1)}%`).moveDown(0.5);
    });

    doc.moveDown();
  }

  private addCostBreakdown(doc: PDFKit.PDFDocument, damages: IDamage[], totalCost: number): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Cost Breakdown', { underline: true })
      .moveDown(0.5);

    const totalLabor = damages.reduce((sum, d) => sum + d.estimatedCost.labor, 0);
    const totalParts = damages.reduce((sum, d) => sum + d.estimatedCost.parts, 0);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Labor: $${totalLabor.toFixed(2)}`)
      .text(`Parts: $${totalParts.toFixed(2)}`)
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`Total Estimated Cost: $${totalCost.toFixed(2)}`, { underline: true });

    doc.moveDown();
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    const bottomOfPage = doc.page.height - 50;

    doc
      .fontSize(8)
      .font('Helvetica')
      .text(
        'This report is an estimate based on AI analysis. Actual repair costs may vary.',
        50,
        bottomOfPage,
        { align: 'center', width: doc.page.width - 100 }
      )
      .text(`Generated: ${new Date().toLocaleString()}`, 50, bottomOfPage + 15, {
        align: 'center',
        width: doc.page.width - 100,
      });
  }

  private formatDamageType(type: string): string {
    return type
      .split('_')
      .map((word) => this.capitalize(word))
      .join(' ');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
