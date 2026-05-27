import mongoose from "mongoose";
const blacklistSchema= new mongoose.Schema({
    token:{
        type:String,
        unique:true,
    }
},
    {
        timestamps:true,
    }
);
const blacklistToken=  mongoose.model("blacklistToken",blacklistSchema);
export default blacklistToken;