# AGRI AI - Voice-First Agricultural Chatbot

A futuristic, minimalist, voice-first AI assistant for farmers with multilingual support and ML-powered agricultural recommendations.

## Features

- **Voice-First Interface**: Natural conversation with speech-to-text (STT) and text-to-speech (TTS)
- **3D Voice Orb**: Beautiful canvas-based orb with animations for idle, listening, and speaking states
- **Structured Chatflow**: Fixed conversation flow to collect agricultural data
- **ML Predictions**: AI-powered recommendations for crop cultivation
- **Location Detection**: Automatic GPS-based location and language detection
- **Multilingual Ready**: Architecture supports adding Indian languages
- **Frosted Glass UI**: Modern, futuristic design with gradient backgrounds

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Canvas API for 3D orb animations
- Web Speech API for STT/TTS

### Backend
- Node.js + Express
- Supabase for database
- REST API for ML predictions

## Project Structure

```
src/
├── components/
│   ├── Header.tsx           # App logo and branding
│   ├── VoiceOrb.tsx         # 3D animated orb
│   ├── ChatPanel.tsx        # Chat message display
│   └── VoiceControls.tsx    # Voice/text input controls
├── hooks/
│   ├── useChatflow.ts       # Chatflow logic and state
│   ├── useVoice.ts          # STT/TTS handling
│   └── useLocation.ts       # GPS location detection
├── App.tsx                  # Main app component
└── index.css                # Global styles
```

## Chatflow

The application follows a strict 6-step conversation flow:

1. **Welcome**: "Welcome to AGRI AI"
2. **Step 1**: Ask for crop type
3. **Step 2**: Ask for land size in hectares
4. **Step 3**: Ask for cultivation start date
5. **Step 4**: Confirm collected data
6. **Step 5**: Send data to ML model
7. **Step 6**: Display predictions and recommendations

## Data Structure

```typescript
{
  crop_type: string,
  land_size_hectares: string,
  start_date: string,
  location: {
    lat: number,
    lon: number,
    region: string
  },
  language: string
}
```

## Running the Application

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the frontend (runs on port 5173):
```bash
npm run dev
```

Start the backend API server (runs on port 3001):
```bash
npm run server
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Database Schema

The application uses Supabase with the following tables:

- **chat_sessions**: Stores user session data
- **agricultural_data**: Stores collected crop information
- **ml_predictions**: Stores ML model predictions
- **chat_messages**: Stores conversation history

All tables have Row Level Security (RLS) enabled with public access policies for anonymous users.

## API Endpoints

### POST /api/predict

Sends collected agricultural data to the ML model and returns predictions.

**Request Body:**
```json
{
  "crop_type": "Rice",
  "land_size_hectares": "2.5",
  "start_date": "2024-01-15",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090,
    "region": "India"
  },
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "crop": "Rice",
    "recommended_fertilizer": "NPK 20-10-10",
    "estimated_yield": "8.75 tons",
    "water_requirement": "12500 liters/day",
    "optimal_harvest_date": "2024-04-15",
    "success_probability": "85%",
    "recommendations": [...]
  }
}
```

## Voice Features

### Speech-to-Text (STT)
Uses Web Speech API (webkit/Chrome only) for voice input. Falls back to text input if not supported.

### Text-to-Speech (TTS)
Uses Web Speech Synthesis API to read system messages aloud automatically.

### Audio Visualization
Visualizes microphone input with real-time audio level detection during listening state.

## Extending the Application

### Adding New Languages

1. Update `getDefaultLanguage()` in `src/hooks/useLocation.ts`
2. Add language-specific recognition in `useVoice.ts`
3. Implement translation service for system messages

### Customizing the ML Model

Replace the mock ML endpoint in `server.js` with your actual ML model:

```javascript
app.post('/api/predict', async (req, res) => {
  const result = await yourMLModel.predict(req.body);
  res.json(result);
});
```

### Adding New Steps to Chatflow

Update `useChatflow.ts` to add additional data collection steps:

1. Add new step to `STEP_QUESTIONS`
2. Update `ChatStep` type
3. Add handling in `processUserInput()`

## Design Principles

- **Futuristic & Minimalist**: Clean lines, subtle animations, muted green palette
- **Voice-First**: Optimized for voice interaction with visual feedback
- **Accessible**: Falls back to text input, clear visual hierarchy
- **Production-Ready**: Error handling, loading states, responsive design

## Browser Support

- Chrome/Edge (full voice support)
- Safari (TTS only, no STT)
- Firefox (TTS only, no STT)

## License

MIT
