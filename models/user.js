const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String}
},{collection:'users'});

const user=mongoose.model('user',UserSchema);

module.exports=user;

