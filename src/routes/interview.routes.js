import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import interviewController from "../controllers/interview.controller.js";
const Router=express.Router;
const interviewRouter=Router();
interviewRouter.post("/",authMiddleware.authUser,interviewController.generateInterviewController)


export default interviewRouter;