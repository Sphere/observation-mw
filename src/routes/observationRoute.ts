import { getobservationDetails, verifyobservationLink, observationOtpVerification, addEntityToObservation, submitObservation, getObservationSubmissionResult, updateSubmissionandCompetency, menteeConsolidatedObservationAttempts, getSolutionsList, getMentorAssignedSolutionsList, menteeConsolidatedObservationAttemptsV2 } from "./../controllers/observationController"
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
observationRoute.get("/menteeConsolidatedObservationAttempts", menteeConsolidatedObservationAttempts)
observationRoute.get("/getSolutionsList", getSolutionsList)
observationRoute.get("/getMentorAssignedSolutionsList", getMentorAssignedSolutionsList)
observationRoute.get("/menteeConsolidatedObservationAttemptsV2", menteeConsolidatedObservationAttemptsV2)