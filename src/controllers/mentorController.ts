import { MentoringRelationship } from "../models/mentoringRelationshipModel"
import { MentoringObservation } from "../models/mentoringObservationModel"
const getAllMenteeForMentor = async (req, res) => {
  const { mentorId } = req.query;


  MentoringRelationship.findAll({
    attributes: ['mentoring_relationship_id', 'mentor_id', 'mentee_id', 'mentor_name', 'mentee_name'],
    include: [{
      model: MentoringObservation,
      attributes: ['uuid_id', 'type', 'observation_id', 'observation_status', 'submission_status', 'additional_data', 'createdAt', 'updatedAt'],
      where: { mentor_id: mentorId }, // Add the condition to filter by mentor_id
    }],
  }).then(result => {
    res.status(200).json({
      message: "SUCCESS",
      data: result,
    });
  }).catch(error => {
    console.error('Error:', error);
  });

};
const getObservationForMentee = async (req, res) => {
  const { menteeId } = req.query;

  MentoringRelationship.findAll({
    attributes: ['mentoring_relationship_id', 'mentor_id', 'mentee_id', 'mentor_name', 'mentee_name'],
    include: [{
      model: MentoringObservation,
      attributes: ['uuid_id', 'type', 'observation_id', 'observation_status', 'submission_status', 'additional_data', 'createdAt', 'updatedAt'],
      where: { mentee_id: menteeId }, // Add the condition to filter by mentee_id
    }],
  }).then(result => {
    res.status(200).json({
      message: "SUCCESS",
      data: result,
    });
  }).catch(error => {
    console.error('Error:', error);
  });
};


module.exports = {
  getAllMenteeForMentor,
  getObservationForMentee

};
