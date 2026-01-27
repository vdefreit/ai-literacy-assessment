# Anonymous Response Logging Setup

## Overview

The assessment tool now includes **anonymous response logging** to help you analyze team distribution, job titles, and assessment scores. This feature is completely invisible to end users and collects no personally identifiable information (PII).

## What Data is Collected

### Demographics (Non-PII)
- **Team/Department**: e.g., "Engineering", "Sales", "Marketing"
- **Job Title**: e.g., "Engineering Manager", "Sales Director" (not unique identifiers)
- **Job Level**: e.g., "M2", "S3", "E1"

### Assessment Results
- **Overall Score**: Numeric score (1.0-4.0)
- **Overall Maturity Level**: "Not Started", "Compliant", "Competent", or "Creative"
- **Category Scores**: Individual scores for each of the 4 categories
- **Category Maturity Levels**: Maturity level for each category
- **Individual Responses**: Question ID mapped to answer value (1-4)

### Metadata
- **Timestamp**: When the assessment was completed
- **Has Not Started Flag**: Whether any category scored below threshold

## What Data is NOT Collected

- ❌ Names
- ❌ Email addresses
- ❌ Employee IDs
- ❌ IP addresses
- ❌ Browser fingerprints
- ❌ Any other personally identifiable information

## Setup Instructions

### Step 1: Create the Windmill Logging Endpoint

1. Go to [Windmill Dashboard](https://twilio.windmill.dev)
2. Navigate to **Scripts** → **New Script**
3. Set the path to: `u/VinceDeFreitas/log_assessment_response`
4. Copy the code from `windmill-logging-script.py` into the editor
5. Choose your storage method (see options below)
6. **Save and Deploy**

### Step 2: Choose Your Data Storage Method

#### Option A: Windmill PostgreSQL Database (Recommended)

If you have Windmill's PostgreSQL database set up:

```python
import json
from wmill import task

# Create table (run once)
task.pg_execute('''
    CREATE TABLE IF NOT EXISTS assessment_responses (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP,
        team VARCHAR(100),
        job_title VARCHAR(200),
        job_level VARCHAR(10),
        overall_score DECIMAL(3,2),
        overall_maturity VARCHAR(50),
        has_not_started BOOLEAN,
        category_scores JSONB,
        category_maturities JSONB,
        responses JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
''')

# Insert response
task.pg_execute('''
    INSERT INTO assessment_responses 
    (timestamp, team, job_title, job_level, overall_score, overall_maturity, 
     has_not_started, category_scores, category_maturities, responses)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
''', (
    timestamp, team, jobTitle, jobLevel, overallScore, overallMaturity,
    hasNotStarted, json.dumps(categoryScores), json.dumps(categoryMaturities), 
    json.dumps(responses)
))
```

#### Option B: Google Sheets

If you want to view data in Google Sheets:

1. Create a Google Sheets integration in Windmill
2. Set up a spreadsheet with columns: timestamp, team, jobTitle, jobLevel, overallScore, overallMaturity, etc.
3. Use the Windmill Google Sheets integration to append rows

```python
from wmill import get_resource
import requests

sheets_resource = get_resource("u/VinceDeFreitas/google_sheets")
# Use Google Sheets API to append row
```

#### Option C: Simple JSON Logs

For quick setup, just rely on Windmill's logging (data visible in execution logs):

```python
import json

print(json.dumps({
    'timestamp': timestamp,
    'team': team,
    'jobTitle': jobTitle,
    'overallScore': overallScore,
    # ... etc
}, indent=2))
```

You can export logs from Windmill UI later.

### Step 3: Update Configuration (Already Done)

The configuration has already been updated in `config.js`:

```javascript
LOGGING_ENDPOINT: 'https://twilio.windmill.dev/api/w/td/jobs/run_wait_result/p/u/VinceDeFreitas/log_assessment_response',
ENABLE_RESPONSE_LOGGING: true,
```

### Step 4: Deploy and Test

1. Push the changes to your repository
2. Deploy to production (GitHub Pages)
3. Complete a test assessment
4. Check Windmill logs/database to confirm data is being received

## How It Works

1. **User completes assessment**: Fills in team, job title, job level, and answers all questions
2. **User clicks "View Results"**: Assessment is submitted
3. **Scores are calculated**: Application calculates all scores locally
4. **Anonymous logging**: `logAssessmentResponse()` function runs in the background
   - Sends data to Windmill endpoint
   - Uses fire-and-forget approach (doesn't block UI)
   - Fails silently if endpoint is down (user never sees errors)
5. **Results displayed**: User sees their results immediately (logging happens async)

## Data Analysis

Once data is collected, you can analyze:

- **Team Distribution**: Which teams are using AI tools?
- **Maturity by Department**: Do certain teams score higher?
- **Job Level Trends**: How do scores vary by seniority?
- **Category Weaknesses**: Where do people struggle most?
- **Common Patterns**: Which questions get "Not Started" most often?

### Example Queries (PostgreSQL)

```sql
-- Average scores by team
SELECT 
    team,
    AVG(overall_score) as avg_score,
    COUNT(*) as num_responses
FROM assessment_responses
GROUP BY team
ORDER BY avg_score DESC;

-- Maturity distribution
SELECT 
    overall_maturity,
    COUNT(*) as count
FROM assessment_responses
GROUP BY overall_maturity;

-- Category performance by job level
SELECT 
    job_level,
    AVG((category_scores->>'Delegation')::decimal) as delegation_avg,
    AVG((category_scores->>'Communication')::decimal) as communication_avg,
    AVG((category_scores->>'Discernment')::decimal) as discernment_avg,
    AVG((category_scores->>'Keeping It Twilio')::decimal) as twilio_avg
FROM assessment_responses
GROUP BY job_level
ORDER BY job_level;
```

## Privacy & Compliance

- ✅ **No PII collected**: Only job-related demographics
- ✅ **Anonymous**: Cannot be tied back to individuals
- ✅ **Transparent**: Users know they're taking an assessment
- ✅ **Silent failure**: Never disrupts user experience
- ✅ **Configurable**: Can be disabled via `ENABLE_RESPONSE_LOGGING: false`

## Disabling Logging

To disable logging:

1. Edit `config.js`
2. Set `ENABLE_RESPONSE_LOGGING: false`
3. Redeploy

OR

1. Comment out the `LOGGING_ENDPOINT` in `config.js`
2. Logging will be automatically disabled

## Troubleshooting

### Logging not working?

1. Check browser console for errors
2. Verify Windmill endpoint is created and accessible
3. Check Windmill execution logs for the script
4. Ensure `ENABLE_RESPONSE_LOGGING: true` in config

### Want to test without Windmill?

Set `LOGGING_ENDPOINT` to a test URL like `https://httpbin.org/post` to see the data structure being sent.

## Support

For questions or issues with the logging setup, contact your Windmill administrator or check the Windmill documentation at https://docs.windmill.dev.
