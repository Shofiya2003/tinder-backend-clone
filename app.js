const express = require('express');
const bodyParser=require('body-parser');
const Developer=require('./models/userInfo');
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();
const JWT_SECRET="jfksnkg sakgknsdhkjfk9400i4994utkjg"
const sessions=require('express-session');
const cookieParser=require('cookie-parser');
const jwt=require('jsonwebtoken');
const GoogleStrategy=require('passport-google-oauth20');
const findOrCreate=require('mongoose-findorcreate');



const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)


require('dotenv').config()

app.use(cors());
app.use(sessions({
    secret:'this is secret key',
    saveUninitialized:true,
    cookie:{maxAge:60*60},
    resave:false
}));

const User=require('./models/user');









mongoose.connect('mongodb://localhost:27017/findyoursimrandatabase',()=>{
    console.log("connected to db");
});


app.use(bodyParser.json());
// Importing the api route
const api=require('./Routes/api');


app.use('/api',api);

app.post('/save',async (req,res)=>{
    const {content}=req.body;
    try{
        await Developer.updateOne({_id:"6207e2b55d3ef4000cfb6f65"},{
            $set:{
                bio:content
            }
        });

        res.status(200).json({message:"successfully saved"})
    }catch(err){
        res.status(500).json({message:err});
    }

})

const port=process.env.port || 5000;
app.listen(port,()=>{
    console.log("Server is running on port 5000");
})