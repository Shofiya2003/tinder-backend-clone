const express = require('express');
const bodyParser = require('body-parser');
const Developer = require('./models/userInfo');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session')
const { createServer } = require('http')
const { Server } = require("socket.io")
const generateUniqueId = require('generate-unique-id');
const jwt = require('jsonwebtoken')

// Importing the api route
const api = require('./Routes/api');

const sessionStore = require('./utils/sessionStore')
const matchStore = require('./utils/matchStore')

const cors = require('cors');
require('dotenv').config()



const app = express();

app.use(bodyParser.json());

app.use(cors());

app.use(cookieSession({
    name: 'session',
    secret: 'secret',
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use('/api', api);


const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

io.use(async (socket, next) => {
    try {

        const sessionId = socket.handshake.headers.sessionid;
        const token = socket.handshake.headers.token;

        // //verify the jwt token
        // if (!token || !jwt.verify(token, process.env.JWT_SECRET)) {
        //     return next(new Error("invalid jwt token"))
        // }


        if (sessionId) {
            //find the session in the db
            const session = await sessionStore.findSession(sessionId);
            if (session) {
                socket.sessionId = session.sessionId
                socket.userId = session.userId;
                socket.username = session.username;
                return next();
            }
        }

        const userId = socket.handshake.headers.userid;
        const username = socket.handshake.headers.username;
        console.log(socket.handshake.headers)
        console.log(userId);


        if (!userId) {
            return next(new Error("invalid userId"))
        }

        //create a new session
        socket.sessionId = generateUniqueId({
            length: 12,
            useLetters: true
        });
        socket.userId = userId;
        socket.username = username;
        await sessionStore.createSession({ sessionId: socket.sessionId, userId: userId, username: username })
        next();
    } catch (err) {
        console.log(err);
        return next(new Error(err.message))
    }


})

io.on("connection", (socket) => {
    //send connection details to the client
    socket.emit("session", {
        sessionId: socket.sessionId,
        userId: socket.userId
    })

    //join room named after the userID
    socket.join(socket.userId);

    //listen for swipe right
    socket.on("swiped right", async ({ swipedUserId, swipedUsername }) => {

        const match = await matchStore.checkMatch(swipedUserId, socket.userId)
        console.log(match);
        if (match) {
            await matchStore.createMatch({ userId1: socket.userId, userId2: swipedUserId })
            socket.emit("match", {
                username: swipedUsername
            })
            socket.to(swipedUserId).emit("match", {
                username: socket.username
            })
        }

        await matchStore.createRightSwipe(socket.userId, swipedUserId);
        socket.emit("response", {
            status: "ok"
        })

    })

    //listen for swipe left
    socket.on("swiped left", async ({swipedUserId}) => {
        await matchStore.createLeftSwipe(socket.userId, swipedUserId);
        socket.emit("response", {
            status: "ok"
        })
    })

    console.log("connected")
});


mongoose.connect('mongodb://localhost:27017/findyoursimrandatabase', () => {
    console.log("connected to db");
});


const port = process.env.port || 5000;
httpServer.listen(port, () => {
    console.log("Server is running on port 5000");
})