import React from 'react';
import { v4 as uiid } from 'uuid';
import { Link } from "react-router-dom";

const JoinRoom = () => {
    return <Link to={`/${uiid()}`}>Join Room</Link>    
} 

export default JoinRoom;
