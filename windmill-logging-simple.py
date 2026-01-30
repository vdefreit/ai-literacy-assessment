"""
Windmill Script: Log Assessment Responses (Execution Logs)
===========================================================

This script logs assessment response data to Windmill execution logs.
Data is visible in the Windmill UI under the script's execution history.
No personally identifiable information is collected.

To use:
1. Copy this entire script
2. In Windmill, go to Scripts -> u/VinceDeFreitas/log_assessment_response
3. Replace all code with this
4. Save and Deploy
"""

import json

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
    Log an anonymous assessment response to execution logs
    
    All data is printed to logs and visible in Windmill UI.
    No database setup required - works immediately!
    """
    
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
        
        return {
            'success': True,
            'message': 'Response logged to execution logs',
            'timestamp': timestamp,
            'team': team,
            'jobTitle': jobTitle,
            'overallMaturity': overallMaturity
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error: {error_msg}")
        
        return {
            'success': False,
            'error': error_msg,
            'message': 'Failed to log response'
        }
