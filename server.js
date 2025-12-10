const express = require('express');
const next = require('next');
const cors = require('cors');
const Pusher = require('pusher');
const Sentiment = require('sentiment');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next ({ dev });
const handle = app.getRequestHandler();

const sentiment = new Sentiment();

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.PUSHER_APP_SECRET,
    cluster: process.PUSHER_APP_CLUSTER,
    useTLS: true,
});

const chatHistory = { messages: [] };

const PORT = process.env.PORT || 3000;

app
    .prepare()
    .then(() => {
        const server = express();

        server.use(cors());
        server.use(express.json());
        server.use(express.urlencoded({ extended: true }));


        //Save message + sentiment + broadcast
        server.post('/message', (req, res) => {
            const { user = null, message = '', timestamp = +new Date() } = req.body;

            const sentimentScore = sentiment.analyze(message).score;

            const chat = {
                user,
                message,
                timestamp,
                sentiment: sentimentScore,
            };

            chatHistory.messages.push(chat);

            pusher.trigger('chat-room', 'new-message', { chat });

            res.json({ status: 'ok'});
        });

        server.post('/messages', (req, res) => {
            res.json({
                status: 'success',
                messages: chatHistory.messages,
            });
        });

        server.use((req, res) => {
            return handle(req, res);
        });

        server.listen(PORT, (err) => {
            if (err) throw err;
            console.log('> Ready on http://localhost:${PORT}');
        });
    })

    .catch((err) => {
        console.error('Error starting server:', err);
        process.exit(1);
    })

