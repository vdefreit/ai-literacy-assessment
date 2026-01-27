# Windmill + GitHub Pages Deployment Guide

This guide will help you deploy your AI Literacy Assessment with Windmill as the secure backend and GitHub Pages as the frontend.

## Architecture Overview

```
[User Browser]
    ↓
[GitHub Pages] (Frontend: HTML, CSS, JS)
    ↓
[Windmill] (Backend: API proxy with secure API key)
    ↓
[OpenAI API] (via Twilio)
```

## Part 1: Set Up Windmill Backend

### Step 1: Create Windmill Account & Workspace
1. Go to [windmill.dev](https://app.windmill.dev)
2. Sign in with your account
3. Create or select a workspace

### Step 2: Store Your OpenAI API Key Securely
1. In Windmill, go to **Resources** (left sidebar)
2. Click **+ Add a resource**
3. Choose **openai** as the resource type (or **generic_api** if openai isn't available)
4. Fill in the details:
   - **Path**: `u/your-username/openai_twilio` (or any name you prefer)
   - **API Key**: Paste your Twilio-provided OpenAI API key
5. Click **Save**

### Step 3: Deploy the Windmill Script
1. In Windmill, go to **Scripts** (left sidebar)
2. Click **+ New script**
3. Choose **TypeScript** as the language
4. Name it: `openai_proxy` (or any name you prefer)
5. Copy the contents of `windmill-openai-proxy.ts` and paste into the editor
6. Update the resource parameter name if needed:
   - Find the line: `openai_key: OpenAIResource,`
   - If your resource path is different, update it in the script settings
7. Click **Save**

### Step 4: Make Script Publicly Accessible
1. In the script editor, click the **Settings** tab (top right)
2. Enable **Webhook / Public API**
3. You'll see a webhook URL like:
   ```
   https://app.windmill.dev/api/w/your-workspace/jobs/run/u/your-username/openai_proxy
   ```
4. **Copy this URL** - you'll need it for Step 5

### Step 5: Configure CORS (Cross-Origin Requests)
1. Still in script settings, find **Allowed Origins** or **CORS settings**
2. Add your GitHub Pages domain:
   ```
   https://your-username.github.io
   ```
3. For local testing, also add:
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   ```
4. Save settings

### Step 6: Test the Windmill Endpoint
1. In Windmill, click **Test** on your script
2. Provide test input:
   ```json
   {
     "messages": [
       {"role": "system", "content": "You are a helpful assistant."},
       {"role": "user", "content": "Say hello!"}
     ],
     "model": "gpt-4o",
     "max_tokens": 100,
     "temperature": 0.7
   }
   ```
3. Click **Run**
4. Verify you get a response with `"success": true`

## Part 2: Update Your Frontend Configuration

### Step 7: Update config.js
1. Open `config.js` in your project
2. Replace `YOUR_WINDMILL_WEBHOOK_URL_HERE` with the webhook URL from Step 4:
   ```javascript
   WINDMILL_ENDPOINT: 'https://app.windmill.dev/api/w/your-workspace/jobs/run/u/your-username/openai_proxy',
   ```
3. Save the file

### Step 8: Test Locally
1. Open your project in a local server:
   ```bash
   # Using Python
   python3 -m http.server 8080
   
   # Or using Node.js
   npx serve
   ```
2. Open `http://localhost:8080` in your browser
3. Complete a few questions and check if AI recommendations work
4. Check browser console for any errors

## Part 3: Deploy to GitHub Pages

### Step 9: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click **New repository**
3. Name it: `ai-literacy-assessment` (or any name)
4. Make it **Public** (required for free GitHub Pages)
5. Don't initialize with README (we'll push existing code)
6. Click **Create repository**

### Step 10: Push Your Code to GitHub
```bash
# Navigate to your project directory
cd "/Users/vdefreitas/Downloads/AI Questionaire Build"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Literacy Assessment with Windmill backend"

# Add remote (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 11: Enable GitHub Pages
1. In your GitHub repository, go to **Settings**
2. Scroll down to **Pages** (left sidebar)
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. GitHub will show you the URL:
   ```
   https://your-username.github.io/repo-name/
   ```
6. Wait 1-2 minutes for deployment

### Step 12: Update Windmill CORS with Final Domain
1. Go back to Windmill
2. Open your `openai_proxy` script settings
3. Add your actual GitHub Pages URL to allowed origins:
   ```
   https://your-username.github.io
   ```
4. Save

### Step 13: Test Production Deployment
1. Visit your GitHub Pages URL
2. Complete the assessment
3. Verify AI recommendations are working
4. Check browser console for any CORS or API errors

## Part 4: Security & Best Practices

### ✅ What You've Secured
- ✅ API key is stored in Windmill (not in browser code)
- ✅ Frontend code is public but contains no secrets
- ✅ CORS restricts which domains can call your endpoint

### 🔒 Additional Security Recommendations

1. **Rate Limiting** (Optional but recommended):
   - In Windmill script, add logic to track and limit requests per user/IP
   - Use Windmill's built-in state or external database

2. **Authentication** (For production):
   - Consider adding simple token authentication
   - Generate a secret token and add to both frontend and Windmill
   - Only accept requests with valid token

3. **Usage Monitoring**:
   - Check Windmill's job history regularly
   - Monitor OpenAI usage in your Twilio dashboard
   - Set up budget alerts

4. **Error Handling**:
   - Your app already falls back to static recommendations on error
   - Monitor error rates in Windmill logs

## Troubleshooting

### Issue: CORS Error
**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
- Verify your GitHub Pages URL is in Windmill's allowed origins
- Make sure there are no trailing slashes or http/https mismatches
- Clear browser cache and try again

### Issue: 404 Not Found from Windmill
**Error**: `404 when calling Windmill endpoint`

**Solution**:
- Double-check the webhook URL in config.js
- Verify the script is deployed (not just saved)
- Check if webhook is enabled in script settings

### Issue: API Key Error
**Error**: `Invalid API key` or `Unauthorized`

**Solution**:
- Verify the OpenAI resource is properly configured in Windmill
- Check that the resource path matches the parameter in your script
- Test the script directly in Windmill first

### Issue: AI Recommendations Not Showing
**Error**: App shows static recommendations instead of AI-generated ones

**Solution**:
- Open browser console and check for error messages
- Verify `CONFIG.WINDMILL_ENDPOINT` is set correctly
- Check that `CONFIG.USE_AI_RECOMMENDATIONS` is `true`
- Test the Windmill endpoint directly using curl or Postman

## Testing with curl

You can test your Windmill endpoint from the command line:

```bash
curl -X POST "YOUR_WINDMILL_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Say hello!"}
    ],
    "model": "gpt-4o",
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

Expected response:
```json
{
  "success": true,
  "content": "Hello! How can I assist you today?",
  "usage": {...},
  "model": "gpt-4o",
  "finish_reason": "stop"
}
```

## Updating Your App

### To Make Changes:
1. Edit files locally
2. Test locally first
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. GitHub Pages will automatically redeploy (1-2 minutes)

### To Update Windmill Script:
1. Make changes in Windmill's script editor
2. Save (automatically deploys)
3. No need to update frontend unless API contract changes

## Cost Considerations

- **GitHub Pages**: Free for public repositories
- **Windmill**: 
  - Free tier: 1,000 executions/month
  - Check current pricing at [windmill.dev/pricing](https://www.windmill.dev/pricing)
- **OpenAI via Twilio**: 
  - Check your Twilio plan for usage limits
  - Monitor usage to avoid unexpected charges

## Next Steps

- [ ] Set up monitoring/alerting for API usage
- [ ] Add analytics to track assessment completions
- [ ] Consider adding user authentication
- [ ] Implement rate limiting in Windmill
- [ ] Create staging/production environments

---

## Support

- **Windmill Docs**: https://docs.windmill.dev
- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **OpenAI API Docs**: https://platform.openai.com/docs

Need help? Check the browser console for errors and Windmill's job history for backend issues.
