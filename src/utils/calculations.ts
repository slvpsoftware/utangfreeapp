import { Utang, KPIData } from '../types';
import { DateUtils } from './dateUtils';

export const CalculationUtils = {
  // Calculate total pending utang
  calculateTotalUtang(utangs: Utang[]): number {
    return utangs
      .filter(utang => utang.status === 'pending')
      .reduce((total, utang) => total + utang.amount, 0);
  },

  // Calculate utang improvement (placeholder for now)
  calculateUtangImprovement(utangs: Utang[]): number {
    // Simple implementation: % of total utangs paid
    const totalUtangs = utangs.length;
    const paidUtangs = utangs.filter(utang => utang.status === 'paid').length;
    return totalUtangs > 0 ? Math.round((paidUtangs / totalUtangs) * 100) : 0;
  },

  // Project free date (simple calculation)
  projectFreeDate(utangs: Utang[]): string {
    const pendingUtangs = utangs.filter(utang => utang.status === 'pending');
    if (pendingUtangs.length === 0) return 'Debt Free!';

    // Find the latest final payment date
    const latestDate = pendingUtangs.reduce((latest, utang) => {
      const utangDate = new Date(utang.finalPaymentDate);
      return utangDate > latest ? utangDate : latest;
    }, new Date());

    return DateUtils.getMonthYear(latestDate);
  },

  // Validate amount (max 50k limit)
  isValidAmount(amount: number): boolean {
    return amount > 0 && amount <= 50000;
  },

  // Get all KPIs
  calculateKPIs(utangs: Utang[]): KPIData {
    return {
      totalUtang: this.calculateTotalUtang(utangs),
      utangImprovement: this.calculateUtangImprovement(utangs),
      projectedFreeDate: this.projectFreeDate(utangs),
    };
  },

  // Group utangs by month and year
  groupUtangsByMonth(utangs: Utang[]): { [key: string]: Utang[] } {
    const grouped: { [key: string]: Utang[] } = {};
    
    utangs.forEach(utang => {
      const dueDate = new Date();
      dueDate.setDate(utang.dueDay);
      const monthYear = DateUtils.getMonthYear(dueDate);
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(utang);
    });
    
    return grouped;
  },

  // Get overdue utangs
  getOverdueUtangs(utangs: Utang[]): Utang[] {
    return utangs.filter(utang => DateUtils.isOverdue(utang));
  },

  // Get utangs due soon (within 7 days)
  getDueSoonUtangs(utangs: Utang[]): Utang[] {
    return utangs.filter(utang => {
      if (utang.status !== 'pending') return false;
      const daysUntilDue = DateUtils.getDaysUntilDue(utang.dueDay);
      return daysUntilDue <= 7 && daysUntilDue > 0;
    });
  }
}; 