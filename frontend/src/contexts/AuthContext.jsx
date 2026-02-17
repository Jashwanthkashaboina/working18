import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import server from "../../environment";

export const AuthContext = createContext(null);
// Creates a pre-configured axios instance
// You don’t have to repeat the base URL every time
const client = axios.create({
    baseURL: server
});
// == Instance = Axios with memory === //
// So instead of writing: axios.post('http://localhost:5000/user/signup')
// We can write : client.post('/signup')

export const AuthProvider = ({ children }) =>{
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() =>{
        const token = localStorage.getItem('token');
        const activeMeeting = localStorage.getItem('activeMeeting');

        if(token && activeMeeting){
            navigate(activeMeeting);
        }
    }, []);

    const handleRegister = async(email, username, password) =>{

        try{
            // these details are sent to backend and verified there
            let request = await client.post('/user/signup', {
                email,
                username,
                password,
            });

            if(request.status === 201) return request.data.message;
        } catch(err){
            throw (err);
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/user/login", {
            username,
            password,
            });

            if (request.status === 200) {
                localStorage.setItem("token", request.data.token); // SAVE TOKEN
                return "Login successful";
            }
        } catch (err) {
            throw err;
        }
    };


    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/user/get_all_activity", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/user/add_to_activity", 
                { meeting_code: meetingCode },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                }

            );
            return request
        } catch (e) {
            throw e;
        }
    }


    const data = { userData, setUserData, handleRegister, handleLogin, getHistoryOfUser, addToUserHistory };
    return (
        <AuthContext.Provider value={data}>
            { children }
        </AuthContext.Provider>
    );
}