
import express from "express";
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const Router=express.Router;
const authRouter=Router();
authRouter.post("/register",authController.registerController);
authRouter.post("/login",authController.loginController);
authRouter.get("/logout",authController.logoutController);
authRouter.get("/get-me",authMiddleware.authUser,authController.getmeController);


export default authRouter;

