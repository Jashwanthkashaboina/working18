const User = require('../models/user.js');
const bcrypt = require('bcrypt');


module.exports.signup = async(req, res)=>{
    const { email, username, password } = req.body;
    // const registeredUser
    
    try{
        const existingUser = await User.findOne({ username });
        if(existingUser){
            return res.status(409).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, username, password: hashedPassword });
        // console.log(newUser);

        await newUser.save();

        res.status(201).json({message : "User Registered Successfully"});

    } catch(err){
        res.status(500).json({ message: `Someting went wrong ${err}`});
        console.log(err);
    }
} 

module.exports.login = async(req, res) =>{
    const { username, password } = req.body;
    if(!username || !password){
        return res.status(400).json({message: "Bad Request"});
    }
    try{
        const user = await User.findOne({ username });
        if(!user){
            return res.status(404).json({ message: "User Not Found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
           return res.status(401).json({ message: "Invalid Credentials" });
        }
        // For now, just return success. Later you can generate JWT
        return res.status(201).json({ message: "Login Successful !" });

    } catch(err){
        console.error(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
}