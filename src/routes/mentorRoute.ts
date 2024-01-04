import {
  getAllMenteeForMentor,
  getObservationForMentee,
  getMentorMenteeDetailsFiltered,
  mentorObservationFilteredCount
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
mentorRoute.post(
  "/getMentorMenteeDetailsFiltered",
  getMentorMenteeDetailsFiltered
);
mentorRoute.get(
  "/mentorObservationFilteredCount",
  mentorObservationFilteredCount
);