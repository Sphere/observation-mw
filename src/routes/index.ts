import { Router } from 'express'
import { relationshipRoute } from "./relationshipRoute";
import { mentorRoute } from "./mentorRoute";
import { otpRoute } from "./otpRoute";
import { surveyRoute } from "./surveyRoute";


export const router = Router();
router.use("/relationship", relationshipRoute);
router.use("/mentor", mentorRoute);
router.use("/otp", otpRoute);
router.use("/survey", surveyRoute)

