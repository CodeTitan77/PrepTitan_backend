import mongoose from "mongoose";
async function dbConnect() {
    try{
    await mongoose.connect(process.env.MONGOURL)
    console.log("Connected to database");
    }
    catch(error){
        console.log(error);
    }
}
export default dbConnect;


