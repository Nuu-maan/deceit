const express = require('express');
const fs = require('fs');
const path = require('path');
const { renderServerDetail, renderServerList } = require('./template');
const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static(__dirname));

// Load server data from data.json
const loadServerData = () => {
    const dataPath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(dataPath)) {
        throw new Error('Data file not found');
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
};

// Routes
app.get('/servers', (req, res) => {
    try {
        const servers = loadServerData();
        res.send(renderServerList(servers));
    } catch (error) {
        res.status(500).send('Error loading server data');
    }
});

app.get('/server/:id', (req, res) => {
    try {
        const servers = loadServerData();
        const server = servers.find(srv => srv.serverID === req.params.id);

        if (server) {
            res.send(renderServerDetail(server));
        } else {
            res.status(404).send('Server not found');
        }
    } catch (error) {
        res.status(500).send('Error loading server data');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
