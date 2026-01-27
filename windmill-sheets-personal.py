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
SHEET_NAME = 'Sheet1'

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
            categoryMaturities.get('Keeping It Twilio', '')
        ]
        
        # Append to the sheet
        range_name = f'{SHEET_NAME}!A:O'
        body = {'values': [row_data]}
        
        result = service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range=range_name,
            valueInputOption='USER_ENTERED',
            insertDataOption='INSERT_ROWS',
            body=body
        ).execute()
        
        print(f"✅ Successfully logged to Google Sheets")
        print(f"   Team: {team} | Job: {jobTitle} | Level: {jobLevel}")
        print(f"   Overall: {overallMaturity} ({overallScore:.2f})")
        print(f"   Updated range: {result.get('updates', {}).get('updatedRange', '')}")
        
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
