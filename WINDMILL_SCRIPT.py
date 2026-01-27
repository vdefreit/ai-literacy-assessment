"""
============================================================================
Windmill Script: OpenAI Proxy for AI Literacy Assessment (Python)
============================================================================

COPY THIS ENTIRE FILE INTO WINDMILL

Resource Path: u/VinceDeFreitas/rapid_openai
Script Name: openai_proxy
Language: Python

============================================================================
DEPLOYMENT STEPS:
============================================================================

1. Go to https://twilio.windmill.dev
2. Click "Scripts" → "+ New Script"
3. Choose "Python" as language
4. Name it: openai_proxy
5. Copy and paste this ENTIRE file
6. Click "Save"
7. Go to Settings tab → Permissions section:
   - Find "Generate a webhook-specific token" or "Public webhook"
   - Click "Generate token" (this creates a static token for this endpoint)
   - Copy the generated token AND the webhook URL
8. The webhook URL should be:
   https://twilio.windmill.dev/api/w/td/jobs/run/u/VinceDeFreitas/openai_proxy
   (Note: use /run NOT /run_wait_result for async)
9. Update config.js with BOTH the URL and the token
10. Add CORS origins in Settings if available:
    • http://localhost:8080
    • https://yourusername.github.io

============================================================================
TESTING IN WINDMILL:
============================================================================

Test input:
{
  "messages": [
    {"role": "user", "content": "Hello, are you working?"}
  ],
  "model": "gpt-4o",
  "max_tokens": 100
}

Expected output:
{
  "success": true,
  "response": "Hello! Yes, I'm working correctly.",
  "usage": {...}
}

============================================================================
"""

import requests
from typing import List, Dict, Any

def main(
    rapid_openai: dict,
    messages: List[Dict[str, str]],
    model: str = "gpt-4o",
    max_tokens: int = 1500,
    temperature: float = 0.7
) -> dict:
    """
    OpenAI API proxy for AI Literacy Assessment
    
    Args:
        rapid_openai: OpenAI resource (contains api_key)
        messages: List of message dicts with 'role' and 'content'
        model: OpenAI model to use
        max_tokens: Maximum tokens in response
        temperature: Creativity setting (0-1)
    
    Returns:
        dict: Response with success status and AI content
    """
    
    # ============================================================================
    # INPUT VALIDATION
    # ============================================================================
    
    if not messages or len(messages) == 0:
        return {
            "success": False,
            "error": "Messages array is required and cannot be empty"
        }
    
    # Validate each message
    for msg in messages:
        if "role" not in msg or "content" not in msg:
            return {
                "success": False,
                "error": "Each message must have 'role' and 'content' keys"
            }
        if msg["role"] not in ["system", "user", "assistant"]:
            return {
                "success": False,
                "error": "Message role must be 'system', 'user', or 'assistant'"
            }
    
    # ============================================================================
    # CALL OPENAI API
    # ============================================================================
    
    try:
        print(f"Calling OpenAI with model: {model}, max_tokens: {max_tokens}")
        
        # Get API key from resource
        api_key = rapid_openai.get("api_key")
        if not api_key:
            return {
                "success": False,
                "error": "API key not found in rapid_openai resource"
            }
        
        # Make request to OpenAI
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            },
            timeout=60
        )
        
        # Check for errors
        if not response.ok:
            error_text = response.text
            print(f"OpenAI API Error: {response.status_code} - {error_text}")
            return {
                "success": False,
                "error": f"OpenAI API returned {response.status_code}",
                "details": error_text
            }
        
        data = response.json()
        
        # Extract content
        content = data.get("choices", [{}])[0].get("message", {}).get("content")
        
        if not content:
            return {
                "success": False,
                "error": "No content in OpenAI response",
                "raw_data": data
            }
        
        # ============================================================================
        # RETURN SUCCESS RESPONSE
        # ============================================================================
        
        return {
            "success": True,
            "response": content,
            "usage": {
                "prompt_tokens": data.get("usage", {}).get("prompt_tokens", 0),
                "completion_tokens": data.get("usage", {}).get("completion_tokens", 0),
                "total_tokens": data.get("usage", {}).get("total_tokens", 0)
            },
            "model": data.get("model"),
            "finish_reason": data.get("choices", [{}])[0].get("finish_reason")
        }
    
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "Request to OpenAI timed out after 60 seconds"
        }
    
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"Network error: {str(e)}"
        }
    
    except Exception as e:
        # ============================================================================
        # ERROR HANDLING
        # ============================================================================
        
        print(f"Error in Windmill script: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }
