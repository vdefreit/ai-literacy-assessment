/**
 * Configuration for AI-powered recommendations
 * 
 * IMPORTANT: Copy this file to config.js and add your OpenAI API key
 * 
 * SECURITY NOTE: Never commit config.js to GitHub!
 * The actual config.js file is in .gitignore
 * 
 * For production use, you should:
 * 1. Use a serverless function (Netlify/Vercel) as a proxy
 * 2. Or implement rate limiting and domain restrictions in OpenAI dashboard
 * 3. Monitor usage to prevent abuse
 */

const CONFIG = {
    // Add your OpenAI API key here
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    
    // OpenAI settings
    OPENAI_MODEL: 'gpt-4o', // or 'gpt-4-turbo' for faster responses
    OPENAI_MAX_TOKENS: 1500,
    OPENAI_TEMPERATURE: 0.7,
    
    // Feature flags
    USE_AI_RECOMMENDATIONS: true, // Set to false to use static recommendations
    
    // Fallback behavior
    FALLBACK_ON_ERROR: true // Use static recommendations if AI fails
};
