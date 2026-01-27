/**
 * ============================================================================
 * Windmill Script: OpenAI Proxy for AI Literacy Assessment
 * ============================================================================
 * 
 * COPY THIS ENTIRE FILE INTO WINDMILL
 * 
 * Resource Path: u/VinceDeFreitas/rapid_openai
 * Script Name: openai_proxy (or any name you prefer)
 * Language: TypeScript
 * 
 * ============================================================================
 * DEPLOYMENT STEPS:
 * ============================================================================
 * 
 * 1. Go to https://twilio.windmill.dev
 * 2. Click "Scripts" → "+ New Script"
 * 3. Choose "TypeScript" as language
 * 4. Name it: openai_proxy
 * 5. Copy and paste this ENTIRE file
 * 6. Click "Save"
 * 7. Go to Settings tab:
 *    - Enable "Webhook/Public"
 *    - Add CORS origins:
 *      • http://localhost:8080
 *      • https://yourusername.github.io (your actual GitHub Pages URL)
 * 8. Copy the webhook URL (it will look like):
 *    https://twilio.windmill.dev/api/w/td/jobs/run_wait_result/u/VinceDeFreitas/openai_proxy
 * 9. Update config.js with this URL
 * 
 * ============================================================================
 */

type OpenAIResource = {
  api_key: string;
};

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

/**
 * Main function - Windmill will execute this
 * 
 * IMPORTANT: The parameter name 'rapid_openai' must match your resource path
 * Resource path: u/VinceDeFreitas/rapid_openai
 * 
 * @param rapid_openai - OpenAI resource (auto-injected by Windmill)
 * @param messages - Array of chat messages
 * @param model - OpenAI model (default: gpt-4o)
 * @param max_tokens - Max response tokens (default: 1500)
 * @param temperature - Creativity 0-1 (default: 0.7)
 */
export async function main(
  rapid_openai: OpenAIResource,
  messages: OpenAIMessage[],
  model: string = 'gpt-4o',
  max_tokens: number = 1500,
  temperature: number = 0.7
) {
  // ============================================================================
  // INPUT VALIDATION
  // ============================================================================
  
  if (!messages || messages.length === 0) {
    return {
      success: false,
      error: 'Messages array is required and cannot be empty'
    };
  }

  // Validate each message
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return {
        success: false,
        error: 'Each message must have "role" and "content" properties'
      };
    }
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      return {
        success: false,
        error: 'Message role must be "system", "user", or "assistant"'
      };
    }
  }

  // ============================================================================
  // CALL OPENAI API
  // ============================================================================
  
  try {
    console.log(`Calling OpenAI with model: ${model}, max_tokens: ${max_tokens}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rapid_openai.api_key}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: max_tokens,
        temperature: temperature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API Error: ${response.status} - ${errorText}`);
      
      return {
        success: false,
        error: `OpenAI API returned ${response.status}`,
        details: errorText
      };
    }

    const data = await response.json();
    
    // Extract the response content
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        error: 'No content in OpenAI response',
        raw_data: data
      };
    }

    // ============================================================================
    // RETURN SUCCESS RESPONSE
    // ============================================================================
    
    return {
      success: true,
      response: content,  // The AI's text response
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0
      },
      model: data.model,
      finish_reason: data.choices?.[0]?.finish_reason
    };

  } catch (error: any) {
    // ============================================================================
    // ERROR HANDLING
    // ============================================================================
    
    console.error('Error in Windmill script:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      error_type: error.name,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * ============================================================================
 * TESTING IN WINDMILL
 * ============================================================================
 * 
 * Use this test input in Windmill's test panel:
 * 
 * {
 *   "messages": [
 *     {
 *       "role": "system",
 *       "content": "You are a helpful assistant."
 *     },
 *     {
 *       "role": "user",
 *       "content": "Say hello and confirm you're working. Be brief."
 *     }
 *   ],
 *   "model": "gpt-4o",
 *   "max_tokens": 100,
 *   "temperature": 0.7
 * }
 * 
 * Expected output:
 * {
 *   "success": true,
 *   "response": "Hello! I'm working correctly.",
 *   "usage": { ... },
 *   "model": "gpt-4o",
 *   "finish_reason": "stop"
 * }
 * 
 * ============================================================================
 */
