# OpenAI AI Integration Setup

## Overview
The AI summarization feature uses OpenAI's GPT-3.5-turbo model to generate intelligent summaries from user notes.

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (you'll only see it once!)

### 2. Add API Key to Environment Variables

#### Local Development
Add to your `.env` file in the backend directory:
```
OPENAI_API_KEY=sk-your-api-key-here
```

#### Production Deployment
Add the environment variable in your deployment platform (Render, Railway, Heroku, etc.):
- Variable Name: `OPENAI_API_KEY`
- Value: Your OpenAI API key

### 3. Install Dependencies
The OpenAI package is already included in `package.json`. If you need to reinstall:
```bash
npm install openai
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

- **Smart Summarization**: Uses GPT-3.5-turbo to understand context and generate meaningful summaries
- **Structured Output**: AI formats summaries with clear sections and bullet points
- **Key Takeaways**: Extracts important insights from notes
- **Error Handling**: Graceful fallback if API key is not configured

## Cost Considerations

- GPT-3.5-turbo is cost-effective (~$0.0015 per 1K tokens)
- Each summary uses approximately 500 tokens
- Consider implementing rate limiting for production use

## Troubleshooting

### "AI service is not configured"
- Make sure `OPENAI_API_KEY` is set in your environment variables
- Restart your server after adding the environment variable

### "Invalid API key"
- Verify your API key is correct
- Check if your OpenAI account has credits/billing set up

### Rate Limit Errors
- OpenAI has rate limits based on your plan
- Consider implementing request queuing or caching

## Security Notes

- **Never commit API keys to version control**
- Store API keys only in environment variables
- Use different API keys for development and production
- Monitor API usage to detect any unauthorized access

