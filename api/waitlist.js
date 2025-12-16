// Vercel serverless function to handle waitlist submissions
// This keeps Google Sheets credentials private (server-side only)

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email, name } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Get credentials from environment variables
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'Waitlist';

    if (!credentials || !spreadsheetId) {
      console.error('Missing Google Sheets configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Parse service account credentials
    const serviceAccount = JSON.parse(credentials);

    // Import googleapis (will be installed as dependency)
    const { google } = require('googleapis');

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare the data to append
    const timestamp = new Date().toISOString();
    const values = [[timestamp, email, name || '']];

    // Append to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:C`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values,
      },
    });

    // Success response
    return res.status(200).json({ 
      success: true, 
      message: 'Successfully joined the waitlist!' 
    });

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    
    // Don't expose internal errors to client
    return res.status(500).json({ 
      error: 'Failed to join waitlist. Please try again later.' 
    });
  }
}

