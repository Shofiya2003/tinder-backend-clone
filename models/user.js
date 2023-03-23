const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');
const findOrCreate=require('mongoose-findorcreate');
const UserSchema=new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String}
},{collection:'users'});
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);
const user=mongoose.model('user',UserSchema);

module.exports=user;

