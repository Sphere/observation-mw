import { pool } from "./../utils/postgres-connection";

const getAllMenteeForMentor = async (req, res) => {
  const mentorId = req.query.mentorId;
  const getAllMenteeResponse = await pool.query(
    `SELECT mentoring_relationship.mentoring_relationship_id,mentoring_relationship.mentor_id,mentoring_relationship.mentee_id,mentoring_observation.observation_id,mentoring_observation.observation_status FROM mentoring_relationship JOIN mentoring_observation ON mentoring_relationship.mentoring_relationship_id = mentoring_observation.mentoring_relationship_id WHERE mentor_id=$1`,
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
    `SELECT mentoring_relationship.mentoring_relationship_id,mentoring_relationship.mentor_id,mentoring_relationship.mentee_id,mentoring_observation.observation_id,mentoring_observation.observation_status FROM mentoring_relationship JOIN mentoring_observation ON mentoring_relationship.mentoring_relationship_id = mentoring_observation.mentoring_relationship_id WHERE mentee_id=$1;`,
    [menteeId]
  );
  res.status(200).json({
    message: "SUCCESS",
    data: getObservationForMenteeResponse.rows,
  });
};


module.exports = {
  getAllMenteeForMentor,
  getObservationForMentee

};
