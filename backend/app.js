require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/user');

const app = express();
const server = http.createServer(app);
const connectToSocket = require("./controllers/socketManager");
const io = connectToSocket(server);




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

main()
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGO_URL);
}

app.get("/home", (req, res) =>{
    res.send("Hello ! This is home page");
});


app.use("/user", userRoutes);

server.listen(process.env.PORT || 5000, () =>{
    console.log("Server is running on port 5000");
});

