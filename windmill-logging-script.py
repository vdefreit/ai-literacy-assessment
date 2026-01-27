"""
Windmill Script: Log Assessment Responses
=========================================

This script receives anonymous assessment response data and stores it 
for analytics. No personally identifiable information is collected.

To set up in Windmill:
1. Go to https://twilio.windmill.dev
2. Create a new script at path: u/VinceDeFreitas/log_assessment_response
3. Copy this code into the script editor
4. Save and deploy

Data collected:
- timestamp
- team (department)
- jobTitle 
- jobLevel
- overallScore, overallMaturity
- categoryScores and categoryMaturities
- individual question responses (question ID + value)

No names, emails, or other PII is collected.
"""

import wmill

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
    Log an anonymous assessment response
    
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
        Success confirmation
    """
    
    # Prepare response data for storage
    response_data = {
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
    }
    
    # TODO: Store data in your preferred backend
    # Options:
    # 1. Windmill's built-in PostgreSQL database
    # 2. Google Sheets via Windmill integration
    # 3. Airtable via API
    # 4. S3/Cloud Storage for JSON logs
    
    # Example: Store in Windmill PostgreSQL (requires database setup)
    # from wmill import task
    # task.pg_execute(
    #     'INSERT INTO assessment_responses (data) VALUES (%s)',
    #     (json.dumps(response_data),)
    # )
    
    # Example: Append to Google Sheets (requires Google Sheets resource)
    # sheets_resource = wmill.get_resource("u/VinceDeFreitas/google_sheets")
    # # Use sheets API to append row
    
    # For now, just log it (Windmill keeps logs)
    print(f"Assessment logged: {team} - {jobTitle} - {overallMaturity}")
    print(f"Category scores: {categoryScores}")
    
    return {
        'success': True,
        'message': 'Response logged successfully',
        'timestamp': timestamp
    }
