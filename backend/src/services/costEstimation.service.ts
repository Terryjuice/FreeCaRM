interface CostEstimate {
  labor: number;
  parts: number;
  total: number;
}

export class CostEstimationService {
  private readonly laborRate: number;
  private readonly partsMarkup: number;

  constructor() {
    this.laborRate = parseFloat(process.env.DEFAULT_LABOR_RATE || '75');
    this.partsMarkup = parseFloat(process.env.DEFAULT_PARTS_MARKUP || '1.3');
  }

  estimateCost(
    damageType: string,
    severity: 'minor' | 'moderate' | 'severe'
  ): CostEstimate {
    const baseCosts = this.getBaseCosts(damageType, severity);

    const labor = baseCosts.laborHours * this.laborRate;
    const parts = baseCosts.partsBaseCost * this.partsMarkup;
    const total = labor + parts;

    return {
      labor: Math.round(labor * 100) / 100,
      parts: Math.round(parts * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  private getBaseCosts(
    damageType: string,
    severity: 'minor' | 'moderate' | 'severe'
  ): { laborHours: number; partsBaseCost: number } {
    const severityMultiplier = {
      minor: 1,
      moderate: 2,
      severe: 4,
    };

    const baseCostsByType: Record<string, { laborHours: number; partsBaseCost: number }> = {
      scratch: { laborHours: 2, partsBaseCost: 50 },
      dent: { laborHours: 3, partsBaseCost: 100 },
      crack: { laborHours: 4, partsBaseCost: 200 },
      paint_damage: { laborHours: 3, partsBaseCost: 150 },
      broken_part: { laborHours: 5, partsBaseCost: 500 },
      rust: { laborHours: 4, partsBaseCost: 300 },
      other: { laborHours: 2, partsBaseCost: 100 },
    };

    const baseCost = baseCostsByType[damageType] || baseCostsByType.other;
    const multiplier = severityMultiplier[severity];

    return {
      laborHours: baseCost.laborHours * multiplier,
      partsBaseCost: baseCost.partsBaseCost * multiplier,
    };
  }

  // Calculate total cost for multiple damages with discount for bulk
  calculateTotalWithDiscount(damages: Array<{ labor: number; parts: number; total: number }>): CostEstimate {
    const totalLabor = damages.reduce((sum, d) => sum + d.labor, 0);
    const totalParts = damages.reduce((sum, d) => sum + d.parts, 0);

    // Apply 10% discount if more than 3 damages
    const discount = damages.length > 3 ? 0.9 : 1.0;

    const labor = totalLabor * discount;
    const parts = totalParts * discount;
    const total = labor + parts;

    return {
      labor: Math.round(labor * 100) / 100,
      parts: Math.round(parts * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }
}
