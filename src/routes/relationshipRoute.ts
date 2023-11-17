import express from "express";
const relationshipController = require("./../controllers/relationshipController");
export const relationshipRoute = express.Router();
relationshipRouter.post(
  "/addRelationship",
  relationshipController.addRelationship
);
