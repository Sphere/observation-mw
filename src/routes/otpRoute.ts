const express = require("express");
const otpController = require("./../controllers/otpController")
export const otpRoute = express.router();
otpRoute.get("sendOtp", otpController.sendOtp);
otpRoute.get("verifyOtp", otpController.verifyOtp)
otpRoute.get("resendOtp", otpController.resendOtp)
