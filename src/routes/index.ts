import express from "express";
import { relationshipRoute } from "./relationshipRoute";
import { mentorRoute } from "./mentorRoute";

export const router = express.Router();

router.use("/relationship", relationshipRoute);
router.use("/mentor", mentorRoute);
