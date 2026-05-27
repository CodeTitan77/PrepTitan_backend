import jwt from "jsonwebtoken";
import blacklistToken from "../models/blacklist.model.js";
async function authUser(req,res,next){
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"Token not provided",
        })
    }
    const blackListed= await blacklistToken.findOne({
        token,
    })
    if(blackListed){
         return res.status(401).json({
            message:"Invalid Token",
        })
    }
    try{
      const decoded= jwt.verify(token,process.env.JWT_SECRET);
      req.user=decoded;
      next();

    }
    catch(error){
         return res.status(401).json({
            message:"Invalid Token",
        })
    }
  
}
export default {authUser};


