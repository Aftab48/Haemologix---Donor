# Donor Mobile App

A React Native/Expo mobile application for blood donors to receive alerts, respond to donation requests, and manage their profile.

## Features

- **Real-time Alerts**: Receive and respond to blood donation requests from hospitals
- **Profile Management**: View and manage donor profile, eligibility status, and availability
- **Donation History**: Track past donations
- **Notifications**: Stay updated with donation requests and status updates
- **Location Services**: Calculate distance to hospitals and get directions
- **Blood Type Compatibility**: Automatic filtering of alerts based on blood type compatibility

## Prerequisites

- Node.js 18+ and npm/pnpm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- Access to the haemologix-main backend API

## Installation

1. Install dependencies:
```bash
cd donor
pnpm install
# or
npm install
```

2. Install additional dependencies:
```bash
npx expo install expo-location
```

3. API Configuration:
The app is configured to use the production API at `https://www.haemologix.in`.
No environment variables or configuration needed!

## Backend Setup

The mobile app requires API route wrappers in the `haemologix-main` backend. See [API_SETUP.md](./API_SETUP.md) for detailed instructions on creating the required API endpoints.

**Required API Routes:**
- `GET /api/user?email=...` - Get current user by email
- `GET /api/alerts/donor` - Get all available alerts
- `POST /api/donor/respond` - Respond to an alert (already exists)
- `GET /api/donor/history?donorId=...` - Get donation history (optional)

## Running the App

1. Start the Expo development server:
```bash
npm start
# or
pnpm start
```

2. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
donor/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── dashboard.tsx  # Main alerts dashboard
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── register/          # Authentication screens
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   └── donation-history.tsx
├── components/            # Reusable UI components
├── contexts/             # React context providers
│   ├── AuthContext.tsx
│   └── UserContext.tsx
├── lib/                  # Core functionality
│   ├── api.ts           # API service layer
│   ├── auth.ts          # Authentication utilities
│   ├── location.ts      # Location services
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
└── API_SETUP.md         # Backend API setup guide
```

## Authentication

The app uses email-based authentication. Users must be registered through the web application first. The mobile app then allows sign-in using email and password.

**Note**: The current implementation uses email lookup. For production, implement proper JWT token-based authentication.

## Key Features Implementation

### Dashboard
- Fetches real-time alerts from backend
- Filters alerts by blood type compatibility
- Calculates distance to hospitals
- Accept/decline functionality
- Pull-to-refresh support
- Auto-refresh every 30 seconds

### Profile
- Displays user information
- Eligibility status and progress
- Availability toggle
- Donation history navigation
- Account management

### Notifications
- Alert notifications
- Donation confirmations
- Status updates
- Pull-to-refresh support

## Development

### Adding New Features

1. **API Integration**: Add new API functions in `lib/api.ts`
2. **Types**: Add TypeScript types in `lib/types.ts`
3. **Screens**: Create new screens in `app/` directory
4. **Components**: Add reusable components in `components/`

### Testing

1. Ensure backend API routes are set up (see API_SETUP.md)
2. Start the backend server
3. Test authentication flow
4. Test alert fetching and responses
5. Test location services (requires device or emulator with location enabled)

## Troubleshooting

### API Connection Issues

**"Network request failed" Error:**
- **API URL**: The app uses `https://www.haemologix.in` - ensure the backend is deployed and accessible
- **CORS issues**: Ensure backend allows requests from mobile app
- **Network connectivity**: Check your internet connection
- **Backend status**: Verify the production backend is running at https://www.haemologix.in

### Location Services
- Grant location permissions when prompted
- For iOS simulator: Set location in Features > Location
- For Android emulator: Use extended controls to set location

### Authentication Issues
- Ensure user is registered in backend
- Check email format is correct
- Verify backend API route `/api/user` is working

## Production Deployment

1. Build the app:
```bash
eas build --platform ios
# or
eas build --platform android
```

2. Configure production API URL in environment variables
3. Set up proper authentication (JWT tokens)
4. Configure push notifications (if needed)
5. Test thoroughly before release

## License

See main project license.
