export interface Utang {
  id: string;
  label: string;
  type: 'loan' | 'credit_card';
  amount: number; // For loan: amortization per month, For credit card: total amount due
  dueDate: string; // ISO string - specific due date for this payment (e.g., "2024-01-15")
  finalPaymentDate?: string; // ISO string - required for loan, calculated for credit card
  interestRate?: number; // e.g. 0.05 for 5% - required for credit card
  monthlyPayment?: number; // For credit card: how much user plans to pay monthly
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  paidAt?: string;
}

export interface UserProfile {
  name: string;
  income?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: string;
  utangId: string;
  utangLabel: string;
  utangType: 'loan' | 'credit_card';
  amountPaid: number;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface AppState {
  utangs: Utang[];
  isFirstTime: boolean;
  lastCalculated: string;
  userProfile?: UserProfile;
  paymentHistory: PaymentHistory[];
}

export interface KPIData {
  totalUtang: number;
  utangImprovement: number;
  projectedFreeDate: string;
  debtToIncomeRatio?: number; // Percentage (e.g., 25 for 25%)
}

export interface NavigationProps {
  navigation: any;
  route?: any;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  helperText?: string;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  width?: 'full' | 'half';
  prefix?: string;
  suffix?: string;
}

export interface KPICardProps {
  label: string;
  value: string | number;
  helperText?: string;
  color?: string;
}

export interface UtangCardProps {
  utang: Utang;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

export interface ChipProps {
  title: string;
  active: boolean;
  onPress: () => void;
} 