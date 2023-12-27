import { getobservationDetails, verifyobservationLink, observationOtpVerification, addEntityToObservation, submitObservation, getObservationSubmissionResult } from "./../controllers/observationController"
import { Router } from 'express'
export const observationRoute = Router();
observationRoute.post(
    "/getobservationDetails",
    getobservationDetails
);
observationRoute.post(
    "/verifyobservationLink",
    verifyobservationLink
);
observationRoute.post(
    "/observationOtpVerification",
    observationOtpVerification
);
observationRoute.post(
    "/addEntityToObservation",
    addEntityToObservation
);
observationRoute.post(
    "/submitObservation",
    submitObservation
);
observationRoute.post(
    "/getObservationSubmissionResult",
    getObservationSubmissionResult
);