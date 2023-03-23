const express = require('express');
const bodyParser = require('body-parser');
const Developer = require('./models/userInfo');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session')
const {createServer} = require('http')
// Importing the api route
const api = require('./Routes/api');

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





mongoose.connect('mongodb://localhost:27017/findyoursimrandatabase', () => {
    console.log("connected to db");
});




const port = process.env.port || 5000;
app.listen(port, () => {
    console.log("Server is running on port 5000");
})