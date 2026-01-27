# PostgreSQL Setup Guide (Windmill Built-in Database)

This guide walks you through setting up Windmill's **built-in PostgreSQL database** for storing assessment responses. This is 100% self-service and requires no external accounts or permissions.

---

## Why PostgreSQL?

✅ **Completely self-contained** - Built into Windmill, no external services  
✅ **SQL queries** - Easy to analyze data with familiar SQL  
✅ **Structured data** - Proper columns, indexes, and relationships  
✅ **Free** - Included with your Windmill workspace  
✅ **Zero permission issues** - You already have access  

---

## Step 1: Create the Windmill Script (5 minutes)

### 1.1 Navigate to Windmill Scripts

1. Go to [Windmill](https://twilio.windmill.dev)
2. Click **Scripts** in the left sidebar
3. Click **+ New Script**
4. Choose **Python** as the language
5. Set the path: `u/VinceDeFreitas/log_assessment_response`

### 1.2 Copy the Script Code

Copy the entire contents of [windmill-logging-script.py](windmill-logging-script.py) into the Windmill script editor.

The script automatically:
- ✅ Creates the `assessment_responses` table (if it doesn't exist)
- ✅ Creates indexes for faster queries
- ✅ Inserts each response as a new row
- ✅ Handles errors gracefully (silent fail)

### 1.3 Save and Deploy

1. Click **Save**
2. Click **Deploy**

That's it! The database will be created automatically when the first response is logged.

---

## Step 2: Test the Script (2 minutes)

### 2.1 Test with Sample Data

1. In the Windmill script view, click **Run**
2. Fill in the test parameters:

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
4. You should see: ✅ **"Successfully logged assessment to PostgreSQL"**

### 2.2 Verify the Table Was Created

Create a new script to query the database:

1. Go to **Scripts** → **+ New Script** → **Python**
2. Path: `u/VinceDeFreitas/query_assessments`
3. Code:

```python
import wmill

def main():
    """Query all assessment responses"""
    result = wmill.task.pg_execute(
        "SELECT * FROM assessment_responses ORDER BY created_at DESC LIMIT 10"
    )
    return result
```

4. Click **Run** - you should see your test data!

---

## Step 3: Database Schema

The script creates this table structure:

### Table: `assessment_responses`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `timestamp` | TIMESTAMP | When assessment was completed |
| `team` | VARCHAR(100) | Team/department name |
| `job_title` | VARCHAR(200) | Job title |
| `job_level` | VARCHAR(10) | S1-S4, M1-M4, E1-E4, etc. |
| `overall_score` | DECIMAL(3,2) | Overall score (1.00-4.00) |
| `overall_maturity` | VARCHAR(50) | Not Started, Compliant, Competent, Creative |
| `has_not_started` | BOOLEAN | Any category below threshold? |
| `delegation_score` | DECIMAL(3,2) | Delegation category score |
| `communication_score` | DECIMAL(3,2) | Communication category score |
| `discernment_score` | DECIMAL(3,2) | Discernment category score |
| `twilio_score` | DECIMAL(3,2) | Keeping It Twilio score |
| `delegation_maturity` | VARCHAR(50) | Delegation maturity level |
| `communication_maturity` | VARCHAR(50) | Communication maturity level |
| `discernment_maturity` | VARCHAR(50) | Discernment maturity level |
| `twilio_maturity` | VARCHAR(50) | Keeping It Twilio maturity |
| `category_scores` | JSONB | Full category scores object |
| `category_maturities` | JSONB | Full category maturities object |
| `responses` | JSONB | All individual question responses |
| `created_at` | TIMESTAMP | Database insertion timestamp |

### Indexes (for fast queries)

- `idx_team` - Query by team
- `idx_job_level` - Query by job level
- `idx_overall_maturity` - Query by maturity level
- `idx_timestamp` - Query by time range

---

## Step 4: Querying Your Data

### 4.1 Basic Queries

Create query scripts in Windmill or use the SQL editor.

#### Count Total Responses

```python
import wmill

def main():
    result = wmill.task.pg_execute(
        "SELECT COUNT(*) as total FROM assessment_responses"
    )
    return result[0]['total']
```

#### Average Score by Team

```python
import wmill

def main():
    result = wmill.task.pg_execute("""
        SELECT 
            team,
            COUNT(*) as responses,
            ROUND(AVG(overall_score), 2) as avg_score,
            MODE() WITHIN GROUP (ORDER BY overall_maturity) as most_common_maturity
        FROM assessment_responses
        GROUP BY team
        ORDER BY avg_score DESC
    """)
    return result
```

#### Maturity Distribution

```python
import wmill

def main():
    result = wmill.task.pg_execute("""
        SELECT 
            overall_maturity,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
        FROM assessment_responses
        GROUP BY overall_maturity
        ORDER BY 
            CASE overall_maturity
                WHEN 'Not Started' THEN 1
                WHEN 'Compliant' THEN 2
                WHEN 'Competent' THEN 3
                WHEN 'Creative' THEN 4
            END
    """)
    return result
```

#### Recent Responses

```python
import wmill

def main(limit: int = 20):
    result = wmill.task.pg_execute("""
        SELECT 
            timestamp,
            team,
            job_title,
            overall_maturity,
            overall_score
        FROM assessment_responses
        ORDER BY created_at DESC
        LIMIT %s
    """, (limit,))
    return result
```

#### Category Performance by Job Level

```python
import wmill

def main():
    result = wmill.task.pg_execute("""
        SELECT 
            job_level,
            ROUND(AVG(delegation_score), 2) as avg_delegation,
            ROUND(AVG(communication_score), 2) as avg_communication,
            ROUND(AVG(discernment_score), 2) as avg_discernment,
            ROUND(AVG(twilio_score), 2) as avg_twilio,
            COUNT(*) as responses
        FROM assessment_responses
        GROUP BY job_level
        ORDER BY job_level
    """)
    return result
```

### 4.2 Advanced Queries

#### Responses Over Time (Weekly)

```python
import wmill

def main():
    result = wmill.task.pg_execute("""
        SELECT 
            DATE_TRUNC('week', timestamp) as week,
            COUNT(*) as responses,
            ROUND(AVG(overall_score), 2) as avg_score
        FROM assessment_responses
        GROUP BY week
        ORDER BY week DESC
    """)
    return result
```

#### Top Performers by Team

```python
import wmill

def main():
    result = wmill.task.pg_execute("""
        SELECT 
            team,
            job_title,
            overall_maturity,
            overall_score
        FROM assessment_responses
        WHERE overall_maturity IN ('Competent', 'Creative')
        ORDER BY overall_score DESC
        LIMIT 10
    """)
    return result
```

#### Areas Needing Improvement

```python
import wmill

def main():
    result = wmill.task.pg_execute("""
        SELECT 
            'Delegation' as category,
            COUNT(*) FILTER (WHERE delegation_maturity = 'Not Started') as not_started,
            COUNT(*) FILTER (WHERE delegation_maturity = 'Compliant') as compliant,
            ROUND(AVG(delegation_score), 2) as avg_score
        FROM assessment_responses
        UNION ALL
        SELECT 
            'Communication',
            COUNT(*) FILTER (WHERE communication_maturity = 'Not Started'),
            COUNT(*) FILTER (WHERE communication_maturity = 'Compliant'),
            ROUND(AVG(communication_score), 2)
        FROM assessment_responses
        UNION ALL
        SELECT 
            'Discernment',
            COUNT(*) FILTER (WHERE discernment_maturity = 'Not Started'),
            COUNT(*) FILTER (WHERE discernment_maturity = 'Compliant'),
            ROUND(AVG(discernment_score), 2)
        FROM assessment_responses
        UNION ALL
        SELECT 
            'Keeping It Twilio',
            COUNT(*) FILTER (WHERE twilio_maturity = 'Not Started'),
            COUNT(*) FILTER (WHERE twilio_maturity = 'Compliant'),
            ROUND(AVG(twilio_score), 2)
        FROM assessment_responses
        ORDER BY avg_score ASC
    """)
    return result
```

---

## Step 5: Export Data (Optional)

### 5.1 Export to CSV

Create a script that exports data as CSV:

```python
import wmill
import csv
import io

def main():
    # Query all data
    result = wmill.task.pg_execute("""
        SELECT 
            timestamp, team, job_title, job_level,
            overall_score, overall_maturity,
            delegation_score, communication_score, 
            discernment_score, twilio_score
        FROM assessment_responses
        ORDER BY timestamp DESC
    """)
    
    # Convert to CSV
    output = io.StringIO()
    if result:
        writer = csv.DictWriter(output, fieldnames=result[0].keys())
        writer.writeheader()
        writer.writerows(result)
    
    return output.getvalue()
```

### 5.2 Schedule Regular Exports

1. In Windmill, go to **Schedules**
2. Create a schedule (e.g., "Weekly export")
3. Set to run your export script every Monday at 9am
4. Configure to send results via email or webhook

---

## Step 6: Test from Live Assessment

1. Go to your assessment: https://vdefreit.github.io/ai-literacy-assessment/
2. Complete an assessment
3. After viewing results, check Windmill:
   - **Scripts** → `u/VinceDeFreitas/log_assessment_response` → **Runs** tab
   - You should see a successful execution
4. Query the database to see your response:

```python
import wmill

def main():
    result = wmill.task.pg_execute(
        "SELECT * FROM assessment_responses ORDER BY created_at DESC LIMIT 1"
    )
    return result
```

---

## Troubleshooting

### Error: "relation 'assessment_responses' does not exist"

**Solution:** Run the logging script once manually - it will create the table automatically.

### No data appearing in database

1. Check Windmill execution logs for the `log_assessment_response` script
2. Verify `ENABLE_RESPONSE_LOGGING: true` in [config.js](config.js)
3. Check browser console for JavaScript errors
4. Ensure the logging endpoint URL is correct in config.js

### Query returns no results

Check if data was inserted:
```python
wmill.task.pg_execute("SELECT COUNT(*) FROM assessment_responses")
```

### Permission errors

You should have full access to Windmill's PostgreSQL. If you see permission errors, contact your Windmill workspace admin.

---

## Data Privacy & Security

### ✅ What's Collected (Anonymous)
- Team/department, job title, job level
- Assessment scores and maturity levels
- Question responses (question ID + value only)
- Timestamp

### ❌ What's NOT Collected
- Names
- Email addresses
- Employee IDs
- IP addresses
- Any personally identifiable information

### 🔒 Security
- Data stays within Twilio's Windmill workspace
- Access controlled by Windmill permissions
- Database is only accessible to authorized Windmill users
- No external services or third parties

---

## Next Steps

### Create a Dashboard Script

Build a comprehensive dashboard:

```python
import wmill

def main():
    # Get summary statistics
    total = wmill.task.pg_execute(
        "SELECT COUNT(*) as count FROM assessment_responses"
    )[0]['count']
    
    by_team = wmill.task.pg_execute("""
        SELECT team, COUNT(*) as count, ROUND(AVG(overall_score), 2) as avg_score
        FROM assessment_responses
        GROUP BY team
        ORDER BY count DESC
    """)
    
    by_maturity = wmill.task.pg_execute("""
        SELECT overall_maturity, COUNT(*) as count
        FROM assessment_responses
        GROUP BY overall_maturity
    """)
    
    return {
        'total_responses': total,
        'by_team': by_team,
        'by_maturity': by_maturity
    }
```

### Schedule Weekly Reports

Create a script that generates a weekly report and sends it via email or Slack.

### Monitor Trends

Track score improvements over time to measure the impact of training programs.

---

## Support

**Windmill Documentation**: https://docs.windmill.dev  
**PostgreSQL Help**: https://www.postgresql.org/docs/  
**Script Issues**: Check execution logs in Windmill UI  

For questions about this specific setup, see [LOGGING_SETUP.md](LOGGING_SETUP.md).
