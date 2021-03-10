import React, {useState, useEffect } from 'react';
import io from 'socket.io-client';
import queryString from 'query-string';


import './Chat.css';

import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'
import Messages from '../Messages/Messages'
let socket;


const Chat = ({ location }) => {

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState(''); // track state of a single message
    const [messages, setMessages] = useState([]);// track state of all the messages
    const ENDPOINT = 'localhost:5000';
        

    useEffect(()=>{

        const { name, room } = queryString.parse(location.search);
        // returns a json and we are restructing the object to name=name and room=room
        // we also could have const data = ... and data.room or data.name
        
        socket = io(ENDPOINT);
        setName(name);
        setRoom(room);

        socket.emit('join', {name: name, room: room}, (error)=>{
            if(error) alert(error);
        }); // eventName, actual payload
       
        // this return statement is used for unmounting of the data

        return ()=> {
            socket.emit("disconnect");
            socket.off();
        } ;

    }, [ENDPOINT, location.search]);
    // basically if they changes we need to rerender the whole part



    // hooks for handling messages
    useEffect(()=> {

        socket.on('message',(message)=>{
             // admin generated messages
             setMessages([...messages, message]);
        });

    }, [messages]);

    const sendMessage = (event)=> {
        event.preventDefault();

        if(message){
            socket.emit('sendMessage', message, ()=> setMessage(''));
            // 3rd parameter is a cleanup code for textField
        }
    }

    
    return (
        <div className='outerContainer'>
            <div className='container'> 
                <InfoBar room={ room }/>
                <Messages messages={messages} name={name}/>
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                
                {/* <input 
                value={message} 
                onChange={(event)=> setMessage(event.target.value)}
                onKeyPress= {(event)=> event.key === 'Enter' ? sendMessage(event) : null}  */}
            </div>
        </div>
    )
};
export default Chat;