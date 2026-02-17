import React, { useContext, useState } from 'react'
import withAuth from '../utils/WithAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, Box, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import toast from "react-hot-toast";
import LogoutIcon from '@mui/icons-material/Logout';
function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            toast.error("Please enter a meeting code");
            return;
        }

        try {
            await addToUserHistory(meetingCode);
            toast.success("Joined successfully!");
            navigate(`/meet/${meetingCode}`);
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <>
            <div className="navBar">
                <h2 
                    onClick={() => navigate('/')} 
                    style={{cursor: 'pointer'}}
                >
                    Meet Nest
                </h2>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    
                    <div
                        onClick={() => navigate("/history")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            gap: "4px",
                            marginTop: '10px',
                        }}
                    >
                    {/* <RestoreIcon 
                        sx={{
                            '&:hover': {
                                color: '#1976d2',
                            }
                        }}

                    
                    />
                    <span>History</span> */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover .hoverItem': {
                            color: '#1976d2',
                            },
                        }}
                        >
                        <RestoreIcon className="hoverItem" />
                        <span 
                            className="hoverItem"
                            style={{paddingLeft: '5px'}}
                        >
                            History
                        </span>
                    </Box>

                    </div>

                    <Button
                        startIcon={<LogoutIcon />}
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                        variant="outlined"
                        color="error"
                        sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 500,
                            mt: '10px'
                        }}
                    >
                      Logout 
                    </Button>

                </div>
            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div className='meeting-input'>
                        <h2>Providing Quality Video</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>

                            <TextField 
                                autoFocus
                                onChange={e => setMeetingCode(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleJoinVideoCall()}
                                id="outlined-basic" label="Meeting Code" 
                                variant="outlined" 
                                sx={{mt: '5px'}}
                            />
                            <Button 
                                
                                onClick={handleJoinVideoCall} 
                                variant='contained'
                                sx={{
                                    height: 45,
                                    paddingInline: 3,
                                    fontSize: '1rem',
                                    borderRadius: '12px',
                                    mt: '10px', ml: '5px'
                                }}
                                
                            >
                                Join
                            </Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        </>
    )
}


export default withAuth(HomeComponent);