# DreamerCloud Mobile - React Native App

A React Native mobile app for iOS that allows users to capture, analyze, and visualize their dreams with AI-powered features and premium subscription management via RevenueCat.

## Features

### Core Features
- 📱 **Native iOS App** - Built with React Native and Expo
- 🎙️ **Voice Recording** - ElevenLabs speech-to-text integration
- 🎨 **Custom Dream Art** - Pica OneTool routing to Replicate FLUX.1
- 🧠 **AI Dream Analysis** - Multiple analysis styles with Pica OneTool
- 🔊 **Voice Narration** - ElevenLabs AI voice narration (Premium)
- 📚 **Dream Journal** - Personal dream history and management
- 👥 **Community** - Share and discover dreams

### Premium Features (RevenueCat)
- 🧙‍♂️ **Jungian Analysis** - Archetypal symbols & collective unconscious
- 🔬 **Freudian Analysis** - Unconscious desires & psychoanalytic interpretation
- 🎵 **Voice Narration** - AI-powered audio with multiple voices
- ⚡ **Priority Processing** - Enhanced AI routing and faster results

## Tech Stack

- **Frontend**: React Native, Expo, NativeWind (Tailwind CSS)
- **Backend**: Netlify Functions, Supabase
- **AI Services**: 
  - Pica OneTool (AI routing and analysis)
  - ElevenLabs (speech-to-text and voice narration)
  - Replicate FLUX.1 (custom art generation)
  - Anthropic Claude Sonnet 4 (dream analysis)
- **Subscriptions**: RevenueCat
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

## Installation

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or physical iOS device
- EAS CLI (for building)

### Setup

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
cp .env.example .env
```

Fill in your API keys:
- `EXPO_PUBLIC_REVENUECAT_PUBLIC_KEY` - RevenueCat public key
- `REVENUECAT_API_KEY` - RevenueCat secret key (for Netlify functions)
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `EXPO_PUBLIC_ELEVENLABS_API_KEY` - ElevenLabs API key
- `PICA_SECRET_KEY` - Pica OneTool API key
- `REPLICATE_API_TOKEN` - Replicate API token
- `ANTHROPIC_API_KEY` - Anthropic API key

3. **Start development server**:
```bash
npm start
```

4. **Run on iOS**:
```bash
npm run ios
```

## Building for Production

### EAS Build Setup

1. **Install EAS CLI**:
```bash
npm install -g @expo/eas-cli
```

2. **Configure EAS**:
```bash
eas build:configure
```

3. **Build for iOS**:
```bash
npm run build:ios
```

### App Store Submission

1. **Submit to App Store**:
```bash
npm run submit:ios
```

## RevenueCat Integration

### Configuration
- **Project ID**: `proj_nwALEkrNSi94GUCOHmx2oDnY`
- **Products**:
  - `premium_monthly` - $9.99/month
  - `premium_yearly` - $99.99/year (17% savings)

### Premium Features
- Jungian & Freudian dream analysis styles
- AI voice narration with ElevenLabs
- Priority AI processing
- Unlimited dream analysis

### Implementation
- Client-side: `react-native-purchases` SDK
- Server-side: RevenueCat REST API validation
- Entitlement checks in Netlify Functions
- Graceful paywall modals for premium features

## Netlify Functions

### Authentication & Analysis
- `auth.js` - Pica AuthKit integration
- `analyze-dream.js` - AI dream analysis with style support
- `generate-art.js` - Custom FLUX.1 art generation
- `narrate-analysis.js` - ElevenLabs voice narration

### Subscription Management
- `subscribe.js` - RevenueCat purchase validation
- `check-subscription.js` - Subscription status verification

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- email (TEXT)
- username (TEXT)
- is_subscribed (BOOLEAN)
- subscription_status (TEXT)
- subscription_product_id (TEXT)
- subscription_platform (TEXT)
- subscription_started_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

### Dreams Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- title (TEXT)
- content (TEXT)
- mood (TEXT)
- tags (TEXT[])
- image_url (TEXT)
- analysis (TEXT)
- analysis_style (TEXT)
- created_at (TIMESTAMPTZ)
```

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── DreamCard.jsx   # Dream display component
│   ├── PaywallModal.jsx # Premium subscription modal
│   └── PremiumBadge.jsx # Premium user indicator
├── hooks/              # Custom React hooks
│   ├── useAuth.jsx     # Authentication management
│   └── useSubscription.jsx # RevenueCat integration
├── screens/            # App screens
│   ├── LandingScreen.jsx
│   ├── LoginScreen.jsx
│   ├── DashboardScreen.jsx
│   ├── RecordDreamScreen.jsx
│   ├── HistoryScreen.jsx
│   ├── ProfileScreen.jsx
│   └── DreamViewScreen.jsx
└── utils/              # Utility functions
```

### Key Features Implementation

#### Voice Recording
- ElevenLabs speech-to-text integration
- Real-time audio capture with React Native
- Automatic transcription to dream text

#### Custom Art Generation
- Pica OneTool intelligent routing
- Replicate FLUX.1 model integration
- Customizable styles, aspect ratios, and quality
- Supabase storage for generated images

#### Dream Analysis
- Multiple analysis styles (General, Emotional, Jungian, Freudian)
- Pica OneTool routing to optimal AI models
- Claude Sonnet 4 and GPT-4.1 fallbacks
- Concise analysis optimized for mobile reading

#### Premium Subscriptions
- RevenueCat native SDK integration
- Entitlement-based feature gating
- Graceful paywall experiences
- Subscription restoration support

## Deployment

### Netlify Functions
Deploy the backend functions to Netlify with environment variables configured.

### App Store
1. Build with EAS Build
2. Submit via EAS Submit or App Store Connect
3. Configure RevenueCat products in App Store Connect

## Environment Variables

### Required for Mobile App
- `EXPO_PUBLIC_REVENUECAT_PUBLIC_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ELEVENLABS_API_KEY`

### Required for Netlify Functions
- `REVENUECAT_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PICA_SECRET_KEY`
- `REPLICATE_API_TOKEN`
- `ANTHROPIC_API_KEY`
- `ELEVENLABS_API_KEY`

## Support

For support and questions:
- RevenueCat Project ID: `proj_nwALEkrNSi94GUCOHmx2oDnY`
- Built with Bolt.new
- Powered by Pica OneTool, ElevenLabs, and Replicate

## License

This project is part of the Bolt.new Make More Money Challenge submission.