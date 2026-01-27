/**
 * Configuration for AI-powered recommendations
 * 
 * SECURITY: Using Windmill as backend proxy to keep API keys secure
 * The API key is stored in Windmill and never exposed to the browser.
 */

const CONFIG = {
    // Windmill endpoint URL
    // Updated with openai_proxy script (Python version)
    WINDMILL_ENDPOINT: 'https://twilio.windmill.dev/api/w/td/jobs/run_wait_result/p/u/VinceDeFreitas/openai_proxy',
    
    // Windmill authentication token (webhook-specific)
    WINDMILL_TOKEN: 'W4kC7pmiaClU37jMcMPeyZyJHv2Wlxtq',
    
    // OpenAI settings (passed to Windmill backend)
    OPENAI_MODEL: 'gpt-4o', // or 'gpt-4-turbo' for faster responses
    OPENAI_MAX_TOKENS: 1500,
    OPENAI_TEMPERATURE: 0.7,
    
    // Feature flags
    USE_AI_RECOMMENDATIONS: true, // Set to false to use static recommendations
    
    // Fallback behavior
    FALLBACK_ON_ERROR: true // Use static recommendations if AI fails
};
