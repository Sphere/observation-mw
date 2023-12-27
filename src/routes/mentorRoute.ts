import {
  getAllMenteeForMentor,
  getObservationForMentee
} from "./../controllers/mentorController"
import { Router } from 'express'
export const mentorRoute = Router();
mentorRoute.get(
  "/getAllMenteeForMentor",
  getAllMenteeForMentor
);

mentorRoute.get(
  "/getObservationForMentee",
  getObservationForMentee
);
