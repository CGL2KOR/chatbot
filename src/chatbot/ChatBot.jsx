import React, { useState, useEffect, useRef } from 'react';

function ChatBot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! What city are you traveling to?' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(1);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);

    if (step === 1) {
      setMessages([...newMessages, { from: 'bot', text: `Great! What's your budget (INR)?` }]);
      setStep(2);
    } else if (step === 2) {
      setMessages([...newMessages, { from: 'bot', text: `Traveling for business or personal?` }]);
      setStep(3);
    } else if (step === 3) {
      setMessages([...newMessages, { from: 'bot', text: `Finding safe options for you...` }]);
      setStep(4);
      setTimeout(fetchRecommendations, 1500);
    }

    setInput('');
  };

  const fetchRecommendations = async () => {
    const res = await fetch('/recommendations.json');
    const data = await res.json();
    const stays = data.recommended_stays;

    const reply = stays.map((s, i) =>
      `🏨 ${s.name} (Score: ${s.score})\n🛏 Amenities: ${s.amenities.join(', ')}\n📍 Distance: ${s.distance_to_office_km} km\n⚠ Alerts: ${s.alert_badges.length ? s.alert_badges.join(', ') : 'None'}`
    ).join('\n\n');

    setMessages(prev => [...prev, { from: 'bot', text: reply }]);
  };

  return (
    <div className="chat-container">
      <div className="chat-window" ref={chatRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatBot;
