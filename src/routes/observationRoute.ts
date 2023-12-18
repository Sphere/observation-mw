const observationController = require("./../controllers/observationController");
import { Router } from 'express'
export const observationRoute = Router();
observationRoute.get(
    "/getobservationDetails",
    observationController.getobservationDetails
);
observationRoute.post(
    "/verifyobservationLink",
    observationController.verifyobservationLink
);
observationRoute.post(
    "/observationOtpVerification",
    observationController.observationOtpVerification
);
observationRoute.post(
    "/addEntityToObservation",
    observationController.addEntityToObservation
);