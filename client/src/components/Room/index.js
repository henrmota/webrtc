import React, { useRef } from 'react';
import { useRoom } from './hook';


const Call = () => { 
    const myVideoRef = useRef();
    const otherVideoRef = useRef();
    useRoom(myVideoRef, otherVideoRef);

    return <div style={{display: 'flex', flexFlow: 'column'}}>
        <div style={{display: 'flex'}}>
            <video style={{width: '300px', objectFit: 'cover', height: '300px', backgroundColor: 'black'}} ref={myVideoRef} muted autoPlay/>
            <video style={{width: '300px', objectFit: 'cover', height: '300px', backgroundColor: 'black'}}  ref={otherVideoRef} autoPlay/>
        </div>
    </div>
} 

export default Call;
