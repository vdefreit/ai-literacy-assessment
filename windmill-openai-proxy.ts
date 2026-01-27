/**
 * Windmill Script: OpenAI Proxy for AI Literacy Assessment
 * 
 * This script acts as a secure backend proxy between your GitHub Pages frontend
 * and the OpenAI API (via Twilio). It keeps your API key secure in Windmill.
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. In Windmill:
 *    a. Go to Resources → Add Resource
 *    b. Create a new resource of type "openai" or "generic api key"
 *    c. Name it: "openai_twilio"
 *    d. Add your Twilio-provided OpenAI API key
 * 
 * 2. Deploy this script:
 *    a. Create a new script in Windmill
 *    b. Set language to TypeScript
 *    c. Paste this code
 *    d. Save and deploy
 * 
 * 3. Configure as HTTP endpoint:
 *    a. Go to the script settings
 *    b. Enable "Webhook/Public" 
 *    c. Copy the webhook URL (you'll add this to config.js)
 * 
 * 4. CORS Configuration:
 *    a. In script settings, add your GitHub Pages domain to allowed origins
 *    b. Example: https://yourusername.github.io
 *    c. For testing locally, also add: http://localhost:8080 or http://127.0.0.1:8080
 */

type OpenAIResource = {
  api_key: string;
};

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type RequestPayload = {
  messages: OpenAIMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
};

/**
 * Main function that Windmill will execute
 * 
 * @param rapid_openai - The OpenAI resource configured in Windmill (auto-injected)
 * @param messages - Array of chat messages from the frontend
 * @param model - OpenAI model to use (default: gpt-4o)
 * @param max_tokens - Maximum tokens in response (default: 1500)
 * @param temperature - Creativity setting 0-1 (default: 0.7)
 */
export async function main(
  rapid_openai: OpenAIResource,
  messages: OpenAIMessage[],
  model: string = 'gpt-4o',
  max_tokens: number = 1500,
  temperature: number = 0.7
) {
  // Validate input
  if (!messages || messages.length === 0) {
    throw new Error('Messages array is required and cannot be empty');
  }

  // Validate messages structure
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      throw new Error('Each message must have "role" and "content" properties');
    }
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      throw new Error('Message role must be "system", "user", or "assistant"');
    }
  }

  try {
    // Call OpenAI API
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
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Return the complete response
    return {
      success: true,
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      finish_reason: data.choices[0].finish_reason
    };

  } catch (error: any) {
    console.error('Error calling OpenAI:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * ALTERNATIVE VERSION: If you prefer to use Windmill's built-in OpenAI integration
 * 
 * Uncomment this if you want to use Windmill's native OpenAI resource type:
 * 
 * import { Resource } from 'windmill-client';
 * 
 * export async function main(
 *   openai: Resource<'openai'>,
 *   messages: OpenAIMessage[],
 *   model: string = 'gpt-4o',
 *   max_tokens: number = 1500,
 *   temperature: number = 0.7
 * ) {
 *   // Windmill handles the API call automatically
 *   return await openai.chat.completions.create({
 *     model: model,
 *     messages: messages,
 *     max_tokens: max_tokens,
 *     temperature: temperature
 *   });
 * }
 */
