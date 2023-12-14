import { MentoringRelationship } from "../models/mentoringRelationshipModel";
import { MentoringObservation } from "../models/mentoringObservationModel";

const getObservationForMentee = async (req, res) => {
  const { menteeId } = req.query;

  try {
    const result = await MentoringRelationship.findAll({
      attributes: ['mentoring_relationship_id', 'mentor_id', 'mentee_id', 'mentor_name', 'mentee_name'],
      include: [
        {
          model: MentoringObservation,
          as: 'observations',
          attributes: ['uuid_id', 'type', 'observation_id', 'observation_status', 'submission_status', 'additional_data', 'createdAt', 'updatedAt'],
          // Add the condition to filter by mentee_id
        },
      ],
      where: { mentee_id: menteeId }
    });

    res.status(200).json({
      message: "SUCCESS",
      data: result,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getAllMenteeForMentor = async (req, res) => {
  const { mentorId } = req.query;

  try {
    const result = await MentoringRelationship.findAll({
      attributes: ['mentoring_relationship_id', 'mentor_id', 'mentee_id', 'mentor_name', 'mentee_name'],
      include: [
        {
          model: MentoringObservation,
          as: 'observations',
          attributes: ['uuid_id', 'type', 'observation_id', 'observation_status', 'submission_status', 'additional_data', 'createdAt', 'updatedAt'],

        },
      ],
      where: { mentor_id: mentorId },
    });

    res.status(200).json({
      message: "SUCCESS",
      data: result,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllMenteeForMentor,
  getObservationForMentee
};