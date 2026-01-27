"""
Windmill Script: Log to Google Sheets (Personal Account)
=========================================================

This script logs assessment responses to YOUR personal Google Sheet.
No Twilio workspace permissions needed!

Setup: Follow GOOGLE_SHEETS_PERSONAL.md guide
"""

import json
from googleapiclient.discovery import build
from google.oauth2 import service_account

# YOUR SPREADSHEET ID - Update this!
SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'  # From Step 1.3 of setup guide
SUMMARY_SHEET = 'Summary'
RESPONSES_SHEET = 'Responses'

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
    Log assessment response to your personal Google Sheet
    """
    
    try:
        import wmill
        
        # Get Google credentials from Windmill resource
        google_creds = wmill.get_resource("u/VinceDeFreitas/personal_google_sheets")
        
        # Create credentials object
        credentials = service_account.Credentials.from_service_account_info(
            google_creds,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        
        # Build the Sheets API service
        service = build('sheets', 'v4', credentials=credentials)
        
        # 1. Write summary data to Summary sheet
        summary_row = [
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
            categoryMaturities.get('Keeping It Twilio', '')
        ]
        
        summary_result = service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range=f'{SUMMARY_SHEET}!A:O',
            valueInputOption='USER_ENTERED',
            insertDataOption='INSERT_ROWS',
            body={'values': [summary_row]}
        ).execute()
        
        # 2. Write individual responses to Responses sheet (one row per question)
        response_rows = []
        for question_id, response_data in responses.items():
            response_row = [
                timestamp,
                team,
                jobTitle,
                jobLevel,
                question_id,
                response_data.get('category', ''),
                response_data.get('value', 0),
                response_data.get('maturity', '')
            ]
            response_rows.append(response_row)
        
        # Batch append all response rows
        if response_rows:
            responses_result = service.spreadsheets().values().append(
                spreadsheetId=SPREADSHEET_ID,
                range=f'{RESPONSES_SHEET}!A:H',
                valueInputOption='USER_ENTERED',
                insertDataOption='INSERT_ROWS',
                body={'values': response_rows}
            ).execute()
        
        result = summary_result  # For logging purposes
        
        print(f"✅ Successfully logged to Google Sheets")
        print(f"   Team: {team} | Job: {jobTitle} | Level: {jobLevel}")
        print(f"   Overall: {overallMaturity} ({overallScore:.2f})")
        print(f"   Summary sheet: {result.get('updates', {}).get('updatedRange', '')}")
        print(f"   Individual responses: {len(response_rows)} questions logged")
        
        return {
            'success': True,
            'message': 'Response logged to Google Sheets',
            'timestamp': timestamp,
            'team': team,
            'overallMaturity': overallMaturity,
            'updatedRange': result.get('updates', {}).get('updatedRange', '')
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error logging to Google Sheets: {error_msg}")
        
        # Also log to execution logs as backup
        print("\n" + "=" * 60)
        print("📊 BACKUP LOG (Google Sheets failed)")
        print("=" * 60)
        print(json.dumps({
            'timestamp': timestamp,
            'team': team,
            'jobTitle': jobTitle,
            'jobLevel': jobLevel,
            'overallScore': overallScore,
            'overallMaturity': overallMaturity,
            'categoryScores': categoryScores
        }, indent=2))
        print("=" * 60)
        
        return {
            'success': False,
            'error': error_msg,
            'message': 'Failed to log to Google Sheets (saved to execution logs)'
        }
