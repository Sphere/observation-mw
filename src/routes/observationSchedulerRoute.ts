import express from "express";
import { scheduleObservation } from "./../controllers/observationSchedulerController"
export const observationSchedulerRoute = express.Router()
observationSchedulerRoute.post("/observation/schedule", scheduleObservation)