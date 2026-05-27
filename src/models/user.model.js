import mongoose  from "mongoose";
const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    emailId:{
        type:String,
        unique:[true,"EmailId already taken"],
        required:true,

    },
     password:{
        type:String,
        required:true,
    },

});
const userModel=mongoose.model("User",userSchema);
export default userModel;
