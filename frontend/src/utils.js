import axios from 'axios'

export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to set a cookie
export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export function createUser ({ personalName, organization }) {
    const csrftoken = getCookie('csrftoken')
    
    return fetch('/api/create-user/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrftoken
    },
    body: `personal_name=${encodeURIComponent(personalName)}&organization=${encodeURIComponent(organization)}`
    })
}

export function checkNewUser() {
    return fetch('/api/check-user/')
}

export function isUserNew(response) {
    const userStatus = response.headers.get('X-User-Status');
    return (userStatus === 'New');
}

export async function fetchConversationHistory(session_id) {
    try {
        console.log("Trying to retrieve conversation history for session ID " + session_id);
        const response = await axios.get(`/api/get-conversation/${session_id}/`);
        const data = response.data.context;
        return data.map(msg => ({ sender: msg.role, text: msg.content }));
    } catch (error) {
        console.error('Error fetching conversation history:', error);
    }
};


// Hardcode
export async function createConversation(session_id, user_details) {
    try {
        const csrftoken = getCookie('csrftoken');
        await axios.post('/api/create-conversation/', 
        { 
            session_id: session_id, 
            user_name: user_details.user_name, 
            user_job: user_details.user_job, 
            user_org: user_details.user_org, 
            initial_response: "**Debrief from Your Meeting**\n\n💡 As a **" + user_details.user_job + "**, you've just concluded a sales meeting.\n\n🤔 Let's think about product-market fit: do we solve a pain point here? What does the lead really want?\n\n🧙 Talk to me! I'll suggest hypotheses to guide the process and store your conversation for future reference."
        }, 
        { 
            headers: {
                'X-CSRFToken': csrftoken
            },
        });
        console.log('Created conversation with session ID ', session_id);
    } catch (error) {
        console.error('Error creating conversation:', error);
    }
};

export async function postToConversation(sessionId, userInput) {
    const csrftoken = getCookie('csrftoken');

    // Send the conversation with the new message to the chatbot service and await confirmation that the packet has been accepted
    const response = await axios.post( '/api/generate-text/', 
        {
            prompt: userInput,
            session_id: sessionId,
        },
        { 
            headers: {
                'X-CSRFToken': csrftoken
            },
        }
    );

    return response;
}

export async function createUserSession(session_id, user_details) {
    try {
        const csrftoken = getCookie('csrftoken');
        await axios.post('/api/create-session/', 
            { 
                session_id: session_id, 
                user_id: user_details.id 
            }, 
            { 
                headers: {
                    'X-CSRFToken': csrftoken
                },
            }
        );
        console.log('Created user session ID ', session_id, ' for user ID ', user_details.id);
    } catch (error) {
        console.error('Error creating user session:', error);
    }
};

export async function formulateHypothesis(session_id) {
    try {
        // Ping the chatbot asking it to summarize the conversation so far and spit out a few key learnings for the user to modify
        const csrftoken = getCookie('csrftoken');
        const response = await axios.post('/api/generate-hypothesis/', 
            { session_id: session_id },
            {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json',
                }
            }
        );
        console.log('Created hypothesis:', response);
        return response.data.generatedText;
    } catch (error) {
    console.error('Error creating hypothesis:', error);
    }
};

// Function to extract initials from the user's name
export function getUserInitials(currentUser) {
    if (currentUser && currentUser.user_name) {
        const names = currentUser.user_name.split(' ');
        const initials = names.map(name => name[0].toUpperCase()).join('');
        return initials;
    }
    return '';
};

export async function postFeedback(feedback, sessionId) {
    const csrftoken = getCookie('csrftoken');
    return fetch('/api/feedback/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback: feedback, sessionId: sessionId }),
    });
} 