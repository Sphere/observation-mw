import express from "express";
const relationshipController = require("./../controllers/relationshipController");
export const relationshipRoute = express.Router();
relationshipRoute.post(
  "/addRelationship",
  relationshipController.addRelationship
);
