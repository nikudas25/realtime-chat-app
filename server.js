require('dotenv').config();

const express = require('express');
const next = require('next');
const cors = require('cors');
const Pusher = require('pusher');
const Sentiment = require('sentiment');


const requiredEnv = [
  'PUSHER_APP_ID',
  'PUSHER_APP_KEY',
  'PUSHER_APP_SECRET',
  'PUSHER_APP_CLUSTER',
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
});

console.log('✅ ENV LOADED');


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const sentiment = new Sentiment();

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true,
});

const chatHistory = { messages: [] };
const PORT = process.env.PORT || 3000;


app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));


  server.get('/health', (req, res) => {
    res.json({ status: 'OK' });
  });


  server.post('/message', (req, res) => {
    console.log('📩 /message called');
    console.log('Body:', req.body);

    try {
      const { user, message, timestamp } = req.body || {};

      if (!user || !message) {
        console.log('❌ Invalid payload');
        return res.status(400).json({ error: 'Invalid payload' });
      }

      const sentimentScore = sentiment.analyze(message).score;

      const chat = {
        user,
        message,
        timestamp,
        sentiment: sentimentScore,
      };

      chatHistory.messages.push(chat);

      console.log('📡 Triggering Pusher');
      pusher.trigger('chat-room', 'new-message', { chat });

      console.log('✅ Message sent');
      res.json({ status: 'ok' });

    } catch (err) {
      console.error('🔥 SERVER ERROR:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  server.post('/messages', (req, res) => {
    res.json({
      status: 'success',
      messages: chatHistory.messages,
    });
  });


  server.use((req, res) => handle(req, res));

  server.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
  });
});
