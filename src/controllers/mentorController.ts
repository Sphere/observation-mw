import { pool } from "./../utils/postgres-connection";

const getAllMenteeForMentor = async (req, res) => {
  const mentorId = req.query.mentorId;
  const getAllMenteeResponse = await pool.query(
    `SELECT mentor_mentee.mentor_mentee_id,mentor_mentee.mentor_id,mentor_mentee.mentee_id,mentor_mentee_observation.observation_id,mentor_mentee_observation.status FROM mentor_mentee JOIN mentor_mentee_observation ON mentor_mentee.mentor_mentee_id = mentor_mentee_observation.mentor_mentee_realtion_id WHERE mentor_id=$1`,
    [mentorId]
  );
  res.status(200).json({
    message: "SUCCESS",
    data: getAllMenteeResponse.rows,
  });
};
const getObservationForMentee = async (req, res) => {
  const { menteeId } = req.query;

  const getObservationForMenteeResponse = await pool.query(
    `SELECT mentor_mentee.mentor_mentee_id,mentor_mentee.mentor_id,mentor_mentee.mentee_id,mentor_mentee_observation.observation_id,mentor_mentee_observation.status FROM mentor_mentee JOIN mentor_mentee_observation ON mentor_mentee.mentor_mentee_id = mentor_mentee_observation.mentor_mentee_realtion_id WHERE mentee_id=$1;`,
    [menteeId]
  );
  res.status(200).json({
    message: "SUCCESS",
    data: getObservationForMenteeResponse.rows,
  });
};
const getAllMentor = async (_req, res) => {

  const getAllMentorResponse = await pool.query(
    `SELECT DISTINCT mentor_mentee.mentor_id FROM mentor_mentee;`,
    []
  );
  res.status(200).json({
    message: "SUCCESS",
    data: getAllMentorResponse.rows,
  });
};
const getAllObservation = async (_req, res) => {
  const getAllMenteeResponse = await pool.query(
    `SELECT DISTINCT mentor_mentee_observation.observation_id FROM mentor_mentee JOIN mentor_mentee_observation ON mentor_mentee.mentor_mentee_id = mentor_mentee_observation.mentor_mentee_realtion_id GROUP BY mentor_mentee.mentee_id`,
    []
  );
  res.status(200).json({
    message: "SUCCESS",
    data: getAllMenteeResponse,
  });
};
module.exports = {
  getAllMenteeForMentor,
  getObservationForMentee,
  getAllMentor,
  getAllObservation,
};
