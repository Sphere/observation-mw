const express = require("express");
const relationshipController = require("./../controllers/relationshipController");
const relationshipRouter = express.Router();
relationshipRouter.post(
  "/addRelationship",
  relationshipController.addRelationship
);
module.exports = relationshipRouter;
