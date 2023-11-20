const mentorController = require("./../controllers/relationshipController");
import express from "express";
export const mentorRoute = express.Router();
mentorRoute.get(
  "/getAllMenteeForMentor",
  mentorController.getAllMenteeForMentor
);
mentorRoute.get(
  "/getAllMentorForMentee",
  mentorController.getAllMentorForMentee
);

mentorRoute.get(
  "/getObservationForMentee",
  mentorController.getObservationForMentee
);
