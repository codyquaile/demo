const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const app = express();
app.use(express.json());

const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'credentials', 'service-account.json');

// On startup, write the env var to a file if it doesn't exist
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  fs.mkdirSync(path.dirname(SERVICE_ACCOUNT_PATH), { recursive: true });
  fs.writeFileSync(SERVICE_ACCOUNT_PATH, process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'utf8');
}

// Place your service account JSON in backend/credentials/
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'credentials', 'tactile-buckeye-300722-abf7b7618f14.json');
const SHEET_ID = '1ipe_exMhLtcT045gIcwiUsZPzJbFZU1Ll_qAUpS2rro';

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
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

app.listen(3001, () => console.log('Backend server running on port 3001')); 