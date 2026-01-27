# Google Sheets Setup with Personal Account

This guide shows you how to use your personal Google account to collect assessment data in a Google Sheet, then share it securely with colleagues.

## Step 1: Create Your Personal Google Sheet (5 minutes)

### 1.1 Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) (use your **personal Gmail** account)
2. Click **Blank** to create a new spreadsheet
3. Name it: **"AI Assessment Data - Twilio"**

### 1.2 Create Two Sheet Tabs

**Sheet 1 - Rename to "Summary":**
- Click on "Sheet1" tab at bottom
- Rename to **"Summary"**
- In row 1, paste these headers (tab-separated):

```
Timestamp	Team	Job Title	Job Level	Overall Score	Overall Maturity	Has Not Started	Delegation Score	Communication Score	Discernment Score	Keeping It Twilio Score	Delegation Maturity	Communication Maturity	Discernment Maturity	Keeping It Twilio Maturity
```

**Sheet 2 - Create "Responses" tab:**
- Click **+** at bottom to add a new sheet
- Name it **"Responses"**
- In row 1, paste these headers (tab-separated):

```
Timestamp	Team	Job Title	Job Level	Question ID	Category	Value	Maturity
```

This second sheet will have one row per question answered, making it perfect for analyzing response patterns!

### 1.3 Get Your Spreadsheet ID

- Look at the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
- Copy the **SPREADSHEET_ID** (the long string between `/d/` and `/edit`)
- Save it - you'll need it later

Example:
- URL: `https://docs.google.com/spreadsheets/d/1abc123XYZ789def456/edit`
- ID: `1abc123XYZ789def456`

---

## Step 2: Create Google Cloud Service Account (10 minutes)

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com) (use same personal Gmail)
2. Click **Select a project** → **New Project**
3. Name: **"AI Assessment Logger"**
4. Click **Create**

### 2.2 Enable Google Sheets API

1. In your new project, click **APIs & Services** → **Library**
2. Search: **"Google Sheets API"**
3. Click it → Click **Enable**

### 2.3 Create Service Account

1. **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - **Name**: `assessment-logger`
   - **Description**: "Logs AI assessment responses to Google Sheets"
4. Click **Create and Continue**
5. **Skip** the roles step (click **Continue**)
6. Click **Done**

### 2.4 Create Service Account Key

1. Click on the service account you just created (`assessment-logger@...`)
2. Go to **Keys** tab
3. **Add Key** → **Create new key**
4. Choose **JSON**
5. Click **Create**
6. A JSON file downloads → **Save it securely!**

### 2.5 Get the Service Account Email

1. Open the downloaded JSON file
2. Find the `client_email` field
3. Copy the email (looks like: `assessment-logger@project-123456.iam.gserviceaccount.com`)

---

## Step 3: Share Your Sheet with Service Account

1. Open your Google Sheet
2. Click **Share** button (top right)
3. Paste the **service account email** from Step 2.5
4. Set permission to **Editor**
5. **Uncheck** "Notify people"
6. Click **Share**

---

## Step 4: Add Credentials to Windmill (3 minutes)

### 4.1 Create Windmill Resource

1. Go to [Windmill](https://twilio.windmill.dev)
2. Navigate to **Resources**
3. Click **Add Resource**
4. Choose **Generic Resource** (or **Google Service Account** if available)
5. Name it: `u/VinceDeFreitas/personal_google_sheets`
6. Open your downloaded JSON file from Step 2.4
7. Copy the **entire contents** of the JSON file
8. Paste into the resource value field
9. Click **Save**

---

## Step 5: Update the Logging Script (2 minutes)

1. Go to Windmill → Scripts → `u/VinceDeFreitas/log_assessment_response`
2. Click **Edit**
3. Replace with the code from [windmill-sheets-personal.py](windmill-sheets-personal.py)
4. **Update line 17** with your Spreadsheet ID from Step 1.3
5. Click **Save** and **Deploy**

---

## Step 6: Test It! (1 minute)

1. In the Windmill script view, click **Run**
2. Use this test data:

```json
{
  "timestamp": "2026-01-27T10:30:00Z",
  "team": "Engineering",
  "jobTitle": "Software Engineer",
  "jobLevel": "S2",
  "overallScore": 2.5,
  "overallMaturity": "Compliant",
  "hasNotStarted": false,
  "categoryScores": {
    "Delegation": 2.3,
    "Communication": 2.7,
    "Discernment": 2.4,
    "Keeping It Twilio": 2.6
  },
  "categoryMaturities": {
    "Delegation": "Compliant",
    "Communication": "Competent",
    "Discernment": "Compliant",
    "Keeping It Twilio": "Compliant"
  },
  "responses": {
    "q1": {"category": "Delegation", "value": 2, "maturity": "Compliant"}
  }
}
```

3. Click **Run**
4. Check your Google Sheet - you should see a new row! 🎉

---

## Step 7: Share with Colleagues

### Option A: View-Only Access

1. Open your Google Sheet
2. Click **Share**
3. Add colleague emails: `vdefreitas@twilio.com`, others
4. Set to **Viewer** (they can see but not edit)
5. Click **Send**

### Option B: Share Link

1. Click **Share** → **Get link**
2. Change to **Anyone with the link** → **Viewer**
3. Copy link and share via email/Slack

### Option C: Embed in Dashboard

Create a Google Sites page or internal wiki with the sheet embedded (read-only).

---

## Analytics & Reports

### Summary Sheet - Overall Analytics

**Pivot Tables:**
1. **Data** → **Pivot table**
2. Rows: Team
3. Values: Overall Score (average)

**Query Formulas:**

**Count by Team:**
```
=QUERY(A2:O, "SELECT B, COUNT(B) WHERE B <> '' GROUP BY B LABEL COUNT(B) 'Responses'")
```

**Average Score by Job Level:**
```
=QUERY(A2:O, "SELECT D, AVG(E) WHERE D <> '' GROUP BY D LABEL AVG(E) 'Avg Score'")
```

### Responses Sheet - Question-Level Analytics

This is where the magic happens! You can analyze individual question responses.

**Pivot Table: Response Distribution by Question**
1. Go to **Responses** sheet
2. **Data** → **Pivot table**
3. Setup:
   - **Rows**: Question ID
   - **Columns**: Value (1, 2, 3, 4)
   - **Values**: COUNTA of Value
   - **Filters**: Team, Job Level

This shows how many people selected each option for each question!

**Pivot Table: Response Patterns by Team**
1. **Rows**: Team, Question ID
2. **Columns**: Maturity
3. **Values**: Count

**Query: Most Common Response per Question**
```
=QUERY(Responses!A2:H, "SELECT E, G, COUNT(G) WHERE E <> '' GROUP BY E, G ORDER BY E, COUNT(G) DESC")
```

**Query: Questions Where Most People Answer "Not Started"**
```
=QUERY(Responses!A2:H, "SELECT E, COUNT(E) WHERE G = 1 GROUP BY E ORDER BY COUNT(E) DESC LABEL COUNT(E) 'Not Started Count'")
```

**Query: Engineering Team Response Distribution for Question 1**
```
=QUERY(Responses!A2:H, "SELECT G, COUNT(G) WHERE B = 'Engineering' AND E = 'q1' GROUP BY G LABEL G 'Response Value', COUNT(G) 'Count'")
```

**Chart: Response Distribution Across All Questions**
1. Create pivot table with Question ID (rows) and Value (columns)
2. Insert → Chart → Stacked bar chart
3. Shows visual distribution of responses

---

## Security & Privacy

✅ **Your personal Google account** - Full control  
✅ **Service account access only** - Only Windmill can write  
✅ **Share with specific emails** - Control who sees data  
✅ **Version history** - Track all changes  
✅ **Export anytime** - Download as CSV/Excel  

---

## Troubleshooting

### "Insufficient permissions" error
- Make sure you shared the sheet with the service account email
- Check that service account has **Editor** permissions

### "Spreadsheet not found"
- Double-check the Spreadsheet ID in the script (line 17)
- Make sure the sheet isn't in trash

### No data appearing
- Check Windmill execution logs for errors
- Verify the JSON key is correct in Windmill Resources
- Test the script manually in Windmill first

---

## Maintenance

**Weekly:**
- Review new responses in the sheet
- Share insights with stakeholders

**Monthly:**
- Export data as backup (File → Download → CSV)
- Archive old data to a separate sheet tab

**As Needed:**
- Add colleagues to share list
- Update pivot tables/charts
- Create new views for different teams

---

You're all set! Your assessment data will now flow into your personal Google Sheet where you can easily analyze and share it with colleagues.
