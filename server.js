import app from "./src/app.js";
import dbConnect from "./src/config/database.js";
import dotenv from "dotenv";
import authRouter from './src/routes/auth.routes.js';
dotenv.config();
dbConnect();
app.use("/api/auth",authRouter);
app.listen(3000,()=>{
    console.log("Server running at port number 3000");
})




