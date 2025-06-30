# Utang Free App

A React Native mobile app to help Filipino users manage and track their debt payments.

## 🎯 Features

- **Add Utang**: Track new debts with labels, amounts, due dates, and final payment dates
- **Dashboard**: View KPIs including total debt, improvement percentage, and projected debt-free date
- **Utang List**: View all debts organized by month, with selection and mark-as-paid functionality
- **Celebration**: Enjoy a congratulatory screen when paying off debts
- **Local Storage**: All data is stored locally on the device using AsyncStorage

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UtangFreeApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## 📱 App Structure

```
UtangFreeApp/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Main navigation layout
│   ├── index.tsx          # Initial routing logic
│   ├── add-utang.tsx      # Add new utang screen
│   ├── dashboard.tsx      # Dashboard with KPIs
│   ├── view-utang-list.tsx # View and manage utangs
│   └── congratulations.tsx # Celebration screen
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── KPICard.tsx
│   │   ├── UtangCard.tsx
│   │   └── Chip.tsx
│   ├── constants/         # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   ├── utils/            # Utility functions
│   │   ├── storage.ts
│   │   ├── dateUtils.ts
│   │   └── calculations.ts
│   └── types/            # TypeScript definitions
│       └── index.ts
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: Green (#10B981) - represents debt freedom
- **Secondary**: Blue (#3B82F6) - for actions
- **Success**: Green (#10B981) - paid status
- **Warning**: Orange (#F59E0B) - due soon
- **Danger**: Red (#EF4444) - overdue

### Typography
- **Display**: Large headers (32px)
- **Header**: Section titles (20-24px)
- **Body**: Regular text (14-16px)
- **Helper**: Small text (12px)

## 🔧 Key Components

### Button Component
```typescript
<Button
  title="Proceed"
  onPress={handleSubmit}
  loading={false}
  disabled={false}
  variant="primary"
  fullWidth
/>
```

### Input Component
```typescript
<Input
  label="Utang Label"
  placeholder="Enter utang label"
  value={utangLabel}
  onChangeText={setUtangLabel}
  helperText="e.g., Credit Card, Gadget Loan"
  error={errors.label}
  width="full"
/>
```

### KPI Card Component
```typescript
<KPICard
  label="Total Utang"
  value="₱25,000"
  helperText="vs. last 7 days"
  color={Colors.primary}
/>
```

## 📊 Data Models

### Utang Interface
```typescript
interface Utang {
  id: string;
  label: string;
  amount: number;
  dueDay: number; // 1-31
  finalPaymentDate: string; // ISO string
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  paidAt?: string;
}
```

### App State
```typescript
interface AppState {
  utangs: Utang[];
  isFirstTime: boolean;
  lastCalculated: string;
}
```

## 🛠️ Development

### Adding New Features

1. **Create new component** in `src/components/`
2. **Add TypeScript types** in `src/types/index.ts`
3. **Create new screen** in `app/` directory
4. **Update navigation** in `app/_layout.tsx`

### Styling Guidelines

- Use the design system constants (`Colors`, `Typography`, `Spacing`)
- Follow the established component patterns
- Maintain consistent spacing and typography
- Use semantic color names

### Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📱 User Flow

1. **First Launch**: User sees "Add Utang" screen with first-time message
2. **Add Utang**: Fill form with utang details and validation
3. **Dashboard**: View KPIs and total debt overview
4. **View List**: See all utangs organized by month
5. **Select & Pay**: Choose utangs and mark as paid
6. **Celebration**: Enjoy success screen with congratulations

## 🔒 Data Privacy

- All data is stored locally on the device
- No data is transmitted to external servers
- Users can manually backup their data
- No personal information is collected

## 🚀 Deployment

### Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### App Store Preparation

1. Update `app.json` with app details
2. Add app icons and splash screen
3. Configure build settings
4. Submit to Google Play Store / App Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for Filipino users managing their debt payments**
