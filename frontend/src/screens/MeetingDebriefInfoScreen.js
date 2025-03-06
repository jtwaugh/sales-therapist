import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useUser } from '../UserContext';

import './MeetingDebriefInfoScreen.css';


function MeetingDebriefInfoScreen() {
    const [isUserSet, setIsUserSet] = useState(false);

    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useUser();

    useEffect(() => {
        if (currentUser && isUserSet) {
            console.log(currentUser);
            navigate("/");
        }
    }, [currentUser, isUserSet, navigate]);

    useEffect(() => {
        deleteSessionCookie();
      
    }, []);

    const deleteSessionCookie = () => {
        document.cookie = 'sessionId=; Max-Age=-99999999;';
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        navigate('/new-user')
    };

    return (
        <div className="new-user-form-container"> {/* Add a container class */}
            <div className="blur-box-container">
                <div className="new-user-title">
                    <p><b>Sales Meeting Debrief</b></p>
                </div>
                <form className="new-user-info" onSubmit={handleSubmit}>
                    <p>
                        🤠 In this demo, you step into the role of a sales professional (account executive, sales engineer, solutions architect, etc.) 
                        <br/>
                        <br/>
                        🤖 This scenario simulates a <i>sales meeting retrospective</i> - you know, the "let's take this offline" that never happens with your coworkers. But the bot is tireless!
                        <br/>
                        <br/>
                        🔍 Imagine you just got off the phone with a client. Vent at the bot and eventually decide on what you think is the real learning from the meeting. Enter your hypothesis on the top and we'll store it for the team.
                    </p>
                    <div style={{display: "flex", alignContent: "center", marginTop: "20px"}}>
                        <button type="submit" className="submit-button">Start Demo</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MeetingDebriefInfoScreen;
