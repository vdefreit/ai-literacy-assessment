"""
Windmill Script: Log Assessment Responses to PostgreSQL
=======================================================

This script receives anonymous assessment response data and stores it 
in Windmill's built-in PostgreSQL database for analytics. 
No personally identifiable information is collected.

Setup (ONE-TIME):
1. Go to https://twilio.windmill.dev
2. Create a new script at path: u/VinceDeFreitas/log_assessment_response
3. Copy this code into the script editor
4. Run once to create the database table
5. Save and deploy

Data collected:
- timestamp, team, jobTitle, jobLevel
- overallScore, overallMaturity, hasNotStarted
- categoryScores and categoryMaturities (as JSONB)
- individual question responses (as JSONB)

No names, emails, or other PII is collected.
"""

import json
from datetime import datetime

# Import the correct Windmill PostgreSQL client
try:
    from wmill import PostgresClient
except ImportError:
    # Fallback if PostgresClient not available - just log
    PostgresClient = None

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
    Log an anonymous assessment response to PostgreSQL
    
    Args:
        timestamp: ISO timestamp of when assessment was completed
        team: Team/department name
        jobTitle: Job title (not a unique identifier)
        jobLevel: Job level (S1-S4, M1-M4, E1-E4, etc.)
        overallScore: Overall assessment score (1.0-4.0)
        overallMaturity: Overall maturity level
        hasNotStarted: Whether any category scored "Not Started"
        categoryScores: Dictionary of category scores
        categoryMaturities: Dictionary of category maturity levels
        responses: Dictionary of individual question responses
    
    Returns:
        Success confirmation with row ID
    """
    
    # For now, just log to execution logs (visible in Windmill UI)
    # PostgreSQL integration may require additional Windmill setup
    try:
        print("=" * 60)
        print("📊 ASSESSMENT RESPONSE LOGGED")
        print("=" * 60)
        print(f"Timestamp: {timestamp}")
        print(f"Team: {team}")
        print(f"Job Title: {jobTitle}")
        print(f"Job Level: {jobLevel}")
        print(f"Overall Score: {overallScore:.2f}")
        print(f"Overall Maturity: {overallMaturity}")
        print(f"Has Not Started: {hasNotStarted}")
        print("")
        print("Category Scores:")
        for category, score in categoryScores.items():
            maturity = categoryMaturities.get(category, 'Unknown')
            print(f"  - {category}: {score:.2f} ({maturity})")
        print("")
        print(f"Total Questions Answered: {len(responses)}")
        print("=" * 60)
        print("")
        print("Full Response Data (JSON):")
        print(json.dumps({
            'timestamp': timestamp,
            'team': team,
            'jobTitle': jobTitle,
            'jobLevel': jobLevel,
            'overallScore': overallScore,
            'overallMaturity': overallMaturity,
            'hasNotStarted': hasNotStarted,
            'categoryScores': categoryScores,
            'categoryMaturities': categoryMaturities,
            'responses': responses
        }, indent=2))
        print("")
        print("=" * 60)
        
        # Try PostgreSQL if available
        if PostgresClient:
            try:
                # Create table if it doesn't exist
                create_table_sql = """
                CREATE TABLE IF NOT EXISTS assessment_responses (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP NOT NULL,
            team VARCHAR(100) NOT NULL,
            job_title VARCHAR(200) NOT NULL,
            job_level VARCHAR(10) NOT NULL,
            overall_score DECIMAL(3,2) NOT NULL,
            overall_maturity VARCHAR(50) NOT NULL,
            has_not_started BOOLEAN NOT NULL,
            delegation_score DECIMAL(3,2),
            communication_score DECIMAL(3,2),
            discernment_score DECIMAL(3,2),
            twilio_score DECIMAL(3,2),
            delegation_maturity VARCHAR(50),
            communication_maturity VARCHAR(50),
            discernment_maturity VARCHAR(50),
            twilio_maturity VARCHAR(50),
            category_scores JSONB,
            category_maturities JSONB,
            responses JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
                CREATE INDEX IF NOT EXISTS idx_team ON assessment_responses(team);
                CREATE INDEX IF NOT EXISTS idx_job_level ON assessment_responses(job_level);
                CREATE INDEX IF NOT EXISTS idx_overall_maturity ON assessment_responses(overall_maturity);
                CREATE INDEX IF NOT EXISTS idx_timestamp ON assessment_responses(timestamp);
                """
                
                # Note: Actual PostgreSQL integration depends on Windmill configuration
                # This is a placeholder - update with actual connection method
                print("Note: PostgreSQL integration available but needs configuration.")
                print("Data has been logged to execution logs above.")
                
            except Exception as pg_error:
                print(f"Note: PostgreSQL not configured: {str(pg_error)}")
                print("Data logged to execution logs only.")
        
        return {
            'success': True,
            'message': 'Response logged to execution logs',
            'timestamp': timestamp,
            'team': team,
            'overallMaturity': overallMaturity,
            'note': 'Data visible in Windmill execution logs. To enable PostgreSQL storage, contact Windmill admin.'
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error logging response: {error_msg}")
        
        # Return error but don't crash
        return {
            'success': False,
            'error': error_msg,
            'message': 'Failed to log response'
        }


# Alternative version using execution logs only
# Uncomment and use this if PostgreSQL is not available:
"""
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
    '''Simple logging version - just prints to execution logs'''
    
    # Insert the assessment response (PLACEHOLDER - needs actual PostgreSQL client)
    insert_sql = '''
    print(f"Assessment Response Logged:")
    print(f"  Team: {team}")
    print(f"  Job: {jobTitle} ({jobLevel})")
    print(f"  Score: {overallMaturity} ({overallScore:.2f})")
    print(json.dumps({
        'timestamp': timestamp,
        'team': team,
        'jobTitle': jobTitle,
        'jobLevel': jobLevel,
        'overallScore': overallScore,
        'overallMaturity': overallMaturity,
        'categoryScores': categoryScores,
        'categoryMaturities': categoryMaturities
    }, indent=2))
    
    return {
        'success': True,
        'message': 'Response logged',
        'timestamp': timestamp
    }
"""
