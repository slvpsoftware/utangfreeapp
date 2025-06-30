export interface Utang {
  id: string;
  label: string;
  amount: number;
  dueDay: number; // 1-31
  finalPaymentDate: string; // ISO string
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  paidAt?: string;
}

export interface AppState {
  utangs: Utang[];
  isFirstTime: boolean;
  lastCalculated: string;
}

export interface KPIData {
  totalUtang: number;
  utangImprovement: number;
  projectedFreeDate: string;
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