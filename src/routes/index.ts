import { Router } from 'express'
import { relationshipRoute } from "./relationshipRoute";
import { mentorRoute } from "./mentorRoute";

export const router = Router();

router.use("/relationship", relationshipRoute);
router.use("/mentor", mentorRoute);

