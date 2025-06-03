import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAuthenticated) {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
      ws.current = new WebSocket(`${wsUrl}?token=${token}`);

      ws.current.onopen = () => {
        console.log('Connected to WebSocket server');
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          setMessages((prev) => [...prev, { sender: data.sender, message: data.message }]);
        } else if (data.type === 'error') {
          alert(data.message);
          setIsAuthenticated(false);
        }
      };

      ws.current.onclose = () => {
        console.log('Disconnected from WebSocket server');
        setIsAuthenticated(false);
      };

      return () => {
        ws.current.close();
      };
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogin = () => {
    if (token === 'user1-token' || token === 'user2-token') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid token. Use "user1-token" or "user2-token".');
    }
  };

  const sendMessage = () => {
    if (message.trim() && ws.current) {
      ws.current.send(JSON.stringify({ type: 'message', message }));
      setMessages((prev) => [...prev, { sender: token, message }]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {!isAuthenticated ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Private Chat Login</h1>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your token (user1-token or user2-token)"
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Private Chat</h1>
          <div className="h-96 overflow-y-auto mb-4 p-4 border rounded">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${
                  msg.sender === token ? 'bg-blue-500 text-white ml-10' : 'bg-gray-200 mr-10'
                }`}
              >
                <strong>{msg.sender === token ? 'You' : 'Other'}:</strong> {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-l"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
