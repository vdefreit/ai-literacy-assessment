# Google Sheets Setup Guide for Assessment Logging

This guide walks you through setting up Google Sheets as your data collection backend for anonymous assessment responses.

## Step 1: Create Your Google Sheet

### 1.1 Create a New Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name it **"AI Assessment Responses"**

### 1.2 Set Up Column Headers

In the first row, add these column headers:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Team | Job Title | Job Level | Overall Score | Overall Maturity | Has Not Started | Delegation Score | Communication Score | Discernment Score | Keeping It Twilio Score | Delegation Maturity |

Continue with more columns:

| M | N | O | P | Q | R |
|---|---|---|---|---|---|
| Communication Maturity | Discernment Maturity | Keeping It Twilio Maturity | Response Count | Question IDs | Question Values |

**Or use this simplified version** (copy/paste into row 1):

```
Timestamp	Team	Job Title	Job Level	Overall Score	Overall Maturity	Has Not Started	Delegation Score	Communication Score	Discernment Score	Keeping It Twilio Score	Delegation Maturity	Communication Maturity	Discernment Maturity	Keeping It Twilio Maturity	All Responses
```

### 1.3 Note Your Sheet Details

You'll need:
- **Spreadsheet ID**: Found in the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
- **Sheet Name**: Usually "Sheet1" (visible on the tab at bottom)

Example URL: `https://docs.google.com/spreadsheets/d/1abc123XYZ789/edit`
- Spreadsheet ID: `1abc123XYZ789`

---

## Step 2: Set Up Google Service Account in Windmill

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Name it **"Twilio Assessment Tool"**
4. Click **Create**

### 2.2 Enable Google Sheets API

1. In your project, go to **APIs & Services** → **Library**
2. Search for **"Google Sheets API"**
3. Click on it and click **Enable**

### 2.3 Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in details:
   - **Service account name**: `windmill-assessment-logger`
   - **Service account ID**: (auto-generated)
   - **Description**: "Logs assessment responses to Google Sheets"
4. Click **Create and Continue**
5. Skip roles (click **Continue**)
6. Click **Done**

### 2.4 Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create**
6. A JSON file will download - **save this securely!**

### 2.5 Share Your Sheet with Service Account

1. Open your Google Sheet
2. Click **Share** button (top right)
3. Copy the **service account email** from the JSON file
   - It looks like: `windmill-assessment-logger@project-id.iam.gserviceaccount.com`
4. Paste it in the share dialog
5. Give it **Editor** permissions
6. Uncheck **Notify people**
7. Click **Share**

---

## Step 3: Configure Windmill with Google Sheets

### 3.1 Create a Resource in Windmill

1. Go to [Windmill](https://twilio.windmill.dev)
2. Navigate to **Resources** → **Add Resource**
3. Select **Google Sheets** (or **Google Service Account**)
4. Name it: `google_sheets_assessment_logger`
5. Paste the entire JSON key file content
6. Click **Save**

---

## Step 4: Create the Windmill Script

### 4.1 Create New Script

1. In Windmill, go to **Scripts** → **New Script**
2. Choose **Python**
3. Set path: `u/VinceDeFreitas/log_assessment_response`
4. Copy the code below

### 4.2 Script Code

```python
import wmill
from googleapiclient.discovery import build
from google.oauth2 import service_account
import json

# Your spreadsheet details
SPREADSHEET_ID = '1abc123XYZ789'  # Replace with your actual ID
SHEET_NAME = 'Sheet1'  # Replace if different

def main(
    timestamp: str,
    team: str,
    jobTitle: str,
    jobLevel: str,
    overallScore: float,
    overallMaturity: str,
    hasNotStarted: bool,
    categoryScores: dict,
    categoryMaturities: dict,
    responses: dict
):
    """
    Log assessment response to Google Sheets
    """
    
    try:
        # Get Google Sheets credentials from Windmill resource
        google_creds = wmill.get_resource("u/VinceDeFreitas/google_sheets_assessment_logger")
        
        # Create credentials object
        credentials = service_account.Credentials.from_service_account_info(
            google_creds,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        
        # Build the Sheets API service
        service = build('sheets', 'v4', credentials=credentials)
        
        # Prepare the row data
        row_data = [
            timestamp,
            team,
            jobTitle,
            jobLevel,
            round(overallScore, 2),
            overallMaturity,
            hasNotStarted,
            round(categoryScores.get('Delegation', 0), 2),
            round(categoryScores.get('Communication', 0), 2),
            round(categoryScores.get('Discernment', 0), 2),
            round(categoryScores.get('Keeping It Twilio', 0), 2),
            categoryMaturities.get('Delegation', ''),
            categoryMaturities.get('Communication', ''),
            categoryMaturities.get('Discernment', ''),
            categoryMaturities.get('Keeping It Twilio', ''),
            json.dumps(responses)  # Store all responses as JSON string
        ]
        
        # Append the row to the sheet
        range_name = f'{SHEET_NAME}!A:P'  # Adjust range based on your columns
        
        body = {
            'values': [row_data]
        }
        
        result = service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range=range_name,
            valueInputOption='USER_ENTERED',
            insertDataOption='INSERT_ROWS',
            body=body
        ).execute()
        
        print(f"✅ Successfully logged assessment: {team} - {jobTitle} - {overallMaturity}")
        print(f"   Updated rows: {result.get('updates', {}).get('updatedRows', 0)}")
        
        return {
            'success': True,
            'message': 'Response logged to Google Sheets',
            'timestamp': timestamp,
            'updatedRange': result.get('updates', {}).get('updatedRange', '')
        }
        
    except Exception as e:
        print(f"❌ Error logging to Google Sheets: {str(e)}")
        # Return error but don't fail completely
        return {
            'success': False,
            'error': str(e),
            'message': 'Failed to log response'
        }
```

### 4.3 Update Script Variables

**IMPORTANT**: Update these two variables in the script:

```python
SPREADSHEET_ID = 'YOUR_ACTUAL_SPREADSHEET_ID'  # From Step 1.3
SHEET_NAME = 'Sheet1'  # Your sheet tab name
```

### 4.4 Save and Deploy

1. Click **Save**
2. Click **Deploy**

---

## Step 5: Test the Integration

### 5.1 Test from Windmill UI

1. In the script view, click **Run**
2. Fill in test data:
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
       "q1": {"category": "Delegation", "value": 2, "maturity": "Compliant"},
       "q2": {"category": "Delegation", "value": 3, "maturity": "Competent"}
     }
   }
   ```
3. Click **Run**
4. Check your Google Sheet - you should see a new row!

### 5.2 Test from the Assessment Tool

1. Go to your deployed assessment: https://vdefreit.github.io/ai-literacy-assessment/
2. Fill out the form and complete the assessment
3. After viewing results, check your Google Sheet
4. A new row should appear within a few seconds

---

## Step 6: Verify Your Data

### Check Your Google Sheet

Your sheet should now have rows like:

| Timestamp | Team | Job Title | Overall Score | Overall Maturity |
|-----------|------|-----------|---------------|------------------|
| 2026-01-27T10:30:00Z | Engineering | Software Engineer | 2.50 | Compliant |
| 2026-01-27T11:15:00Z | Sales | Account Executive | 3.25 | Competent |

---

## Analyzing Your Data

### Built-in Google Sheets Analysis

#### 1. Average Score by Team

1. Click on an empty area below your data
2. Create a pivot table:
   - **Data** → **Pivot table**
   - **Rows**: Team
   - **Values**: Overall Score (Summarize by: AVERAGE)

#### 2. Maturity Distribution Chart

1. Select columns E and F (Overall Score and Overall Maturity)
2. **Insert** → **Chart**
3. Choose **Pie chart** or **Bar chart**

#### 3. Response Count by Team

Use a formula:
```
=QUERY(A2:F, "SELECT B, COUNT(B) GROUP BY B LABEL COUNT(B) 'Responses'", 1)
```

### Export to Data Studio (Optional)

For advanced visualization:
1. Go to [Google Data Studio](https://datastudio.google.com)
2. Create new report
3. Connect to your Google Sheet
4. Build dashboards with charts, filters, and metrics

---

## Troubleshooting

### Error: "The caller does not have permission"

- Make sure you shared the sheet with the service account email
- Verify the service account has **Editor** permissions

### Error: "Requested entity was not found"

- Double-check your `SPREADSHEET_ID` in the script
- Make sure the sheet isn't deleted or moved to trash

### No data appearing in sheet

1. Check Windmill execution logs for errors
2. Verify `ENABLE_RESPONSE_LOGGING: true` in config.js
3. Test the script manually in Windmill first
4. Check browser console for JavaScript errors

### Data appears but is malformed

- Check that your column headers match the script's row_data order
- Verify JSON formatting in the "All Responses" column

---

## Data Privacy & Security

### ✅ Best Practices

- **Service Account**: Only the service account can write to the sheet
- **No PII**: Remember, no names or emails are collected
- **Limited Sharing**: Only share the sheet with people who need access
- **Regular Backups**: Export data periodically as CSV backup

### 🔒 Securing Your Sheet

1. **File** → **Version history** → Enable version history
2. Limit sharing to specific @twilio.com email addresses
3. Use Google Workspace security settings if available

---

## Next Steps

### Monitor Your Data

- Set up Google Sheets notifications for new responses
- Create weekly summary reports
- Share insights with stakeholders

### Advanced Analysis

- Export to BigQuery for SQL analysis
- Use Google Data Studio for live dashboards
- Create automated reports with Google Apps Script

### Maintenance

- Periodically archive old data (monthly exports)
- Monitor Windmill execution logs for failures
- Update the script if you add new questions

---

## Support

**Windmill Issues**: Check [Windmill Docs](https://docs.windmill.dev)  
**Google Sheets API**: Check [Google Sheets API Docs](https://developers.google.com/sheets/api)  
**Script Errors**: Review execution logs in Windmill UI

For questions specific to this setup, refer to the main [LOGGING_SETUP.md](LOGGING_SETUP.md) file.
