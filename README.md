# Keto + IF App

A comprehensive ketogenic diet and intermittent fasting tracking application built with React Native and Expo.

## 🚀 Features Implemented

### ✅ Task 1: Project Foundation and Core Infrastructure
- React Native project with Expo and TypeScript
- ESLint, Prettier, and Jest testing framework
- React Navigation with tab and stack navigators
- Zustand state management
- Environment configuration

### ✅ Task 2: Supabase Backend Setup and Configuration
- Supabase client integration with AsyncStorage persistence
- Database schema design for profiles, macro targets, food entries, and fasting sessions
- Row Level Security (RLS) policies for data protection
- Real-time subscriptions setup
- Migration scripts and configuration files
- Comprehensive TypeScript types for database entities

### ✅ Task 3: Authentication and User Profile System
- Dual authentication system (Mock + Supabase)
- User registration and login with email/password
- Complete onboarding flow with personal information collection
- BMR and TDEE calculation algorithms
- Profile management with edit capabilities
- Comprehensive test coverage (59 passing tests)

## 🏗️ Architecture

### Frontend
- **React Native** with Expo for cross-platform development
- **TypeScript** for type safety
- **Zustand** for state management with persistence
- **React Navigation** for navigation
- **Jest** for testing

### Backend Options
- **Mock Authentication** for development and testing
- **Supabase** for production-ready backend with:
  - PostgreSQL database with JSONB fields
  - Real-time subscriptions
  - Row Level Security
  - Edge Functions support
  - File storage capabilities

## 📱 Screens

### Authentication Flow
- **Welcome Screen**: App introduction with feature highlights
- **Login Screen**: Email/password authentication with validation
- **Register Screen**: User registration with password confirmation

### Onboarding Flow
- **Personal Info**: Age, gender, height, weight, activity level
- **Goals**: Primary goals, timeline, weekly targets
- **Preferences**: Fasting experience, dietary restrictions, meal timing
- **Complete**: Personalized results with BMR, TDEE, and macro targets

### Main App
- **Profile Screen**: User profile management with edit capabilities
- **Dashboard**: (Placeholder for macro tracking)
- **Food Log**: (Placeholder for food logging)
- **Fasting**: (Placeholder for fasting timer)
- **Progress**: (Placeholder for progress tracking)

## 🧮 Calculations

### Metabolism Calculations
- **BMR (Basal Metabolic Rate)**: Using Mifflin-St Jeor Equation
- **TDEE (Total Daily Energy Expenditure)**: BMR × Activity multiplier
- **Macro Targets**: Ketogenic ratios (70% fat, 25% protein, 5% carbs)
- **Goal Adjustments**: Calorie adjustments for weight loss, maintenance, muscle gain

### Supported Features
- Multiple gender options (male, female, other)
- 5 activity levels (sedentary to very active)
- Safety limits for minimum calorie intake
- Water intake recommendations
- Data validation for all user inputs

## 🗄️ Database Schema

### Tables
- **profiles**: User profile information with JSONB fields
- **macro_targets**: Calculated macro targets per user
- **food_entries**: Food logging data (ready for implementation)
- **fasting_sessions**: Fasting session tracking (ready for implementation)

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic profile creation on user registration
- JWT-based authentication

## 🧪 Testing

Comprehensive test suite with 59 passing tests covering:
- Authentication logic (mock and Supabase)
- Metabolism calculations
- User store state management
- Profile data transformations
- Error handling and edge cases

```bash
npm test
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

### Supabase Setup (Optional)

For production backend, follow the [Supabase Setup Guide](docs/SUPABASE_SETUP.md):

1. Create a Supabase project
2. Run the migration script
3. Configure environment variables
4. Toggle Supabase mode in the app

## 🔧 Configuration

### Environment Variables
Create a `.env` file (copy from `.env.example`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend Toggle
The app supports switching between mock authentication and Supabase:
- Use the toggle in the Profile screen
- Or programmatically: `useUserStore.getState().toggleSupabase(true)`

## 📊 Current Status

### Completed Tasks (3/21)
- ✅ Project Foundation and Core Infrastructure
- ✅ Supabase Backend Setup and Configuration  
- ✅ Authentication and User Profile System

### Next Tasks
- 🔄 Core Macro Tracking Foundation
- 🔄 Daily Dashboard and Progress Visualization
- 🔄 Intermittent Fasting Timer System

## 🤝 Development Workflow

### Code Quality
- ESLint and Prettier for code formatting
- TypeScript for type safety
- Comprehensive test coverage
- Git hooks for pre-commit validation

### Testing Strategy
- Unit tests for business logic
- Integration tests for services
- Component tests for UI logic
- Mock services for isolated testing

### Performance Considerations
- Optimized bundle size with code splitting
- Efficient state management with Zustand
- Lazy loading for screens
- Image optimization ready

## 📚 Documentation

- [Supabase Setup Guide](docs/SUPABASE_SETUP.md)
- [API Documentation](docs/API.md) (Coming soon)
- [Testing Guide](docs/TESTING.md) (Coming soon)

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **State Management**: Zustand with persistence
- **Navigation**: React Navigation v7
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Testing**: Jest, React Native Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

## 📈 Roadmap

The app is designed for rapid development with a 6-day sprint methodology. Upcoming features include:
- Comprehensive food database with barcode scanning
- AI-powered food recommendations
- Advanced fasting timer with stage tracking
- Progress analytics and insights
- Gamification and achievements
- Health integration and wearables
- Premium subscription features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.