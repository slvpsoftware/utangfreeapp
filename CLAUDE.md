# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Utang Free App**, a React Native mobile application built with Expo Router to help Filipino users manage and track their debt payments. The app stores all data locally using AsyncStorage and provides debt tracking, KPI visualization, and celebration features.

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web browser

# Code quality
npm run lint       # ESLint checking
npx tsc --noEmit   # TypeScript type checking

# Reset project (clean slate)
npm run reset-project
```

## Architecture Overview

### App Structure
- **Expo Router Navigation**: File-based routing in `/app` directory
- **Dual Component Structure**: 
  - `/components` - Expo default themed components
  - `/src/components` - Custom UI components for the app
- **Local Storage**: AsyncStorage for all data persistence
- **Type Safety**: Comprehensive TypeScript interfaces in `/src/types`

### Key Directories
```
app/                 # Expo Router screens (navigation)
src/
├── components/      # Custom reusable UI components
├── constants/       # Design system (colors, typography, spacing)
├── screens/         # Screen components (used by app/ routes)
├── utils/           # Utility functions (storage, calculations, dates)
└── types/           # TypeScript type definitions
```

### Data Flow
1. **Storage Layer**: `StorageUtils` handles all AsyncStorage operations
2. **Calculation Layer**: `CalculationUtils` processes utang data for KPIs
3. **State Management**: Local component state with AsyncStorage persistence
4. **Navigation**: Expo Router stack navigation with shared app state
5. **Real-time Updates**: Dashboard automatically refreshes when returning from other screens using `useFocusEffect`

## Core Data Models

### Utang Interface
```typescript
interface Utang {
  id: string;
  label: string;
  type: 'loan' | 'credit_card';
  amount: number;              // Loan: monthly amortization, CC: total amount
  dueDay: number;              // 1-31
  finalPaymentDate?: string;   // Required for loans, calculated for credit cards
  interestRate?: Float;        // Required for credit cards (e.g., 0.05 = 5%)
  monthlyPayment?: number;     // Credit card: planned monthly payment
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  paidAt?: string;
}
```

### Design System Constants
Located in `/src/constants/`:
- **Colors**: Primary green (#10B981), semantic status colors
- **Typography**: Display, Header, Body, Helper text sizes
- **Spacing**: Consistent spacing scale throughout app

## Key Features & Implementation

### Storage Pattern
All data operations go through `StorageUtils`:
```typescript
// Save utang
await StorageUtils.saveUtang(newUtang);

// Mark as paid
await StorageUtils.markUtangsAsPaid(selectedIds);

// Load all utangs
const utangs = await StorageUtils.getAllUtangs();
```

### Calculation Pattern
KPI calculations handled by `CalculationUtils`:
```typescript
const kpiData = CalculationUtils.calculateKPIs(utangs);
const overdueUtangs = CalculationUtils.getOverdueUtangs(utangs);
```

### Component Patterns
- Custom components accept standard props interfaces from `/src/types`
- Follow established styling patterns using design system constants
- Use semantic color names and consistent spacing
- All UI components are in `/src/components` with TypeScript interfaces

### Navigation Flow
1. `index.tsx` - Route determination (first-time vs returning user)
2. `add-utang.tsx` - Utang creation with type selection (loan/credit card) 
3. `dashboard.tsx` - KPI visualization and navigation hub with auto-refresh on focus
4. `view-utang-list.tsx` - Utang management with selection and payment marking
5. `congratulations.tsx` - Payment success celebration
6. `profile.tsx` - User profile management with immediate dashboard updates

**Navigation Configuration**:
- **Swipe Gestures**: Left-edge swipe-to-go-back is **disabled** via `gestureEnabled: false` in Stack navigator
- **Auto-refresh**: Dashboard reloads data when screen gains focus (returning from profile, etc.)

## Development Guidelines

### Adding New Features
1. Define TypeScript interfaces in `/src/types/index.ts`
2. Create utility functions in appropriate `/src/utils` file
3. Build reusable components in `/src/components`
4. Add screens to `/src/screens` and route in `/app`

### Code Conventions
- Use design system constants from `/src/constants`
- Follow existing component prop interface patterns
- Maintain consistent error handling and user feedback
- Keep all business logic in utility functions
- Use semantic naming for colors and components

### Testing & Quality
- Run `npm run lint` before committing
- Use `npx tsc --noEmit` for type checking
- Test on both iOS and Android platforms
- Validate AsyncStorage operations work correctly

## Recent Updates & Improvements

### Navigation Enhancements
- **Disabled Swipe Gesture**: Left-edge swipe-to-go-back is disabled across all screens in `app/_layout.tsx` using `gestureEnabled: false`
- **Controlled Navigation**: Users must use app navigation buttons for predictable UX

### Dashboard Real-time Updates  
- **Auto-refresh on Focus**: Dashboard automatically reloads data when screen gains focus using `useFocusEffect`
- **Profile Integration**: Changes made in profile settings are immediately reflected on dashboard
- **No App Restart Required**: KPI calculations, user greetings, and debt-to-income ratios update instantly

### Implementation Details
```typescript
// Dashboard auto-refresh pattern in app/dashboard.tsx
useFocusEffect(
  useCallback(() => {
    loadData(); // Reloads profile, utangs, and KPIs
  }, [])
);

// Navigation configuration in app/_layout.tsx  
<Stack screenOptions={{
  gestureEnabled: false, // Disables swipe-to-go-back
  headerShown: false,
  contentStyle: { backgroundColor: '#F9FAFB' },
}} />
```

## Important Notes

- **Data Privacy**: All data stored locally, no external API calls
- **Validation**: Amount limits enforced (₱500k total, ₱50k amortization)
- **Date Handling**: Uses `DateUtils` for consistent date operations
- **Dual Type Support**: Handles both loan amortization and credit card debt
- **First-Time Experience**: Special onboarding flow for new users
- **User Experience**: 
  - Swipe-to-go-back gesture disabled for controlled navigation
  - Dashboard auto-refreshes profile data when returning from settings
  - Real-time KPI updates without app restart