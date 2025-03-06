import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useUser } from '../UserContext';

import './MeetingDebriefInfoScreen.css';


function ManagerViewInfoScreen() {
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
                    <p><b>Sales Manager View</b></p>
                </div>
                <div className="new-user-info">
                    <p>
                        🤠 In this demo, you step into the role of a sales manager reviewing the hypothesis results from your team's meetings in the last week.
                        <br/>
                        <br/>
                        🤖 The AI has helped listen to the thoughts and feelings of your team and elicited hypotheses about what's really going on with the client. It's also grouped them based on which of your top-level convictions they may help support or dispove.
                        <br/>
                        <br/>
                        🔍 Review the hypotheses and meeting details. Decide if you should eliminate top-level convictions or change the pitch. Remember: you can only get to product-market fit by reacting to feedback!
                    </p>
                    <div style={{display: "flex", alignContent: "center", marginTop: "20px"}}>
                        <div className="submit-button">Coming Soon!</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManagerViewInfoScreen;
