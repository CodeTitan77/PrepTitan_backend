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
 async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}
 export default {generateInterviewController,getInterviewReportByIdController,getAllInterviewReportsController};
