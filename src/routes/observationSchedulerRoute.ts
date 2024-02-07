import express from "express";
import { scheduleObservation, getScheduledObservationList } from "./../controllers/observationSchedulerController"
export const observationSchedulerRoute = express.Router()
observationSchedulerRoute.post("/observation/schedule", scheduleObservation)
observationSchedulerRoute.get("/getScheduledObservationList", getScheduledObservationList)