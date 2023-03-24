const express=require('express');
const mongoose = require('mongoose');
const router=express.Router();
const Developer=require('../models/userInfo');

const authMiddleware = require('../middleware/auth')

const {get,post}=require('../Controllers/developer');

router.get('/',authMiddleware,(req,res)=>{
    return res.json({status:"ok"})
});

router.post('/',post);



module.exports=router;