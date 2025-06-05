const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());

// Write service account JSON from environment variable to file (for Render/production)
const CREDENTIALS_DIR = path.join(__dirname, 'credentials');
const SERVICE_ACCOUNT_PATH = path.join(CREDENTIALS_DIR, 'service-account.json');
if (!fs.existsSync(CREDENTIALS_DIR)) {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
}
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  fs.writeFileSync(SERVICE_ACCOUNT_PATH, process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'utf8');
}

// Use SHEET_ID from environment variable
const SHEET_ID = process.env.SHEET_ID;

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

app.post('/api/add-contact', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }
  try {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[name, phone]] },
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add contact to Google Sheets.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`)); 