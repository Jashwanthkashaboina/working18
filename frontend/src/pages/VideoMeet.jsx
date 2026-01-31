import { useEffect, useRef, useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { io } from "socket.io-client";
import '../videoMeet.css';

const server_url = 'http://localhost:5000';

const peerConfigConnections = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};


// *** VIDEO PLAYER *** //
const VideoPlayer = ({ stream }) =>{
    const ref = useRef(null);

    useEffect(() =>{
        if(ref.current){
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return(
        <video 
            ref={ref}
            autoPlay
            playsInline
            style={{ width: '300px', margin: '10px', borderRadius: '8px' }}
        />    
    )

}

export default function VideoMeet() {
    // Socket related refs (do NOT cause re-render)
    const socketRef = useRef(null);
    const socketIdRef = useRef(null);

    // Local video DOM reference
    const localVideoRef = useRef(null);

    // (what browser allows)
    const [videoAvailable, setVideoAvailable] = useState(false);
    const [audioAvailable, setAudioAvailable] = useState(false);

    // (what user chooses)
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);

    // Screen / UI states
    const [screenShare, setScreenShare] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);

    // Chat states
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [newMessages, setNewMessages] = useState(0);

    // Lobby / username
    const [askUserName, setAskUserName] = useState(true);
    const [userName, setUserName] = useState('');

    // Remote videos
    const videoRef = useRef([]);
    const [videos, setVideos] = useState([]);

    // Local media stream
    const [localStream, setLocalStream] = useState(null);

    // WebRTC peer connections
    const connections = useRef({});

    // (camera + mic)
    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            setLocalStream(stream);

            const hasVideo = stream.getVideoTracks().length > 0;
            const hasAudio = stream.getAudioTracks().length > 0;

            setVideoAvailable(hasVideo);
            setAudioAvailable(hasAudio);

            // Enable tracks by default
            setVideoEnabled(hasVideo);
            setAudioEnabled(hasAudio);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Check screen share support
            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

        } catch (err) {
            console.error("Media permission error:", err);
            setVideoAvailable(false);
            setAudioAvailable(false);
        }
    };

    // Get permissions on mount & cleanup on unmount
    useEffect(() => {
        getPermissions();
        return () => {
            if (localVideoRef.current?.srcObject) {
                localVideoRef.current.srcObject
                    .getTracks()
                    .forEach(track => track.stop());
            }
        };
    }, []);

    // Toggle video/audio tracks when state changes
    useEffect(() => {
        if (!localStream) return;

        localStream.getVideoTracks().forEach(track => {
            track.enabled = videoEnabled;
        });

        localStream.getAudioTracks().forEach(track => {
            track.enabled = audioEnabled;
        });
    }, [videoEnabled, audioEnabled, localStream]);


    // TODO : gotMessageFromServer (WebRTC signaling)
    // **** SIGNALLING ****//
    let gotMessageFromServer = async (fromId, message) => {
        const signal = JSON.parse(message);

        // Create connection if it doesn't exist
        if (!connections.current[fromId]) {
            const pc = new RTCPeerConnection(peerConfigConnections);
            connections.current[fromId] = pc;

            // ICE candidates
            pc.onicecandidate = event => {
                if (event.candidate) {
                    socketRef.current.emit(
                        'signal',
                        {
                            to: fromId,              // FIX
                            signal: { ice: event.candidate } // FIX
                        }
                    );
                }
            };

            // Remote stream
            pc.ontrack = event => {
                const stream = event.streams[0];
                setVideos(prev => {
                    const exists = prev.find(v => v.socketId === fromId);
                    if (exists) return prev;
                    return [...prev, { socketId: fromId, stream }];
                });
            };

            // Add local tracks
            if (localStream) { 
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream);
                });
            }
        }

        const pc = connections.current[fromId];

        // Handle SDP
        if (signal.sdp) {
            await pc.setRemoteDescription(
                new RTCSessionDescription(signal.sdp)
            );

            // If offer, create answer
            if (signal.sdp.type === 'offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socketRef.current.emit(
                    'signal',
                    {
                        to: fromId,              // FIX
                        signal: { sdp: pc.localDescription } // FIX
                    }
                );
            }
        }

        // Handle ICE
        if (signal.ice) {
            try {
                await pc.addIceCandidate(
                    new RTCIceCandidate(signal.ice)
                );
            } catch (err) {
                console.error('ICE error', err);
            }
        }
    };

    // TODO : addMessage (chat messages)
    let addMessage = (data) => {
        setMessages(prev => [...prev, data]);
        setNewMessages(prev => prev + 1);
    };

    // Connect to socket server
    let connectToSocketServer = () => {
        socketRef.current = io(server_url);

        socketRef.current.on(
            'signal',
            ({ from, signal }) => {          // FIX
                gotMessageFromServer(from, JSON.stringify(signal)); // FIX
            }
        );

        socketRef.current.on('connect', () => {
            console.log('Connected to:', socketRef.current.id);

            socketIdRef.current = socketRef.current.id;

            // Join meeting room
            socketRef.current.emit('join-room', window.location.href);

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on('user-left', (id) => {
                setVideos(videos =>
                    videos.filter(video => video.socketId !== id)
                );

                if (connections.current[id]) {
                    connections.current[id].close();
                    delete connections.current[id];
                }
            });

            socketRef.current.on('user-joined', async (id, clients) => {
                for (const socketListId of clients) {
                    // Avoid connecting to self
                    if (socketListId === socketIdRef.current) continue;

                    if (!connections.current[socketListId]) {
                        const pc = new RTCPeerConnection(peerConfigConnections);
                        connections.current[socketListId] = pc;

                        // Send ICE candidates
                        pc.onicecandidate = event => {
                            if (event.candidate) {
                                socketRef.current.emit(
                                    'signal',
                                    {
                                        to: socketListId,              // FIX
                                        signal: { ice: event.candidate } // FIX
                                    }
                                );
                            }
                        };

                        // Receive remote stream
                        pc.ontrack = event => {
                            const stream = event.streams[0];

                            setVideos(prev => {
                                const exists = prev.find(v => v.socketId === socketListId);
                                if (exists) return prev;

                                return [...prev, {
                                        socketId: socketListId,
                                        stream
                                    }
                                ];
                            });
                        };

                        if (localStream) {
                            localStream.getTracks().forEach(track => {
                                pc.addTrack(track, localStream);
                            });
                        }

                        // *** OFFER CREATION *** //
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);

                        socketRef.current.emit('signal', {
                            to: socketListId,
                            signal: { sdp : pc.localDescription }
                        })
                    }
                };
            });
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from Server');
        });
    };

    // *** CLEAN-UP *** //
    const cleanup = () => {
        // 1. Stop local media
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        // 2. Close all peer connections
        Object.values(connections.current).forEach(pc => {
            pc.close();
        });
        connections.current = {};

        // 3. Clear remote videos
        setVideos([]);

        // 4. Disconnect socket
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };

    // *** CLEAN *** //
    useEffect(() => {
        const handleUnload = () => {
            cleanup();
        };

        window.addEventListener("beforeunload", handleUnload);

        return () => {
            handleUnload();
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [localStream]);
    
    // Initialize media + socket
    const getMedia = () => {
        setVideoEnabled(videoAvailable);
        setAudioEnabled(audioAvailable);
        connectToSocketServer();
        setAskUserName(false);
    };

    return (
        <div>
            {askUserName && (
                <div>
                    <h2>Enter into Lobby</h2>

                    <TextField
                        id='outlined-basic'
                        label='Username'
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        variant='outlined'
                    />

                    <Button
                        variant="contained"
                        onClick={getMedia}
                        style={{ marginLeft: '10px' }}
                    >
                        Connect
                    </Button>

                    <div>
                        <video
                            ref={localVideoRef}
                            muted
                            autoPlay
                            playsInline
                            style={{ width: '300px', marginTop: '10px' }}
                        />
                    </div>
                </div>
            )}

            {!askUserName && (
                <div>
                    <h3>Meeting Room</h3>

                    {/* Local video */}
                    <video
                        ref={localVideoRef}
                        muted
                        autoPlay
                        playsInline
                        style={{ width: '300px', margin: '10px', borderRadius: '8px' }}
                    />

                    {/* Remote videos */}
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {videos.map(video => (
                            <VideoPlayer
                                key={video.socketId}
                                stream={video.stream}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

}
