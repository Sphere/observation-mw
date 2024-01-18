import { getobservationDetails, verifyobservationLink, observationOtpVerification, addEntityToObservation, submitObservation, getObservationSubmissionResult, updateSubmissionandCompetency, menteeConsolidatedObservationAttempts } from "./../controllers/observationController"
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
observationRoute.post("/updateSubmissionandCompetency", updateSubmissionandCompetency)
observationRoute.post("/menteeConsolidatedObservationAttempts", menteeConsolidatedObservationAttempts)