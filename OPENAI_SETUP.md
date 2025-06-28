# OpenAI API Setup Instructions

## Local Development

Create a `.env.local` file in the root directory and add:

```env
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

## Vercel Deployment

Add the environment variable in your Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables  
3. Add `OPENAI_API_KEY` with your OpenAI API key value

## Features

The AI integration provides:
- 🤖 AI-powered price analysis using GPT-4o-mini
- 📄 File content analysis for better pricing accuracy
- 🇬🇭 Ghana-specific pricing guidelines
- 💰 Dual pricing system (logic-based + AI suggestion)

## Security

- API key is never exposed to the client
- All OpenAI calls are made through secure API routes
- File parsing happens server-side only 