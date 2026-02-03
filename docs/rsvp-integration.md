RSVP Integration Guide

This document shows two simple ways to integrate the front-end RSVP form with a Google Sheet:

1) Invitee list (for suggestions)
- Option A (public CSV): In Google Sheets, File → Publish to web → choose the sheet and CSV format, copy the URL and set it as the environment variable REACT_APP_RSVP_INVITEES_URL (used by the front-end to fetch names).
- Option B (JSON): Use a small script or Apps Script that returns JSON array of names.

2) Submit RSVPs → Google Sheet
Best practice is to use a Google Apps Script Web App that accepts POST requests and appends a row to the sheet.

Apps Script sample (create a new script bound to the sheet or standalone):

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById("YOUR_SHEET_ID").getSheetByName("Responses");
    const data = JSON.parse(e.postData.contents);
    // expected fields: name, rsvp, guests, children, email, ts
    sheet.appendRow([new Date(), data.name, data.rsvp, data.guests, data.children, data.email, data.ts]);
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

Deployment notes:
- Deploy → New deployment → Choose "Web app" and set "Who has access" to "Anyone" (or "Anyone, even anonymous") so the browser can POST without OAuth.
- Copy the web app URL and set it as REACT_APP_RSVP_SUBMIT_URL in your environment (.env.local or your hosting environment variables).

Security/Privacy:
- Using "Anyone, even anonymous" makes your script callable by anyone who has the URL. You can add a simple shared secret (check a header or a token in the POST body) to reduce abuse.

Testing locally:
- Create a local .env file in the project root with:
  REACT_APP_RSVP_INVITEES_URL="https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=Sheet1"
  REACT_APP_RSVP_SUBMIT_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vTnFOLHkK9qvvXqUK7atxT26WAbtxF-vPDvpcIEoUEXJVzFianKmykJXz0SJtIWlxLdTRaEn59p-mGU/pub?gid=0&single=true&output=csv"
- Restart the dev server after changing .env

If you'd like, I can: 
- Draft the exact Apps Script for your sheet and show step-by-step deployment instructions, or
- Deploy a small backend endpoint for you (needs hosting) — tell me which you prefer and provide the sheet link or permission details.