import { useEffect, useRef } from 'react';
import Call from '../../webrtc/call';
import { useParams } from "react-router-dom";

const constraints = { video: true, audio: true };

export const useRoom = (myVideoRef, otherVideoRef) => {
    const { roomId } = useParams();
    const callRef = useRef();

    useEffect(() => {
        callRef.current = new Call(roomId);
        callRef.current.on('joined', async() => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                myVideoRef.current.srcObject = stream;
                callRef.current.addStream(stream);
              } catch(err) {
                  console.error(err)
              }
        });

        callRef.current.on('peerStream', ({track, streams}) => {
            // once media for a remote track arrives, show it in the remote video element
            track.onunmute = () => {
                otherVideoRef.current.srcObject = streams[0];
            };
        });

        return () => callRef.current.clean();
    }, [roomId, myVideoRef, otherVideoRef]);
    
}
