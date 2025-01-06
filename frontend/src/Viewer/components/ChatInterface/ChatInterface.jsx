import React, { useState } from 'react';

const ChatInterface = () => {
  const [chatMessages, setChatMessages] = useState([]);

  const handleSendMessage = async (message) => {
    // Send user message to ChatGPT API and handle response
    const response = await sendToChatGPT(message);

    // Update chatMessages with user message and ChatGPT response
    setChatMessages([...chatMessages, { text: message, isUser: true }, { text: response, isUser: false }]);
  };

  return (
    <div>
      <div className="chat-container">
        {chatMessages.map((msg, index) => (
          <div key={index} className={msg.isUser ? 'user-message' : 'gpt-message'}>
            {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage(e.target.value);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
};

export default ChatInterface;