import React, { useState, useEffect, useRef } from 'react';

const QA_DATA = [
  {
    id: 'notes',
    question: 'How do I access academic notes?',
    answer: 'You can access notes, PYQs, and syllabuses by clicking on the "Academic Resources" tab under "Campus Life" in the main navigation. Note: You must be logged in to view them!'
  },
  {
    id: 'hostels',
    question: 'Where can I find PG or Hostel details?',
    answer: 'Information about Boys/Girls PGs and College Hostels can be found under the "Stay & PG" section in the main menu.'
  },
  {
    id: 'query',
    question: 'How do I submit a formal query/complaint?',
    answer: 'Once you are logged in as a student, you will see a "My Queries" button in your menu. Click that to submit your issue directly to the admin team.'
  },
  {
    id: 'food',
    question: 'Where can I find good food?',
    answer: 'Check out the "Food & Dining" section! It lists all the best local Tea Spots and Restaurants around the campus.'
  },
  {
    id: 'dept_admin',
    question: 'How do I become a Department Admin?',
    answer: 'Department Admins are appointed by the Master Admin. If you wish to volunteer to upload notes for your department, please reach out to the admin team or submit a formal query.'
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi there! 👋 I am the KSU CUSAT virtual assistant. How can I help you today?' }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleQuestionClick = (qa) => {
    setMessages(prev => [...prev, { type: 'user', text: qa.question }]);
    
    // Simulate thinking delay
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: qa.answer }]);
    }, 600);
  };

  const handleReset = () => {
    setMessages([{ type: 'bot', text: 'How else can I help you?' }]);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window slide-up">
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="chatbot-avatar">
                <i className="ti ti-robot"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>Campus Assistant</h3>
                <span style={{ fontSize: '11px', color: '#a5f3fc' }}>Online</span>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <i className="ti ti-x"></i>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.type === 'user' ? 'row-user' : 'row-bot'}`}>
                {msg.type === 'bot' && (
                  <div className="message-icon-bot">
                    <i className="ti ti-robot"></i>
                  </div>
                )}
                <div className={`message-bubble ${msg.type === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="chatbot-options">
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Suggested Questions:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {QA_DATA.map(qa => (
                <button key={qa.id} className="chatbot-option-btn" onClick={() => handleQuestionClick(qa)}>
                  {qa.question}
                </button>
              ))}
            </div>
            {messages.length > 2 && (
              <button className="chatbot-reset-btn" onClick={handleReset}>
                <i className="ti ti-refresh" style={{ marginRight: '4px' }}></i> Start Over
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button className="chatbot-fab" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Chatbot">
        {isOpen ? <i className="ti ti-x"></i> : <i className="ti ti-message-circle-2"></i>}
      </button>
    </div>
  );
}
