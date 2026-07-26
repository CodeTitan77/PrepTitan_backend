import { PDFParse } from "pdf-parse";
import generateInterviewReport from "../services/ai.services.js";
import interviewReportModel from "../models/interviewReport.model.js";

 
 const generateInterviewController=async (req,res)=>{
    
    const resumeContent = await (new PDFParse(Uint8Array.from(req.file.buffer))).getText();
    const { selfDescription, jobDescription } = req.body

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })
    // console.log(interViewReportByAi);
   const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeContent.text,  
    selfDescription,
    jobDescription,
    ...interViewReportByAi
})
    return res.status(201).json({
        message:"Interview report send successfully",
        interviewReport
    })

 }
 export default {generateInterviewController};
