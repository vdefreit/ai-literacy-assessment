# Secure API Key Setup

## ✅ Secure Option: Serverless Function (Recommended)

Your API key is now **completely hidden** from the browser when using the serverless function.

### Setup Steps:

1. **Deploy to Netlify:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login and deploy
   netlify login
   netlify init
   netlify deploy --prod
   ```

2. **Add API Key in Netlify Dashboard:**
   - Go to: Site Settings → Environment Variables
   - Add: `OPENAI_API_KEY` = your-actual-key
   - The key is now server-side only (never exposed to browser)

3. **Done!** The app automatically tries the secure serverless function first.

---

## ⚠️ Fallback Option: Direct API Call

If not using Netlify, the app falls back to calling OpenAI directly from the browser.

**Security Measures:**
- API key is in `config.js` (excluded from git via `.gitignore`)
- Add these protections in [OpenAI Dashboard](https://platform.openai.com/settings):
  - Set usage limits ($5-10/month)
  - Enable domain restrictions (only your domain can use the key)
  - Monitor usage regularly

---

## How It Works:

```
┌──────────────┐
│   Browser    │ ──→ Tries serverless function first
└──────────────┘     /.netlify/functions/generate-recommendations
                     (API key is on server, not in browser)
                     
                     ↓ Fallback if function doesn't exist
                     
                     Calls OpenAI API directly
                     (API key visible in browser - less secure)
```

The code automatically uses the most secure option available!
