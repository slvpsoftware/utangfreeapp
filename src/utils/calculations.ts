import { KPIData, UserProfile, Utang } from '../types';
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
      if (!utang.finalPaymentDate) return latest;
      const utangDate = new Date(utang.finalPaymentDate);
      return utangDate > latest ? utangDate : latest;
    }, new Date());

    return DateUtils.getMonthYear(latestDate);
  },

  // Validate amount (max 50k limit)
  isValidAmount(amount: number): boolean {
    return amount > 0 && amount <= 500000;
  },

  
  // Validate amount (max 50k limit)
  isValidAmortization(amount: number): boolean {
    return amount > 0 && amount <= 50000;
  },

  // Calculate debt-to-income ratio (only current month utangs)
  calculateDebtToIncomeRatio(utangs: Utang[], userProfile: UserProfile | null): number | undefined {
    if (!userProfile?.income || userProfile.income <= 0) {
      return undefined;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get the first and last day of the current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const totalMonthlyPayments = utangs
      .filter(utang => {
        // Parse the actual due date
        const dueDate = new Date(utang.dueDate);
        
        // Reset time to start of day for proper comparison
        dueDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        lastDayOfMonth.setHours(23, 59, 59, 999);
        
        // Include utangs due from today until the end of the current month only
        return dueDate >= today && 
               dueDate >= firstDayOfMonth && 
               dueDate <= lastDayOfMonth;
      })
      .reduce((total, utang) => {
        if (utang.type === 'loan') {
          // For loans, amount is the monthly amortization
          return total + utang.amount;
        } else if (utang.type === 'credit_card' && utang.monthlyPayment) {
          // For credit cards, use the planned monthly payment
          return total + utang.monthlyPayment;
        }
        return total;
      }, 0);

    if (totalMonthlyPayments === 0) {
      return 0; // No debt payments due this month
    }

    const ratio = (totalMonthlyPayments / userProfile.income) * 100;
    return Math.round(ratio * 100) / 100; // Round to 2 decimal places
  },

  // Get debt-to-income ratio recommendation
  getDebtToIncomeRecommendation(ratio: number): string {
    if (ratio <= 20) return 'Excellent! You have a very healthy debt-to-income ratio.';
    if (ratio <= 35) return 'Good! Your debt level is manageable.';
    if (ratio <= 50) return 'Concerning. Consider paying down debt or increasing income.';
    return 'Critical! Seek financial advice to reduce debt burden.';
  },

  // Get all KPIs
  calculateKPIs(utangs: Utang[], userProfile?: UserProfile | null): KPIData {
    return {
      totalUtang: this.calculateTotalUtang(utangs),
      utangImprovement: this.calculateUtangImprovement(utangs),
      projectedFreeDate: this.projectFreeDate(utangs),
      debtToIncomeRatio: this.calculateDebtToIncomeRatio(utangs, userProfile || null),
    };
  },

  // Group utangs by month and year
  groupUtangsByMonth(utangs: Utang[]): { [key: string]: Utang[] } {
    const grouped: { [key: string]: Utang[] } = {};
    
    utangs.forEach(utang => {
      const dueDate = new Date(utang.dueDate);
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
      const daysUntilDue = DateUtils.getDaysUntilDue(utang);
      return daysUntilDue <= 7 && daysUntilDue > 0;
    });
  }
}; 