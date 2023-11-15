const express = require("express");
const relationshipController = require("./../controllers/relationshipController");
const mentorRouter = express.Router();
mentorRouter.post("/getAllMentee", mentorRouter.getAllMentee);
module.exports = mentorRouter;
