const jwt = require("jsonwebtoken")
const authMiddleware = async (req,res,next)=>{
    try{
        //if the session does not have the token or the userid delete it 
        if(!req.session.isPopulated || !req?.session?.token || !req?.session?.userid ){
            req.session = null
            return res.json({status:"error",msg:"user not loggedin"})
        }
        
        const {token,userid} = req.session
        if(!jwt.verify(token,process.env.JWT_SECRET)){
            req.session = null;
            return res.json({status:"error",msg:"invalid token"})
        }

        req.userid = userid
        next();
        
    }catch(err){
        console.log(err)
        return res.json({status:"error"})
    }
}

module.exports=authMiddleware