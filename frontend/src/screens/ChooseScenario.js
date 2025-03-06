import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useUser } from '../UserContext';

import './ChooseScenario.css';


function ChooseScenarioScreen() {
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

    const onMeetingFeedbackClick = (e) => {
        e.preventDefault();

        navigate('/welcome')
    };

    const onManagerViewClick = (e) => {
        e.preventDefault();

        navigate('/welcome-manager')
    };

    return (
        <div className="new-user-form-container"> {/* Add a container class */}
            <div className="blur-box-container">
                <div className="new-user-title">
                    <p><b>Choose Demo Scenario</b></p>
                </div>
                <div className="new-user-info">
                    <p>
                        🚀 Welcome to the demo version of the Sales Therapist app!
                        <br/>
                        <br/>
                        🦹‍♂️ Choose your scenario:
                    </p>
                    <div style={{display: "flex", alignContent: "center", marginTop: "20px"}}>
                        <div onClick={onMeetingFeedbackClick} className="submit-button">Sales Meeting Debrief</div>
                    </div>
                    <div style={{display: "flex", alignContent: "center", marginTop: "20px"}}>
                        <div onClick={onManagerViewClick} className="submit-button">Sales Manager View</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChooseScenarioScreen;
