# Windmill Configuration Troubleshooting

## Current Error
```
HTTP 401: Not authorized: Required scope: jobs:run:scripts:u/VinceDeFreitas/openai_key__2__
```

## What This Means
The Windmill script exists but isn't configured to accept public API calls (webhooks).

## Solution Steps

### Step 1: Access Windmill Dashboard
1. Go to: https://twilio.windmill.dev
2. Log in with your credentials

### Step 2: Locate Your Script
1. Click **Scripts** in the left sidebar
2. Find: `u/VinceDeFreitas/openai_key__2__`
3. Click to open it

### Step 3: Enable Public Webhook
1. Click the **Settings** tab (or gear icon)
2. Look for **"Webhook"** or **"Public endpoint"** section
3. **Toggle ON** the webhook/public option
4. You should see a webhook URL generated

### Step 4: Update config.js
Copy the new webhook URL and update `config.js`:

```javascript
WINDMILL_ENDPOINT: 'YOUR_NEW_WEBHOOK_URL_HERE',
```

### Step 5: Check if Token is Needed
- Some public webhooks work without the Bearer token
- Try removing the token first
- If it fails, the webhook settings might show a token/secret to use

### Step 6: Verify Resource Name
In your Windmill script, check the parameter name:
```typescript
export async function main(
  rapid_openai: OpenAIResource,  // <- This name matters!
  ...
)
```

Make sure you have a resource in Windmill named `rapid_openai` (or update the script to match your resource name).

## Alternative: Create New Script

If the script doesn't exist or is misconfigured, you can create a fresh one:

1. **In Windmill**: Scripts → New Script → TypeScript
2. **Name it**: `openai_proxy`
3. **Paste**: Contents from `windmill-openai-proxy.ts`
4. **Update resource parameter**: Match your actual OpenAI resource name
5. **Save & Deploy**
6. **Settings → Enable Webhook**
7. **Copy new webhook URL** to `config.js`

## Testing Commands

After fixing, test with curl:

```bash
# Test without token (if public webhook)
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "test"}],
    "model": "gpt-4o",
    "max_tokens": 50
  }'
```

Or refresh the test page: http://localhost:8080/test-windmill-api.html

## Common Issues

| Issue | Fix |
|-------|-----|
| 401 Unauthorized | Enable webhook in script settings |
| 404 Not Found | Check script path is correct |
| Resource not found | Verify OpenAI resource exists in Windmill |
| CORS error | Add `http://localhost:8080` to allowed origins |

## Need Help?

Check Windmill docs: https://docs.windmill.dev/docs/core_concepts/webhooks
