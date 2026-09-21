import { Router } from 'express'
import { mentorRoute } from "./mentorRoute";
import { otpRoute } from "./otpRoute";
import { observationRoute } from "./observationRoute";
import { observationSchedulerRoute } from "./observationSchedulerRoute"


export const router = Router();
router.use("/mentor", mentorRoute);
router.use("/otp", otpRoute);
router.use("/observation", observationRoute)
router.use("/scheduler/v1", observationSchedulerRoute)

