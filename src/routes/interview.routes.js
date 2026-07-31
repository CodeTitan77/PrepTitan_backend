import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import interviewController from "../controllers/interview.controller.js";
import upload from "../middlewares/file.middleware.js";
const Router=express.Router;
const interviewRouter=Router();
interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewController)
interviewRouter.get("/:interviewReportId/resume-pdf", authMiddleware.authUser, interviewController.generateResumePdfController)
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)
interviewRouter.get("/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)
export default interviewRouter;