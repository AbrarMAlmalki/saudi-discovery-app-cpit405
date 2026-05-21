// src/components/chat/AISportsChat.js
import React, { useState, useRef, useEffect } from 'react';
import '../../styles/AISportsChat.css';

const AISportsChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [chatStarted, setChatStarted] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const questions = [
    {
      id: 1,
      text: "Hi there! 👋 I'm your AI Sports Assistant. Ready to find your perfect sport? Let's start! What's your fitness level?",
      options: ["Beginner", "Intermediate", "Advanced", "Professional"]
    },
    {
      id: 2,
      text: "Do you prefer team sports or individual activities?",
      options: ["Team Sports", "Individual Sports", "Both"]
    },
    {
      id: 3,
      text: "How much time can you dedicate to sports each week?",
      options: ["1-2 hours", "3-5 hours", "6-10 hours", "10+ hours"]
    },
    {
      id: 4,
      text: "What's your main goal?",
      options: ["Stay fit & healthy", "Competition & winning", "Have fun & socialize", "Lose weight", "Build strength"]
    },
    {
      id: 5,
      text: "Do you prefer indoor or outdoor activities?",
      options: ["Indoor", "Outdoor", "Both"]
    },
    {
      id: 6,
      text: "Would you prefer high-intensity or low-impact sports?",
      options: ["High-intensity (running, football, basketball)", "Low-impact (swimming, yoga, golf)", "Mix of both"]
    },
    {
      id: 7,
      text: "Do you have any equipment preferences?",
      options: ["Minimal equipment needed", "Willing to buy basic equipment", "Already have equipment"]
    }
  ];

  const sportRecommendations = {
    // Beginner recommendations
    "Beginner:Team Sports:1-2 hours:Stay fit & healthy:Outdoor:Low-impact:Minimal equipment needed": {
      sport: "Walking Football",
      description: "A slower-paced version of football perfect for beginners! Great for fitness and socializing.",
      icon: "⚽",
      venue: "Local parks and community centers"
    },
    "Beginner:Individual Sports:1-2 hours:Stay fit & healthy:Both:Low-impact:Minimal equipment needed": {
      sport: "Walking/Jogging",
      description: "Start with daily walks or light jogs. Build your endurance gradually!",
      icon: "🚶",
      venue: "Any park or neighborhood"
    },
    "Beginner:Both:3-5 hours:Have fun & socialize:Outdoor:Mix of both:Minimal equipment needed": {
      sport: "Ultimate Frisbee",
      description: "Fun, social, and great cardio! Perfect for meeting new people.",
      icon: "🥏",
      venue: "Beaches, parks, open fields"
    },
    
    // Intermediate recommendations
    "Intermediate:Team Sports:3-5 hours:Competition & winning:Outdoor:High-intensity:Willing to buy basic equipment": {
      sport: "Football (Soccer)",
      description: "Perfect for team players who love competition! Join local leagues in Riyadh or Jeddah.",
      icon: "⚽",
      venue: "King Fahd Stadium, local football pitches"
    },
    "Intermediate:Individual Sports:3-5 hours:Competition & winning:Indoor:High-intensity:Willing to buy basic equipment": {
      sport: "Badminton",
      description: "Fast-paced, strategic, and great for reflexes! Very popular in Saudi Arabia.",
      icon: "🏸",
      venue: "Indoor sports halls, community centers"
    },
    "Intermediate:Both:6-10 hours:Build strength:Both:High-intensity:Already have equipment": {
      sport: "CrossFit",
      description: "Challenge yourself with varied functional movements. Build strength and endurance!",
      icon: "💪",
      venue: "CrossFit boxes in major cities"
    },
    
    // Advanced recommendations
    "Advanced:Individual Sports:6-10 hours:Competition & winning:Outdoor:High-intensity:Already have equipment": {
      sport: "Marathon Running",
      description: "Test your limits! Saudi Arabia hosts several marathons throughout the year.",
      icon: "🏃",
      venue: "Riyadh Marathon, Jeddah Half Marathon"
    },
    "Advanced:Team Sports:10+ hours:Competition & winning:Outdoor:High-intensity:Already have equipment": {
      sport: "Basketball",
      description: "Fast-paced team sport that demands athleticism and strategy.",
      icon: "🏀",
      venue: "Indoor and outdoor courts across Saudi"
    },
    "Advanced:Individual Sports:6-10 hours:Build strength:Indoor:High-intensity:Already have equipment": {
      sport: "Olympic Weightlifting",
      description: "Master the snatch and clean & jerk. Build explosive power!",
      icon: "🏋️",
      venue: "Specialized gyms with certified coaches"
    },
    
    // Special recommendations
    "Intermediate:Individual Sports:3-5 hours:Stay fit & healthy:Indoor:Low-impact:Minimal equipment needed": {
      sport: "Swimming",
      description: "Full-body workout that's easy on joints. Perfect for fitness and relaxation!",
      icon: "🏊",
      venue: "Olympic pools in major cities"
    },
    "Beginner:Both:1-2 hours:Have fun & socialize:Outdoor:Low-impact:Minimal equipment needed": {
      sport: "Cycling",
      description: "Explore the city while getting fit. Join group rides for social fun!",
      icon: "🚴",
      venue: "Dedicated bike paths, parks"
    },
    "Intermediate:Individual Sports:3-5 hours:Stay fit & healthy:Outdoor:Low-impact:Minimal equipment needed": {
      sport: "Trail Running",
      description: "Experience nature while running. Saudi has beautiful mountain trails!",
      icon: "🏔️",
      venue: "Abha mountains, AlUla trails"
    }
  };

  const defaultRecommendation = {
    sport: "Try Different Sports!",
    description: "Based on your preferences, we recommend exploring multiple sports. Start with football, swimming, or cycling to see what you enjoy most!",
    icon: "🎯",
    venue: "Various venues across Saudi Arabia"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleStartChat = () => {
    setIsOpen(true);
    setChatStarted(true);
    setMessages([{ text: questions[0].text, isBot: true, options: questions[0].options }]);
    setCurrentQuestion(0);
  };

  const handleOptionSelect = (option) => {
    // Save response
    const newResponses = { ...userResponses, [currentQuestion]: option };
    setUserResponses(newResponses);
    
    // Add user message
    setMessages(prev => [...prev, { text: option, isBot: false }]);
    
    // Move to next question
    const nextQuestion = currentQuestion + 1;
    
    if (nextQuestion < questions.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { text: questions[nextQuestion].text, isBot: true, options: questions[nextQuestion].options }]);
        setCurrentQuestion(nextQuestion);
      }, 500);
    } else {
      // Generate recommendation
      setTimeout(() => {
        generateRecommendation(newResponses);
      }, 500);
    }
  };

  const generateRecommendation = (responses) => {
    setIsTyping(true);
    
    // Build key for recommendation lookup
    const answers = [
      responses[0], // fitness level
      responses[1], // team/individual
      responses[2], // time
      responses[3], // goal
      responses[4], // indoor/outdoor
      responses[5], // intensity
      responses[6]  // equipment
    ];
    
    const key = answers.join(':');
    
    let recommendationData = sportRecommendations[key];
    
    if (!recommendationData) {
      // Try fuzzy matching
      for (const [pattern, rec] of Object.entries(sportRecommendations)) {
        const patternParts = pattern.split(':');
        let matches = 0;
        for (let i = 0; i < answers.length; i++) {
          if (answers[i] === patternParts[i]) matches++;
        }
        if (matches >= 4) {
          recommendationData = rec;
          break;
        }
      }
    }
    
    const finalRec = recommendationData || defaultRecommendation;
    setRecommendation(finalRec);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: `🎉 Based on your answers, I recommend trying **${finalRec.sport}**!\n\n${finalRec.description}\n\n📍 Best venues: ${finalRec.venue}\n\nWould you like me to find upcoming events for you?`,
        isBot: true,
        isRecommendation: true,
        sport: finalRec.sport,
        description: finalRec.description,
        venue: finalRec.venue,
        icon: finalRec.icon
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFindEvents = () => {
    // Close chat and redirect to events page
    setIsOpen(false);
    window.location.href = '/events';
  };

  const handleRestart = () => {
    setMessages([]);
    setUserResponses({});
    setCurrentQuestion(0);
    setRecommendation(null);
    setChatStarted(false);
    handleStartChat();
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
    setUserResponses({});
    setCurrentQuestion(0);
    setRecommendation(null);
    setChatStarted(false);
  };

  return (
    <>
      {/* Chat Button */}
      <button className="ai-chat-button" onClick={handleStartChat}>
        <span className="chat-icon">🤖</span>
        <span className="chat-text">AI Coach</span>
        <span className="pulse-ring"></span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="header-icon">🤖</span>
              <div>
                <h3>AI Sports Assistant</h3>
                <p>Find your perfect sport</p>
              </div>
            </div>
            <button className="close-chat" onClick={handleClose}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                <div className="message-avatar">
                  {msg.isBot ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* Options buttons */}
                  {msg.options && (
                    <div className="options-container">
                      {msg.options.map((option, i) => (
                        <button
                          key={i}
                          className="option-btn"
                          onClick={() => handleOptionSelect(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Recommendation buttons */}
                  {msg.isRecommendation && (
                    <div className="recommendation-actions">
                      <button className="find-events-btn" onClick={handleFindEvents}>
                        🔍 Find Events
                      </button>
                      <button className="restart-btn" onClick={handleRestart}>
                        🔄 Start Over
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  );
};

export default AISportsChat;