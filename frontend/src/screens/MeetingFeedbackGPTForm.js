import React, { useState, useEffect, useRef } from 'react';
import "./MeetingFeedbackGPTForm.css"
import { 
    createUserSession, 
    getUserInitials, 
    postToConversation, 
    formulateHypothesis, 
    createConversation, 
    fetchConversationHistory, 
    getCookie, 
    setCookie 
} from "../utils"
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const MeetingFeedbackGPTForm = () => {
    const DEFAULT_HYPOTHESIS_COPY = "Talk to the bot below! This box will summarize your learnings for review. Press Enter to submit when you're done."
    
    const [isLoading, setIsLoading] = useState(false);
    const [isHypothesisBoxVisible, setIsHypothesisBoxVisible] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isPlaceholder, setIsPlaceholder] = useState(true);

    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [hypothesis, setHypothesis] = useState('');
    const [suggestedHypothesis, setSuggestedHypothesis] = useState(DEFAULT_HYPOTHESIS_COPY);

    const { currentUser, setCurrentUser } = useUser();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const hypothesisRef = useRef(null);

    useEffect(() => {
        console.log("current user is:", currentUser)


        if (!currentUser) {
            navigate("/");
        }

        const loadConversationHistory = async (tempSessionId) => {
            try {
                const messages = await fetchConversationHistory(tempSessionId);
                setMessages(messages);
            } catch (error) {
                console.error("Failed to load conversation history from server!")
            }
        };

        const initializeConversation = async () => {
            setIsLoading(true);

            // Loading process: create or retrieve the sessionId and then register with the server that a new conversation has been created
            let currentSessionId = getCookie('sessionId');
            if (!currentSessionId) {
                currentSessionId = uuidv4(); // Generate a new UUID
                setCookie('sessionId', currentSessionId, 30);
                // Create a conversation history in the chatbot service including copied metadata from the user info
                await createConversation(currentSessionId, currentUser);
                // Create a UI session in the main service that includes the user ID as a foreign key 
                await createUserSession(currentSessionId, currentUser);
            }

            setSessionId(currentSessionId);
            console.log("Set session ID to " + currentSessionId + "; now it's " + sessionId);
    
            // Now fetch the (mostly empty) conversation history from the chatbot and write it 
            loadConversationHistory(currentSessionId);
            setIsLoading(false);
        };

        localStorage.setItem("hypothesis", null);
    
        initializeConversation();
    }, [currentUser, sessionId, navigate]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (messages.length > 2) {
            setIsHypothesisBoxVisible(true);
        }
    }, [messages]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
      
        window.addEventListener('resize', handleResize);
    }, [messages]);

    const formatMessageText = (inputText) => {
        if (!(inputText)) {
            return inputText;
        }
        // Split text by "**", considering them as toggles between bold and normal
        const tokens = inputText.split('**');
        const elements = tokens.map((token, index) => {
          // Odd-indexed tokens are surrounded by "**" and should be bold
          if (index % 2 !== 0) {
            return <b key={index}>{token}</b>;
          } else {
            return token;
          }
        });
    
        return <>{elements}</>;
      };

    const handleInputChange = (event) => {
        setUserInput(event.target.value);
    };

    const handleHypothesisChange = (event) => {
        setHypothesis(event.target.value);

        if (isPlaceholder && event.target.value) {
            setIsPlaceholder(false);
        }
    };

    const handleBlur = () => {
        if (!hypothesis.trim()) {
          setIsPlaceholder(true);
        }
      };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!userInput.trim()) return;
      
        const updatedMessages = [...messages, { sender: 'user', text: userInput }]

        const placeholderMessages = [...updatedMessages, { sender: 'assistant', text: <span className="typing-animation">...</span> }]

        // TODO add a little animation
        setMessages(placeholderMessages);
        setUserInput('');

        // Send request to the chatbot service, which will route to OpenAI
        try {
            setIsLoading(true);
            // Get an ack that we posted the user's input to the conversation
            const chatbotAck = await postToConversation(sessionId, userInput);

            // Then, request the updated conversation history from the chatbot service and display it
            const newMessages = await fetchConversationHistory(sessionId);
            
            // TODO If the conversation is long enough, populate the hypothesis
            if (newMessages.length > 1) {
                // Logic to formulate a hypothesis from the conversation
                const newHypothesis = await formulateHypothesis(sessionId);
                console.log("setting new placeholder hypothesis: ", newHypothesis);
                setSuggestedHypothesis(newHypothesis);
            }
            
            setMessages(newMessages);
            setIsLoading(false);

        } catch (error) {
          console.error('Error fetching response from GPT-3:', error);
        }
    };

    const handleKeyDown = (event) => {
        if (!isLoading && event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            // Call the function to send the message
            handleSubmit(event);
        }
    };
    

    const handleKeyPressedInHypothesisBox = (e) => {
        if (e.key === "Enter") {
            handleHypothesisSubmit();
        }
    }

    const handleHypothesisSubmit = () => {
        localStorage.setItem("hypothesis", hypothesis);
        navigate('/feedback');
    };

    const handleHypothesisFocus = () => {
        // On focus, if the hypothesis is empty, set it to the default text
        if (isPlaceholder) {
            setHypothesis(suggestedHypothesis);
            setIsPlaceholder(false);
        }
        // This timeout ensures the text is selected after the state update
        setTimeout(() => {
            hypothesisRef.current.select();
        }, 0);
    }

    return (
        <div className="meeting-feedback-container">
            {currentUser ? (
            <>
                {isHypothesisBoxVisible ? <div className="hypothesis-container" style={{visibility: isHypothesisBoxVisible ? "visible" : "hidden"}}>
                    <textarea 
                        ref={hypothesisRef}
                        value={isPlaceholder ? "" : hypothesis} 
                        onChange={handleHypothesisChange} 
                        onFocus={handleHypothesisFocus}
                        onBlur={handleBlur}
                        onKeyUp={handleKeyPressedInHypothesisBox}
                        placeholder={suggestedHypothesis}
                        className="hypothesis-input"
                    />
                    <button onClick={handleHypothesisSubmit} className="submit-hypothesis-button" disabled={isLoading}><b>→</b></button>
                </div> : <div /> }
                

                <div className="chat-container">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'gpt-message'}`}>
                                {typeof msg.text === 'object' ? msg.text : <span>{formatMessageText(msg.text)}</span>}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className="message-form">
                        <textarea 
                            value={userInput} 
                            onChange={handleInputChange} 
                            onKeyDown={handleKeyDown}
                            placeholder="Your message" 
                            className="message-input"
                        />
                        <button type="submit" className="send-button" disabled={isLoading}><b>↑</b></button>
                    </form>
                </div>
                
                <div className="user-initials"
                    onMouseEnter={() => setShowDetails(true)}
                    onMouseLeave={() => setShowDetails(false)}>

                    {getUserInitials(currentUser)}

                    {showDetails && currentUser && (
                        <div className="user-details-tooltip">
                            <div>{currentUser.user_name}</div>
                            <div>{currentUser.user_org}</div>
                            <div>{currentUser.user_job}</div>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <p>Loading...</p> // Or any other placeholder content
        )}
        </div>
    );
};

export default MeetingFeedbackGPTForm;
