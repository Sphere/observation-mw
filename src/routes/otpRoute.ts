import express from "express";
import { sendOtp, verifyOtp, resendOtp } from "./../controllers/otpController"
export const otpRoute = express.Router();
otpRoute.get("/sendOtp", sendOtp);
otpRoute.get("/verifyOtp", verifyOtp)
otpRoute.get("/resendOtp", resendOtp)
