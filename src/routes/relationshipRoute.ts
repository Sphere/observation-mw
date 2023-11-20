import { Router } from 'express'
const relationshipController = require("./../controllers/relationshipController");
 export const relationshipRoute = Router();
relationshipRoute.post(
  "/addRelationship",
  relationshipController.addRelationship
);
