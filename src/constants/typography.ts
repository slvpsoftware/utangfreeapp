import { Colors } from './colors';

export const Typography = {
  // Display Text
  displayLarge: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    color: Colors.textPrimary,
  },
  
  // Headers
  headerLarge: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  headerMedium: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  headerSmall: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  
  // Body Text
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: Colors.textTertiary,
  },
  
  // Special Text
  kpiValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: Colors.primary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: Colors.buttonText,
  },
  chip: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
}; 