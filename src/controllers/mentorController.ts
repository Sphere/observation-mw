import { MentoringRelationship } from "../models/mentoringRelationshipModel";
import { MentoringObservation } from "../models/mentoringObservationModel";
import { ObservationData } from "../models/observationMetaModel";
export const getObservationForMentee = async (req, res) => {
  const { menteeId } = req.query;
  try {
    MentoringRelationship.hasMany(MentoringObservation, {
      foreignKey: 'mentoring_relationship_id',
    });
    MentoringObservation.hasMany(ObservationData, {
      foreignKey: 'solution_id',
    });
    const menteeObservationData = await MentoringRelationship.findAll({
      attributes: ['mentoring_relationship_id', 'mentor_id', 'mentee_id', 'mentor_name', 'mentee_name', 'mentee_designation', 'mentee_contact_info', 'createdat', 'updatedat'],
      include: [
        {
          model: MentoringObservation,
          attributes: ['type', 'observation_id', 'solution_id', 'otp_verification_status', 'submission_status', 'attempted_count'],
          include: [{
            model: ObservationData,
            as: 'observationData',
            attributes: ['solution_id', 'solution_name', 'competency_data', 'solution_link_id']
          }]
        },

      ],
      where: { mentee_id: menteeId },
      subQuery: false,
    });

    res.status(200).json({
      message: "SUCCESS",
      data: menteeObservationData,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: "Something went wrong while fetching MENTEE data",
    });
  }
};

export const getAllMenteeForMentor = async (req, res) => {
  const { mentorId } = req.query;

  try {
    MentoringRelationship.hasMany(MentoringObservation, {
      foreignKey: 'mentoring_relationship_id',
    });
    const menteeMentorObservationData = await MentoringRelationship.findAll({
      attributes: ['mentoring_relationship_id', 'mentor_id', 'mentee_id', 'mentor_name', 'mentee_name', 'mentee_designation', 'mentee_contact_info', 'createdat', 'updatedat'],
      include: [
        {
          model: MentoringObservation,
          attributes: ['type', 'observation_id', 'solution_id', 'otp_verification_status', 'submission_status', 'attempted_count'],
          include: [{
            model: ObservationData,
            as: 'observationData',
            attributes: ['solution_id', 'solution_name', 'competency_data', 'solution_link_id']
          }]
        },
      ],
      where: { mentor_id: mentorId }, subQuery: false,
    });
    res.status(200).json({
      message: "SUCCESS",
      data: menteeMentorObservationData,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: "Something went wrong while fetching MENTOR data",
    });
  }
};
