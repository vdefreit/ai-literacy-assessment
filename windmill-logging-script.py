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

import wmill
import json
from datetime import datetime

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
    
    try:
        # Create table if it doesn't exist (idempotent - safe to run every time)
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
        
        wmill.task.pg_execute(create_table_sql)
        
        # Insert the assessment response
        insert_sql = """
        INSERT INTO assessment_responses (
            timestamp, team, job_title, job_level,
            overall_score, overall_maturity, has_not_started,
            delegation_score, communication_score, discernment_score, twilio_score,
            delegation_maturity, communication_maturity, discernment_maturity, twilio_maturity,
            category_scores, category_maturities, responses
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        ) RETURNING id;
        """
        
        # Extract individual category scores for easier querying
        delegation_score = categoryScores.get('Delegation', 0)
        communication_score = categoryScores.get('Communication', 0)
        discernment_score = categoryScores.get('Discernment', 0)
        twilio_score = categoryScores.get('Keeping It Twilio', 0)
        
        delegation_maturity = categoryMaturities.get('Delegation', '')
        communication_maturity = categoryMaturities.get('Communication', '')
        discernment_maturity = categoryMaturities.get('Discernment', '')
        twilio_maturity = categoryMaturities.get('Keeping It Twilio', '')
        
        # Execute insert
        result = wmill.task.pg_execute(insert_sql, (
            timestamp,
            team,
            jobTitle,
            jobLevel,
            round(overallScore, 2),
            overallMaturity,
            hasNotStarted,
            round(delegation_score, 2),
            round(communication_score, 2),
            round(discernment_score, 2),
            round(twilio_score, 2),
            delegation_maturity,
            communication_maturity,
            discernment_maturity,
            twilio_maturity,
            json.dumps(categoryScores),
            json.dumps(categoryMaturities),
            json.dumps(responses)
        ))
        
        # Get the inserted row ID
        row_id = result[0]['id'] if result and len(result) > 0 else None
        
        print(f"✅ Successfully logged assessment to PostgreSQL")
        print(f"   Team: {team} | Job: {jobTitle} | Level: {jobLevel}")
        print(f"   Overall: {overallMaturity} ({overallScore:.2f})")
        print(f"   Row ID: {row_id}")
        
        return {
            'success': True,
            'message': 'Response logged to PostgreSQL',
            'timestamp': timestamp,
            'row_id': row_id,
            'team': team,
            'overallMaturity': overallMaturity
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error logging to PostgreSQL: {error_msg}")
        
        # Return error but don't crash (silent fail for user experience)
        return {
            'success': False,
            'error': error_msg,
            'message': 'Failed to log response to database'
        }
