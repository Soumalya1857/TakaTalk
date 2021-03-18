import React, {useState, useEffect } from 'react';
import io from 'socket.io-client';
import queryString from 'query-string';


import './Chat.css';

import InfoBar          from '../InfoBar/InfoBar'
import Input            from '../Input/Input'
import Messages         from '../Messages/Messages'
import RoomUserList     from '../RoomUserList/RoomUserList'
import RoomInputField   from '../RoomInputField/RoomInputField'
import RoomList         from '../RoomList/RoomList'
let socket;


const Chat = ({ location }) => {

    const [name, setName] = useState('');
    const [room, setRoom] = useState('broadcast');
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState(''); // track state of a single message
    const [messages, setMessages] = useState([]);// track state of all the messages
    const ENDPOINT = 'localhost:5000';



    const [roomName, setRoomName] = useState(''); // roomName to be send to server
    const [allRooms, setAllRooms] = useState(['r/broadcast'])
    const [type, setType] = useState('r') // type can be r or u
        

    useEffect(()=>{

        const { name, room } = queryString.parse(location.search);
        // returns a json and we are restructing the object to name=name and room=room
        // we also could have const data = ... and data.room or data.name
        
        socket = io(ENDPOINT);
        setName(name);

        if(type === 'r'){
            socket.emit('join', {name: name, room: room}, (error)=>{
                if(error) alert(error);
            }); // eventName, actual payload
        }

        if(type === 'u')
        {
            socket.emit('join_private_chat', {otherPersonName: room}, (error)=> {
                if(error) 
                    alert(error)
            })
        }
        
       
        // this return statement is used for unmounting of the data

        // return ()=> {
        //     socket.emit("disconnect");
        //     socket.off();
        // } ;

    }, [ENDPOINT, location.search, room]);
    // basically if they changes we need to rerender the whole part



    // hooks for handling messages
    useEffect(()=> {

        socket.on('message',(message)=>{
             // admin generated messages
             setMessages(messages => [...messages, message]);
        });

        socket.on("roomData", ({room: room, users: users }) => {
            setUsers(users);
        });

        socket.on("private_message", (message)=> {
            setMessages(messages => [...messages, message]);
            setUsers('')
        })

    }, []);

    const sendMessage = (event)=> {
        event.preventDefault();

        if(message){
            socket.emit('sendMessage',{ room:room, message: message}, ()=> setMessage(''));
            // 3rd parameter is a cleanup code for textField
        }
    }

    const addRoom = (event)=>{
        event.preventDefault();
        if(roomName && roomName.startsWith('r/'))
        {
            //socket.emit('join',{name: name , room: roomName.substring(2)})
            

            setAllRooms(allRooms => [...allRooms, roomName])
            setType('r')
            setRoom(roomName.substring(2))
            setRoomName("") // hopefully does the cleanup
            console.log(allRooms)
        }

        else if(roomName && roomName.startsWith('u/'))
        {
            //socket.emit('join private chat', {otherPersonName: roomName.substring(2)})
            setAllRooms(allRooms => [...allRooms, roomName])
            setType('u')
            setRoom(roomName.substring(2))
            setRoomName("") // hopefully does the cleanup
        }
        else
        {
            setRoomName("")
            alert("Invalid name!!!")
        }
        console.log("hello!")
    }
    
    return (
        <div className='outerContainer'>
            <div className='roomsOfAUser'>
                <RoomInputField room= {roomName} setRoom ={setRoomName} addRoom={addRoom}/>
                <RoomList allRooms={allRooms} addRoom={addRoom}/> 
            </div>
            <div className='container'> 
                <InfoBar room={ room }/>
                <Messages messages={messages} name={name}/>
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
                
                {/* <input 
                value={message} 
                onChange={(event)=> setMessage(event.target.value)}
                onKeyPress= {(event)=> event.key === 'Enter' ? sendMessage(event) : null}  */}
            </div>
            <RoomUserList users={users}/>
        </div>
    )
};
export default Chat;