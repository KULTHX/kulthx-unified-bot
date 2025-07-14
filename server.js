const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from the built React app
app.use(express.static(path.join(__dirname, 'kulthx-control-panel/dist')));

// API routes for bot control
let botConfig = {};

app.post('/api/bot/token', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
    }
    
    // Save token to config
    botConfig.discord_token = token;
    
    // Save to file for the bot to read
    const fs = require('fs');
    const configPath = path.join(__dirname, 'kulthx-backend/src/bot_config.json');
    
    try {
        fs.writeFileSync(configPath, JSON.stringify(botConfig, null, 2));
        console.log('✅ Bot token updated successfully');
        res.json({ success: true, message: 'Token updated successfully' });
    } catch (error) {
        console.error('❌ Failed to save bot config:', error);
        res.status(500).json({ success: false, error: 'Failed to save token' });
    }
});

app.get('/api/bot/status', (req, res) => {
    res.json({
        success: true,
        status: 'connected',
        stats: {
            servers: 1,
            users: 150,
            uptime: '1h 30m',
            scriptsProtected: 25
        }
    });
});

// Serve the script protection API
app.get('/script.lua', (req, res) => {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).send('Script ID is required');
    }
    
    // This is a placeholder - in production, you'd load from database
    const script = `
-- KULTHX SAFEME Protected Script
-- Script ID: ${id}
print("🔒 KULTHX SAFEME - Script loaded successfully!")
print("🛡️ This script is protected by KULTHX SAFEME system")
print("📊 Script ID: ${id}")

-- Your protected script content would go here
-- This is just a demo script
    `;
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(script);
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'kulthx-control-panel/dist/index.html'));
});

// Start the Discord bot in the background
function startBot() {
    console.log('🤖 Starting Discord bot...');
    const botProcess = spawn('node', ['kulthx-discord-bot/bot.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
    
    botProcess.on('error', (error) => {
        console.error('❌ Failed to start bot:', error);
    });
    
    botProcess.on('exit', (code) => {
        console.log(`🤖 Bot process exited with code ${code}`);
        // Restart bot after 5 seconds if it crashes
        setTimeout(startBot, 5000);
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KULTHX Unified Server running on port ${PORT}`);
    console.log(`🌐 Control Panel: http://localhost:${PORT}`);
    console.log(`🔗 Script API: http://localhost:${PORT}/script.lua?id=<script_id>`);
    
    // Start the Discord bot
    startBot();
});

