import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from "../utils"
import { useUser } from '../UserContext';

import './MeetingDebriefInfoScreen.css';


function EnterUserDetailsForm() {
    const [personalName, setPersonalName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [organization, setOrganization] = useState('');
    
    const [isUserSet, setIsUserSet] = useState(false);

    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useUser();

    useEffect(() => {
        if (currentUser && isUserSet) {
            console.log(currentUser);
            navigate("/meeting-debrief");
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

        createUser({ personalName, jobTitle, organization })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('User created successfully:', data.user_id);
                setCurrentUser({ id: data.user_id, user_name: personalName, user_job: jobTitle, user_org: organization });
                setIsUserSet(true);
            } else {
                console.log('Errors:', data.errors);
                // Display errors to the user
            }
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div className="new-user-form-container"> {/* Add a container class */}
            <div className="blur-box-container">
                <form onSubmit={handleSubmit} className="new-user-form"> {/* Add a form class */}
                    <div className="new-user-you-are">
                    <b><p>Sales Meeting Debrief</p><br/>You are...
                    </b>
                    </div>
                    <input
                        type="text"
                        value={personalName}
                        onChange={e => setPersonalName(e.target.value)}
                        placeholder="Name"
                        required
                        className="form-input" // Use or create a class for styling
                    />
                    <input
                        type="text"
                        value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                        placeholder="Role"
                        required
                        className="form-input" // Use or create a class for styling
                    />
                    <input
                        type="text"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="Organization"
                        required
                        className="form-input" // Use or create a class for styling
                    />
                    <button type="submit" className="submit-button">Start Demo</button> {/* Use or create a button class */}
                </form>
            </div>
        </div>
    );
}

export default EnterUserDetailsForm;
