import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import blacklistToken from "../models/blacklist.model.js";
const registerController= async(req,res)=>{
    const {username,emailId,password}=req.body;
    if(!username||(!emailId)||(!password)){
        return res.status(400).json({
            message:"Please provide username,email and password ",
        })
    }
    const isAlreadyExist= await userModel.findOne({
        emailId
    })
    if(isAlreadyExist){
         return res.status(400).json({
            message:"User already Exist ",
        })
    }
    const hash= await bcrypt.hash(password,10);
    const user= await userModel.create({
        username,
        emailId,
        password:hash
    })
    const token= jwt.sign(
        {id:user._id,username:user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    );
    res.cookie("token",token);
    return res.status(201).json({
        message:"User created successfully",
        user:{
               _id:user._id,
            username:user.username,
            emailId:user.emailId
        }
    })


}
const loginController= async(req,res)=>{
    const {emailId,password}=req.body;
    if((!emailId)||(!password)){
        return res.status(400).json({
            message:"Please provide email and password ",
        })
    }
    const user= await userModel.findOne({
        emailId,
    })
    if(!user){
         return res.status(400).json({
            message:"Incorrect Email Id or Password",
        })
    }
    const isPasswordValid= await bcrypt.compare(password,user.password);
     if(!isPasswordValid){
         return res.status(400).json({
            message:"Incorrect Email Id or Password",
        })
    }
    const token= jwt.sign(
        {id:user._id,username:user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    );
    res.cookie("token",token);
    return res.status(201).json({
        message:"User logged in successfully",
        user:{
            _id:user._id,
            username:user.username,
            emailId:user.emailId
        }
    })


}
const logoutController= async(req,res)=>{
    const token = req.cookies.token;
    if(token){
        await blacklistToken.create({
            token
        })
    }
    res.clearCookie("token");
    return res.status(200).json({
        message:"User logged out successfully",
    })


}
const getmeController= async(req,res)=>{
    const user=await userModel.findOne({
        _id:req.user.id,
    })
   return res.status(200).json({
      message:"User details fetched successfully",
       user:{
        id:user._id,
        username:user.username,
        email:user.emailId,
       }
    })
}


export default {registerController,loginController,logoutController,getmeController};