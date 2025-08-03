import { Utang } from '../types';

export const DateUtils = {
  // Validate due day (1-31)
  isValidDueDay(day: number): boolean {
    return day >= 1 && day <= 31;
  },

  // Validate final payment date
  isValidFinalDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date > today && !isNaN(date.getTime());
  },

  // Check if utang is overdue
  isOverdue(utang: Utang): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(utang.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && utang.status === 'pending';
  },

  // Format currency
  formatCurrency(amount: number): string {
    return `₱${amount.toLocaleString('en-PH')}`;
  },

  // Get month year string
  getMonthYear(date: Date): string {
    return date.toLocaleDateString('en-PH', { 
      month: 'long', 
      year: 'numeric' 
    });
  },

  // Get current month and year
  getCurrentMonthYear(): string {
    return this.getMonthYear(new Date());
  },

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Get days until due (using actual due date)
  getDaysUntilDue(utang: Utang): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(utang.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}; 