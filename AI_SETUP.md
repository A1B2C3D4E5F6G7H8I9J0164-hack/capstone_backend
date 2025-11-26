# Google Gemini AI Integration Setup

## Overview
The AI summarization feature uses Google's Gemini Pro model to generate intelligent summaries from user notes.

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (you can view it again later)

### 2. Add API Key to Environment Variables

#### Local Development
Add to your `.env` file in the backend directory:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Production Deployment
Add the environment variable in your deployment platform (Render, Railway, Heroku, etc.):
- Variable Name: `GEMINI_API_KEY`
- Value: Your Gemini API key

### 3. Install Dependencies
The Google Generative AI package is already included in `package.json`. If you need to reinstall:
```bash
npm install @google/generative-ai
```

## Usage

### API Endpoint
```
POST /api/ai/summarize
```

### Request Body
```json
{
  "notes": "Your notes text here..."
}
```

### Response
```json
{
  "summary": "AI-generated summary..."
}
```

### Authentication
The endpoint requires a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Features

- **Smart Summarization**: Uses Gemini Pro to understand context and generate meaningful summaries
- **Structured Output**: AI formats summaries with clear sections and bullet points
- **Key Takeaways**: Extracts important insights from notes
- **Error Handling**: Graceful fallback if API key is not configured

## Cost Considerations

- Gemini Pro is free for most use cases (generous free tier)
- Each summary uses approximately 500-1000 tokens
- Consider implementing rate limiting for production use
- Check [Google AI Studio pricing](https://ai.google.dev/pricing) for current rates

## Troubleshooting

### "AI service is not configured"
- Make sure `GEMINI_API_KEY` is set in your environment variables
- Restart your server after adding the environment variable

### "Invalid API key"
- Verify your API key is correct
- Check if your Google account has API access enabled
- Make sure you're using the correct API key from Google AI Studio

### Rate Limit Errors
- Gemini has rate limits based on your usage
- Free tier has generous limits but may throttle at high usage
- Consider implementing request queuing or caching

## Security Notes

- **Never commit API keys to version control**
- Store API keys only in environment variables
- Use different API keys for development and production
- Monitor API usage to detect any unauthorized access

