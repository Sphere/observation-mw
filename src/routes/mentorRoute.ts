const mentorController = require("./../controllers/relationshipController");
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
  mentorRouter.getObservationForMentee
);
