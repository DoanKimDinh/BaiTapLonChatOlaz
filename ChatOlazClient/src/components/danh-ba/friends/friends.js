import React from 'react';

import './Friends.scss';

const Friends = ({ selectedConversation }) => {
    let chatTitleContents = null;

    if (selectedConversation) {
        chatTitleContents = (
            <>
                <span><img src={ selectedConversation.image } /> { selectedConversation.ten }</span>
            </>
        );
    }

    return (
        <div id="chat-title">
            { chatTitleContents }
        </div>
    );
}

export default Friends;