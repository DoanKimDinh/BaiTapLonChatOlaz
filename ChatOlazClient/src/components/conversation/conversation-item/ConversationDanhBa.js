import React from 'react';
import classNames from 'classnames';

import './ConversationDanhBa.scss';

const ConversationDanhBa = ({ conversation, isActive, onConversationItemSelected }) => {
    const className = classNames('conversationDanhBa', {
        'active': isActive
    });

    return (
        <div className={className} onClick={() => onConversationItemSelected(conversation.id)}>
            <img src={conversation.image} />
            <div className="title-text">{conversation.ten}</div>
        </div>
    );
}

export default ConversationDanhBa;