import React, { useState } from 'react';
import { postFeedback, getCookie } from '../utils';
import './FeedbackForm.css'; // Make sure to create this CSS file for styling
import ShareWithFriends from '../components/ShareWithFriends';

function FeedbackForm() {
    const [feedback, setFeedback] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (feedbackSubmitted) {
            return;
        }

        let currentSessionId = getCookie('sessionId');

        const response = await postFeedback(feedback, currentSessionId);

        if (response.ok) {
            setFeedbackSubmitted(true);
        } else {
            console.error('Failed to submit feedback');
        }
    };

    return (
        <div className="feedback-form-container">
            {
                feedbackSubmitted ? 
                    <div/> : 
                    <div class="feedback-info">
                        <p>
                            Thanks for interacting!
                            <br/><br/>
                            Your hypothesis was: <i>{localStorage.getItem("hypothesis")}</i>
                            <br/><br/>
                            Please leave some feedback on the demo. I'd love to hear your thoughts!
                        </p>
                    </div>
            }           
            {
                feedbackSubmitted ? 
                    <label className="feedback-box"><ShareWithFriends shareUrl="http://127.0.0.1:8000/"/></label> : 
                    <form onSubmit={handleSubmit} className="feedback-box">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Your feedback"
                            required
                            className="feedback-input"
                        />
                        <button type="submit" className={feedbackSubmitted ? "submitted-feedback-button" : "submit-feedback-button"}>{feedbackSubmitted ? "Thanks!" : "Submit Feedback"}</button>
                    </form>
            }
        </div>
    );
}

export default FeedbackForm;
