import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// System prompt context to guide the AI
const SYSTEM_PROMPT = `You are the official KSU (Kerala Students Union) CUSAT Campus Virtual Assistant.
Be friendly, helpful, and concise. Keep responses under 3-4 short paragraphs.
Your main goal is to help students navigate campus life at Cochin University of Science and Technology (CUSAT) in Kalamassery, Kochi.

Here is specific knowledge you must use to answer questions:
- Academic Notes: Students can access notes, PYQs, and syllabuses under the "Academic Resources" tab in the main navigation. They must be logged in.
- Hostels & PGs: Information about Boys/Girls PGs and College Hostels can be found under the "Stay & PG" section.
- Queries & Complaints: Students can submit formal queries by clicking "My Queries" in their menu once logged in.
- Food: The "Food & Dining" section lists local Tea Spots and Restaurants.
- Department Admins: Appointed by Master Admins. To volunteer, students should contact the admin team via the query system.
- CUSAT Campus details: Focus on helping students with practical life (food, stay, studies).

If you don't know the answer to a specific local question, politely say you don't have that exact information but encourage them to submit a formal query to the KSU helpdesk.`;

const QA_DATA = [
  { id: 'notes', question: 'How do I access academic notes?' },
  { id: 'hostels', question: 'Where can I find PG or Hostel details?' },
  { id: 'query', question: 'How do I submit a formal query/complaint?' },
  { id: 'food', question: 'Where can I find good food?' },
  { id: 'dept_admin', question: 'How do I become a Department Admin?' }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi there! 👋 I am the KSU CUSAT virtual assistant, powered by Gemini AI. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // We keep a parallel array of the raw chat history formatted for the Gemini API
  const [chatHistory, setChatHistory] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message to UI
    setMessages(prev => [...prev, { type: 'user', text }]);
    setInputText('');
    setIsTyping(true);

    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: 'Error: Gemini API Key is missing. Please add it to your .env file.' }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT
      });

      // Start a chat session using the accumulated history
      const chat = model.startChat({
        history: chatHistory,
      });

      // Send the message
      const result = await chat.sendMessage(text);
      const responseText = result.response.text();

      // Add bot message to UI
      setMessages(prev => [...prev, { type: 'bot', text: responseText }]);
      
      // Update the hidden chat history for the API
      setChatHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text }] },
        { role: 'model', parts: [{ text: responseText }] }
      ]);
      
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered a network error while trying to think. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  const handleQuestionClick = (qa) => {
    handleSendMessage(qa.question);
  };

  const handleReset = () => {
    setMessages([{ type: 'bot', text: 'Conversation reset! How else can I help you today?' }]);
    setChatHistory([]);
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
                <span style={{ fontSize: '11px', color: '#a5f3fc' }}>AI Powered</span>
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
                <div className={`message-bubble ${msg.type === 'user' ? 'bubble-user' : 'bubble-bot'}`} style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message-row row-bot">
                <div className="message-icon-bot">
                  <i className="ti ti-robot"></i>
                </div>
                <div className="message-bubble bubble-bot" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
              disabled={isTyping}
            />
            <button 
              className="btn-primary" 
              style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (inputText.trim() || isTyping) ? 1 : 0.5 }}
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
            >
              <i className="ti ti-send"></i>
            </button>
          </div>

          {/* Quick Replies */}
          {messages.length < 3 && (
            <div className="chatbot-options">
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Or try asking:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {QA_DATA.map(qa => (
                  <button key={qa.id} className="chatbot-option-btn" onClick={() => handleQuestionClick(qa)}>
                    {qa.question}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.length >= 3 && (
            <div style={{ background: 'var(--bg-card)', paddingBottom: '12px' }}>
              <button className="chatbot-reset-btn" onClick={handleReset}>
                <i className="ti ti-refresh" style={{ marginRight: '4px' }}></i> Start Over
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <button className="chatbot-fab" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Chatbot">
        {isOpen ? <i className="ti ti-x"></i> : <i className="ti ti-message-circle-2"></i>}
      </button>
    </div>
  );
}
