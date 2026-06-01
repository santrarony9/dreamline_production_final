// ============================================================
// Google Business Profile Auto-Poster via Apps Script
// ============================================================
// This script receives a webhook from your Dreamline server
// and posts directly to Google Business Profile.
//
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com
// 2. Create a new project, paste this code
// 3. Click "Deploy" → "New deployment" → "Web app"
//    - Execute as: "Me" (your Google account)
//    - Who has access: "Anyone"
// 4. Copy the Web App URL and set it as APPS_SCRIPT_WEBHOOK_URL
//    in your Vercel environment variables
// ============================================================

// Your Business Profile details (fill these in)
const ACCOUNT_ID = ''; // e.g. 'accounts/1234567890'
const LOCATION_ID = ''; // e.g. 'locations/9876543210'

// Security key to prevent unauthorized calls
const WEBHOOK_SECRET = 'dreamline_auto_2026';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Verify secret
    if (payload.secret !== WEBHOOK_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, error: 'Unauthorized'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const title = payload.title || 'New Update';
    const summary = payload.summary || '';
    const imageUrl = payload.sourceUrl || payload.image || '';
    const ctaUrl = payload.url || 'https://dreamlineproduction.com';
    
    // Build the post body
    const postBody = {
      languageCode: 'en-US',
      summary: (title.toUpperCase() + '\n\n' + summary).substring(0, 1500),
      callToAction: {
        actionType: 'LEARN_MORE',
        url: ctaUrl
      },
      topicType: 'STANDARD'
    };
    
    // Add image if available
    if (imageUrl) {
      postBody.media = [{
        mediaFormat: 'PHOTO',
        sourceUrl: imageUrl
      }];
    }
    
    // Post to Google Business Profile
    const url = 'https://mybusiness.googleapis.com/v4/' + ACCOUNT_ID + '/' + LOCATION_ID + '/localPosts';
    
    const options = {
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      },
      payload: JSON.stringify(postBody),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = JSON.parse(response.getContentText());
    
    if (responseCode === 200 || responseCode === 201) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        postName: responseBody.name,
        message: 'Posted to Google Business Profile'
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'GBP API Error',
        status: responseCode,
        details: responseBody
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function - run this manually to verify your Account/Location IDs
function listAccountsAndLocations() {
  try {
    // List accounts
    const accountsUrl = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';
    const accountsRes = UrlFetchApp.fetch(accountsUrl, {
      headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    Logger.log('=== ACCOUNTS ===');
    Logger.log(accountsRes.getContentText());
    
    const accounts = JSON.parse(accountsRes.getContentText());
    if (accounts.accounts && accounts.accounts.length > 0) {
      const accountName = accounts.accounts[0].name;
      Logger.log('Found account: ' + accountName);
      
      // List locations
      const locationsUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1/' + accountName + '/locations';
      const locationsRes = UrlFetchApp.fetch(locationsUrl, {
        headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true
      });
      Logger.log('=== LOCATIONS ===');
      Logger.log(locationsRes.getContentText());
    }
  } catch (error) {
    Logger.log('Error: ' + error.message);
  }
}
