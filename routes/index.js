import express from "express";
import relationshipRoute from "./relationshipRoute";
const router = express.router();

router.use("/relationship", relationshipRoute);
router.use("/mentor", mentorRoute);
