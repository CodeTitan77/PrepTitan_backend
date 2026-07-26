import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import interviewController from "../controllers/interview.controller.js";
import upload from "../middlewares/file.middleware.js";
const Router=express.Router;
const interviewRouter=Router();
interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewController)

export default interviewRouter;