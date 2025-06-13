const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));  // Serve static files from root directory

// Local storage path for passwords
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// In-memory cache
const passwords = new Map();
const users = new Map();

// Helper function to get user's password file path
function getUserPasswordsPath(userEmail) {
    return path.join(DATA_DIR, `${Buffer.from(userEmail).toString('base64')}.json`);
}

// Helper function to read user passwords
function readUserPasswords(userEmail) {
    const filePath = getUserPasswordsPath(userEmail);
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error reading passwords for ${userEmail}:`, error);
    }
    return {};
}

// Helper function to save user passwords
function saveUserPasswords(userEmail, passwords) {
    const filePath = getUserPasswordsPath(userEmail);
    try {
        fs.writeFileSync(filePath, JSON.stringify(passwords, null, 2));
        return true;
    } catch (error) {
        console.error(`Error saving passwords for ${userEmail}:`, error);
        return false;
    }
}

// API Routes
app.get('/api/passwords', (req, res) => {
    const userEmail = req.headers['x-user-email'];
    const userPasswords = readUserPasswords(userEmail);
    res.json({ success: true, passwords: userPasswords });
});

app.post('/api/passwords', (req, res) => {
    const userEmail = req.headers['x-user-email'];
    const id = Date.now().toString();
    const userPasswords = readUserPasswords(userEmail);
    
    userPasswords[id] = { ...req.body, userEmail };
    
    if (saveUserPasswords(userEmail, userPasswords)) {
        res.json({ success: true, id });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save password' });
    }
});

app.delete('/api/passwords/:id', (req, res) => {
    const { id } = req.params;
    const userEmail = req.headers['x-user-email'];
    const userPasswords = readUserPasswords(userEmail);
    
    delete userPasswords[id];
    
    if (saveUserPasswords(userEmail, userPasswords)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to delete password' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📂 Serving Password Manager from ${__dirname}`);
});
