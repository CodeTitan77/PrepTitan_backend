import app from "./src/app.js";
import dbConnect from "./src/config/database.js";
import dotenv from "dotenv";
import authRouter from './src/routes/auth.routes.js';
import generateInterviewReport from "./src/services/ai.services.js";
import interviewRouter from "./src/routes/interview.routes.js";

dotenv.config();
dbConnect();
// await interviewReportSchema();
app.use("/api/auth",authRouter);
app.use("/api/interview",interviewRouter);
app.listen(3000,()=>{
    console.log("Server running at port number 3000");
})




