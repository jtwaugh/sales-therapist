import React, { useState } from 'react';
import "./ShareWithFriends.css";

const ShareWithFriends = ({ shareUrl }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopyClick = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopySuccess('URL copied to clipboard!');
        } catch (err) {
            setCopySuccess('Failed to copy URL.');
        }
    };

    return (
        <div className='share-with-friends-div'>
            <div className='url-copied-text'>Thank you! Please share the demo with your friends:</div>
            <button className='share-with-friends-button' onClick={handleCopyClick}>Share with Friends</button>
            {copySuccess && <div className='url-copied-text'>{copySuccess}</div>}
        </div>
    );
};

export default ShareWithFriends;