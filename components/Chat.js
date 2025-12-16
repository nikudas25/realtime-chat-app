import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

export default function Chat({ activeUser }) {
const [chats, setChats] = useState([]);
const bottomRef = useRef(null);

  // 🔹 Connect to Pusher + fetch chat history
useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
    });

    const channel = pusher.subscribe('chat-room');

    channel.bind('new-message', ({ chat }) => {
    setChats((prev) => [...prev, chat]);
    });

    // Fetch existing messages
    axios.post('/messages').then((res) => {
    setChats(res.data.messages || []);
    });

    return () => {
    pusher.unsubscribe('chat-room');
    pusher.disconnect();
    };
}, []);

  // 🔹 Auto-scroll to bottom when new message arrives
useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [chats]);

  // 🔹 Handle sending message
const handleKeyUp = (evt) => {
    const value = evt.target.value;

    if (evt.keyCode === 13 && !evt.shiftKey) {
    const chat = {
        user: activeUser,
        message: value,
        timestamp: +new Date(),
    };

    axios.post('/message', chat);
    evt.target.value = '';
    }
};

  // 🔹 Sentiment emoji
const getMood = (score) => {
    if (score > 0) return '😄';
    if (score === 0) return '😐';
    return '☹️';
};

return (
    <div
    className="p-3"
    style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a',
        color: '#fff',
    }}
    >
      {/* Messages */}
    <div
        style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: '6px',
        }}
    >
        {chats.map((c, i) => (
        <div
            key={i}
            style={{
            display: 'flex',
            justifyContent:
                c.user === activeUser ? 'flex-end' : 'flex-start',
            marginBottom: '10px',
            }}
        >
            <div
            style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: '18px',
                background:
                c.user === activeUser ? '#4f46e5' : '#1e293b',
                color: '#fff',
            }}
            >
            <div
                style={{
                fontSize: '12px',
                opacity: 0.7,
                marginBottom: '4px',
                }}
            >
                {getMood(c.sentiment)} {c.user}
            </div>
            <div>{c.message}</div>
            </div>
        </div>
        ))}
        <div ref={bottomRef}></div>
    </div>

      {/* Input */}
    <textarea
        className="form-control mt-3"
        placeholder="Type a message and press Enter"
        onKeyUp={handleKeyUp}
        style={{
        resize: 'none',
        borderRadius: '20px',
        padding: '10px 14px',
        }}
    ></textarea>
    </div>
);
}
