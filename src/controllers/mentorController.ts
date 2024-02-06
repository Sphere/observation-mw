import { MentoringRelationship } from "../models/mentoringRelationshipModel";
import { MentoringObservation } from "../models/mentoringObservationModel";
import { ObservationData } from "../models/observationMetaModel";
export const getObservationForMentee = async (req: any, res: any) => {
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

export const getAllMenteeForMentor = async (req: any, res: any) => {
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
export const getMentorMenteeDetailsFiltered = async (req: any, res: any) => {
  try {
    const { menteeMentorDetails, filters } = req.body;
    const mentorMenteeFilters = Object.fromEntries(
      Object.entries(menteeMentorDetails).filter(([_key, value]) => value !== '')
    );
    MentoringRelationship.hasMany(MentoringObservation, {
      foreignKey: 'mentoring_relationship_id',
    });
    const menteeMentorObservationData = await MentoringRelationship.findAll({
      attributes: ['mentoring_relationship_id', 'mentor_id', 'mentee_id', 'mentor_name', 'mentee_name', 'mentee_designation', 'mentee_contact_info', 'createdat', 'updatedat'],
      include: [
        {
          model: MentoringObservation,
          attributes: ['type', 'observation_id', 'solution_id', 'otp_verification_status', 'submission_status', 'attempted_count'],
          where: filters,
          include: [{
            model: ObservationData,
            as: 'observationData',
            attributes: ['solution_id', 'solution_name', 'competency_data', 'solution_link_id']
          }]
        },
      ],
      where: mentorMenteeFilters, subQuery: false,
    });
    res.status(200).json({
      message: "SUCCESS",
      data: menteeMentorObservationData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while fetching MENTOR data",
    });
  }
}
export const mentorObservationFilteredCount = async (req: any, res: any) => {
  try {
    const { mentorId } = req.query;
    const filters = {
      "pending": {
        "otp_verification_status": "",
        "submission_status": ""
      },
      "inProgress": {
        "otp_verification_status": "verified",
        "submission_status": ""
      },
      "completed": {
        "otp_verification_status": "verified",
        "submission_status": "submitted"
      }
    }
    const filterCount = {
      "pending": 0,
      "inProgress": 0,
      "completed": 0
    }
    const filterArray = ["pending", "inProgress", "completed"]
    for (const element of filterArray) {

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
              where: filters[element as keyof typeof filters],
              include: [{
                model: ObservationData,
                as: 'observationData',
                attributes: ['solution_id', 'solution_name', 'competency_data', 'solution_link_id']
              }]
            },
          ],
          where: { mentor_id: mentorId }, subQuery: false,
        })
        const combinedMenteeData = menteeMentorObservationData.map((element) => {
          return (element as any).mentoring_observations;
        });
        const filteredDataLength = combinedMenteeData.flat().length;
        filterCount[element as keyof typeof filters] = filteredDataLength
      } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
          message: "Something went wrong while fetching MENTOR data",
        });
      }
    };
    res.status(200).json({
      "message": "SUCESS",
      "data": filterCount
    })
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while fetching MENTOR data",
    });
  }

}


