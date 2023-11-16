const express = require("express");
const relationshipController = require("./../controllers/relationshipController");
const mentorRouter = express.Router();
mentorRouter.get("/getAllMenteeForMentor", mentorRouter.getAllMenteeForMentor);
mentorRouter.get("/getAllMentorForMentee", mentorRouter.getAllMentorForMentee);

mentorRouter.get(
  "/getObservationForMentee",
  mentorRouter.getObservationForMentee
);
module.exports = mentorRouter;
