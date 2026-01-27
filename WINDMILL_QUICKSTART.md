# Quick Start: Windmill Backend Setup

## 📋 Checklist

- [ ] **Step 1**: Create Windmill account at [windmill.dev](https://app.windmill.dev)
- [ ] **Step 2**: Add OpenAI API key as Resource in Windmill
- [ ] **Step 3**: Deploy `windmill-openai-proxy.ts` script
- [ ] **Step 4**: Copy webhook URL from script settings
- [ ] **Step 5**: Enable "Webhook/Public API" in script settings
- [ ] **Step 6**: Add CORS origins (your GitHub Pages URL + localhost)
- [ ] **Step 7**: Update `config.js` with webhook URL
- [ ] **Step 8**: Test locally
- [ ] **Step 9**: Push to GitHub
- [ ] **Step 10**: Enable GitHub Pages
- [ ] **Step 11**: Test production

## 🔑 Key URLs You'll Need

1. **Windmill Webhook URL** (from Step 4):
   ```
   https://app.windmill.dev/api/w/[workspace]/jobs/run/u/[user]/[script]
   ```
   → Add this to `config.js` as `WINDMILL_ENDPOINT`

2. **GitHub Pages URL** (after Step 10):
   ```
   https://[your-username].github.io/[repo-name]/
   ```
   → Add this to Windmill CORS settings

## 🧪 Quick Test Commands

### Test Locally
```bash
cd "/Users/vdefreitas/Downloads/AI Questionaire Build"
python3 -m http.server 8080
# Open http://localhost:8080
```

### Deploy to GitHub
```bash
git add .
git commit -m "Configure Windmill backend"
git push
```

### Test Windmill Endpoint
```bash
curl -X POST "YOUR_WINDMILL_URL" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"model":"gpt-4o"}'
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Add GitHub Pages URL to Windmill allowed origins |
| 404 error | Check webhook URL in config.js |
| Still using static recommendations | Verify `WINDMILL_ENDPOINT` is not `'YOUR_WINDMILL_WEBHOOK_URL_HERE'` |
| API key error | Check OpenAI resource is configured in Windmill |

## 📝 Files Modified

- ✅ `config.js` - Now uses Windmill endpoint (API key removed!)
- ✅ `app.js` - Updated to call Windmill instead of OpenAI directly
- ✅ `windmill-openai-proxy.ts` - New backend script for Windmill
- ✅ `DEPLOYMENT_GUIDE.md` - Complete step-by-step instructions

## 🎯 What You've Achieved

✅ **API Key Security**: Key stored in Windmill, not exposed in browser  
✅ **Backend Architecture**: Proper separation of frontend/backend  
✅ **Free Hosting**: GitHub Pages for frontend  
✅ **Scalability**: Windmill handles backend logic  
✅ **CORS Protected**: Only your domain can access the API  

## 📚 Full Instructions

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.
