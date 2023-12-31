import { Router } from 'express'
import { mentorRoute } from "./mentorRoute";
import { otpRoute } from "./otpRoute";
import { surveyRoute } from "./surveyRoute";
import { observationRoute } from "./observationRoute";


export const router = Router();
router.use("/mentor", mentorRoute);
router.use("/otp", otpRoute);
router.use("/survey", surveyRoute)
router.use("/observation", observationRoute)

