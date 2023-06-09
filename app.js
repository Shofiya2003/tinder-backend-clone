const express = require('express');
const bodyParser = require('body-parser');
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
const messageStore = require('./utils/messageStore')
const User = require('./models/user')
const userStore = require('./utils/userStore')

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

io.on("connection", async (socket) => {
    //send connection details to the client
    socket.emit("session", {
        sessionId: socket.sessionId,
        userId: socket.userId
    })

    //join room named after the userID
    socket.join(`room-${socket.userId}`);
    console.log(socket.userId + " joined the room")

    //update status of user
    userStore.updateUser(socket.userId, { online: true });

    //get matches not notified
    const { lastActive } = await User.findOne({ _id: socket.userId }, { lastActive: 1 });
    console.log(lastActive)
    const unotifiedMatches = await matchStore.getMatchesNotNotified(socket.userId, lastActive);
    console.log(unotifiedMatches)
    if (unotifiedMatches) {

        unotifiedMatches.forEach(async match => {
            let { userId1, userId2 } = match;
            userId1 = userId1.toString();
            userId2 = userId2.toString();
            const otherUser = socket.userId.equals(userId1) ? userId2 : userId1;
            const { username } = await User.findOne({ _id: otherUser }, { username: 1 });
            socket.emit("match", {
                username: username,
                userId: otherUser
            })
        })
    }

    const users = await getUserMessages(socket.userId, socket);

    if (await userStore.checkStatus(socket.userId)) {

        socket.emit("chats", users)
        users.map(user => {
            const userId = user.userId;
            const messages = user.messages;
            messages.map(async message => {
                if (message.from.equals(userId) && !message.delivered) {

                }
            })
        })
    }



    //listen for swipe right
    socket.on("swiped right", async ({ swipedUserId, swipedUsername }) => {

        const match = await matchStore.checkMatch(swipedUserId, socket.userId)
        console.log(match);
        if (match) {
            await matchStore.createMatch({ userId1: socket.userId, userId2: swipedUserId })
            socket.to(`room-${swipedUserId}`).emit("match", {
                username: socket.username
            })
            socket.emit("match", {
                username: swipedUsername
            })

        }

        await matchStore.createRightSwipe(socket.userId, swipedUserId);
        socket.emit("response", {
            status: "ok"
        })

    })

    //listen for swipe left
    socket.on("swiped left", async ({ swipedUserId }) => {
        await matchStore.createLeftSwipe(socket.userId, swipedUserId);
        socket.emit("response", {
            status: "ok"
        })
    })

    socket.on("private message", async ({ content, to }) => {

        //check match
        //log the message in the database
        const newMessage = await messageStore.createMessage(socket.userId, to, content)

        //check if other user is online
        if (await userStore.checkStatus(to)) {
            let deliveredMessage = newMessage;

            socket.to(`room-${to}`).emit("private message", { ...deliveredMessage["_doc"], delivered: true }, async (err, response) => {
                console.log(response);
                //if the client sends ack, send delivered event to the socket that sent the message
                if (response) {
                    await messageStore.markAsDelivered(newMessage._id);
                    socket.emit("delivered", { messageId: newMessage._id });
                } else {
                    console.log(err);
                }
            })
        } else {
            console.log("User is not online")
        }

        //emit private message event for the user's socket
        socket.emit("private message", newMessage)

    })

    socket.on("mark as read", async ({ from }) => {
        await messageStore.markAsRead(from, socket.userId)
        socket.to(`room-${from}`).emit("read", { userId: socket.userId })
    })

    socket.on("disconnect", async (reason) => {

        const now = new Date().toISOString();
        console.log(socket.username + " disconnected");
        await userStore.updateUser(socket.userId, { lastActive: now, online: false })
        console.log(`socket disconnected due to ${reason}`)
    })

    console.log("connected")
});


mongoose.connect('mongodb://localhost:27017/findyoursimrandatabase', () => {
    console.log("connected to db");
});

const getUserMessages = async (userId, socket) => {
    const users = [];
    const messagesPerUser = new Map();
    const messages = await messageStore.getAllUserMessages(userId)

    messages.forEach(async (message) => {
        let { to, from } = message;

        to = to.toString();
        from = from.toString();

        const otherUser = userId.equals(from) ? to : from;

        // inform the other user that message has been delivered and mark the message delivered in the database
        if (userId.equals(to) && !message.delivered) {
            console.log(message, "message deliverd");
            socket.to(`room-${otherUser}`).emit("delivered", { messageId: message._id });
            await messageStore.markAsDelivered(message._id)
            message.delivered = true;
        }

        if (messagesPerUser.has(otherUser)) {
            messagesPerUser.get(otherUser).push(message);
        } else {
            messagesPerUser.set(otherUser, [message]);
        }
    })

    const matches = await matchStore.getMatches(userId);

    await Promise.all(matches.map(async match => {
        let { userId1, userId2 } = match;
        userId1 = userId1.toString();
        userId2 = userId2.toString();
        const otherUser = userId.equals(userId1) ? userId2 : userId1;

        const { username } = await User.findOne({ _id: otherUser }, { username: 1 });

        users.push({
            userId: otherUser,
            username: username,
            messages: messagesPerUser.get(otherUser) || [],
        })

    }))

    console.log(users);
    return users;

}

const port = process.env.port || 5000;
httpServer.listen(port, () => {
    console.log("Server is running on port 5000");
})