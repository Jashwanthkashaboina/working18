import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export const AuthContext = createContext(null);
// Creates a pre-configured axios instance
// You don’t have to repeat the base URL every time
const client = axios.create({
    baseURL: 'http://localhost:5000/user'
});
// == Instance = Axios with memory === //
// So instead of writing: axios.post('http://localhost:5000/user/signup')
// We can write : client.post('/signup')

export const AuthProvider = ({ children }) =>{
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async(email, username, password) =>{

        try{
            // these details are sent to backend and verified there
            let request = await client.post('/signup', {
                email,
                username,
                password,
            });

            if(request.status === 201) return request.data.message;
        } catch(err){
            throw (err);
        }
    }

    const handleLogin = async(username, password) =>{
        try{
            let request = await client.post('/login', {
                username,
                password,
            });

            if(request.status === 200) return request.data.message;

        } catch(err){
            throw err;
        }
    }
    const data = { userData, setUserData, handleRegister, handleLogin };
    return (
        <AuthContext.Provider value={data}>
            { children }
        </AuthContext.Provider>
    );
}