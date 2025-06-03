const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const VALID_TOKENS = ['user1-token', 'user2-token']; // Predefined tokens for two users
let clients = [];

app.use(express.static('public')); // Serve static files if hosting frontend on Render

wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const token = urlParams.get('token');

    if (!VALID_TOKENS.includes(token)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
        ws.close();
        return;
    }

    if (clients.length >= 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'Chat is full' }));
        ws.close();
        return;
    }

    clients.push({ ws, token });
    console.log(`Client connected with token: ${token}`);

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'message') {
            clients.forEach((client) => {
                if (client.ws !== ws || clients.length === 1) {
                    client.ws.send(JSON.stringify({
                        type: 'message',
                        sender: token,
                        message: message.message
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log(`Client with token ${token} disconnected`);
        clients = clients.filter(client => client.ws !== ws);
    });
});

server.listen(process.env.PORT || 8080, () => {
    console.log(`Server running on port ${process.env.PORT || 8080}`);
});
