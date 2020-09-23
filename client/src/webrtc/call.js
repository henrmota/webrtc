import io from 'socket.io-client';

class EventEmitter {
  callbacks = {};

  on(eventName, callback) {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }

    this.callbacks[eventName].push(callback);
  }

  emit(eventName, args) {
    return Promise.all(this.callbacks[eventName].map(callback => Promise.resolve(callback(args))));
  }

  remmoveAllListeners() { 
    this.callbacks = {}
  };
}


const config = {
    'iceServers': [
      {
        'urls': 'stun:stun.services.mozilla.com'
      },
      {
        'urls': 'stun:stun.l.google.com:19302'
      },
    ]
}

const socket = io.connect('//webrtc-app-henrmota.herokuapp.com/', {secure: true});

export default class Call extends EventEmitter {

  constructor(roomId) {
    super();

    this.setupSignalingServer();
    this.roomId = roomId;
    socket.emit('join', roomId);
  }

  addStream(stream) {
    this.isMakingOffer = false;
    this.isAwaitingAnswer = false;
    this.polite = false;

    this.peer = new RTCPeerConnection(config);
    this.peer.onnegotiationneeded = async () => {
      try {
        this.isMakingOffer = true;
        await this.peer.setLocalDescription();
        console.log(this.peer.localDescription);
        socket.emit('message', {room: this.roomId, description: this.peer.localDescription});
      }
      catch(e) {
        console.error(e)
      }
      finally{
        this.isMakingOffer = false;
      }
    }

    this.peer.onicecandidate = ({candidate}) => {
      if (!candidate) {
        return;
      }

      socket.emit('message', {room: this.roomId, candidate});
    }

    this.peer.ontrack = ({track, streams}) => {
      console.log(this.callbacks);
      this.emit('peerStream', {track, streams});
    };

    stream.getTracks().map(track => this.peer.addTrack(track, stream));
  }

  setupSignalingServer() {
    socket.on('joined', (args) => this.emit('joined', args)); 
    socket.on('polite', () => this.polite = true);
    socket.on('message', ({ description, candidate}) => {
       if (description) {
         return this.handleOfferOrAnswer(description).then()
       }

       if (candidate) {
          return this.handleCandidate(candidate).then();
       }
       
       throw new Error('unknown message');
    });
  }

  async handleOfferOrAnswer(description) {
    const isOffer = description.type === 'offer';
    const isReadyForOffer = !this.isMakingOffer && (this.peer.signalingState === 'stable' || this.isAwaitingAnswer);
    const offerCollision = isOffer && !isReadyForOffer; 
    const ignoreOffer = !this.polite && offerCollision;
    if (ignoreOffer) {
      return;
    }

    try {
      this.isAwaitingAnswer = description.type === 'answer';
      await this.peer.setRemoteDescription(description);
      this.isAwaitingAnswer = false;
    if (isOffer) {
      await this.peer.setLocalDescription();
      socket.emit('message', {room: this.roomId, description: this.peer.localDescription});
    }
    } catch(error) {
      if(!ignoreOffer) {
        throw error;
      }
    }
  }

  async handleCandidate(candidate) {
      await this.peer.addIceCandidate(candidate);
  }

  clean() {
    this.removeAllListeners();
    socket.disconnect();
  }
}
