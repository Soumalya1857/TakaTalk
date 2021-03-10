import React from 'react';
import './Message.css';

import ReactEmoji from 'react-emoji';

const Message = ({message: {user, text}, name}) => {

    let isCurrentUser = false;
    const trimedName = name.trim().toLowerCase();

    if(user === trimedName) {
        isCurrentUser = true;
    }

    return(
        isCurrentUser ? (
            // sent by current user
            <div className="messageContainer justifyEnd"> 
                <p className='sentText pr-10'>{trimedName}</p>
                <div className='messageBox backgroundBlue'>
                    <p className='messageText colorWhite'>{ReactEmoji.emojify(text)}</p>
                </div>
            </div>
        )
        : (
            // not sent by current user
            <div className="messageContainer justifyStart"> 
                <div className='messageBox backgroundLight'>
                    <p className='messageText colorDark'>{ReactEmoji.emojify(text)}</p>
                </div>
                <p className='sentText pl-10'>{user}</p>
            </div>
        )
    )
};


export default Message;