const mentorController = require("./../controllers/mentorController");
import { Router } from 'express'
export const mentorRoute = Router();
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
