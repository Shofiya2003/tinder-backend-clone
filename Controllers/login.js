
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const { session } = require('passport');
const User=require('../models/user');




const JWT_SECRET="jfksnkg sakgknsdhkjfk9400i4994utkjg"
const post=async (req,res)=>{
    
    const {username,password}=req.body;
    console.log(password);
    const user=await User.findOne({username}).lean();
    if(!user){
        res.json({status:'error',error:'Invalid username or password'});
    }
    
    if(await bcrypt.compare(password,user.password)){
        const session=req.session;
        session.userid=username;
        console.log(req.session);
        // Password,username combination is successful
        const token=jwt.sign({
            id:user._id,
            username:user.username
        },JWT_SECRET)
        console.log(user);
        console.log(req.session);
        req.session.userid=user._id;
        res.json({status:'ok',data:user._id,token:token,session:req.session});
    }
    else 
        res.json({status:'error',error:'Invalid username or password'});
}

module.exports={post};