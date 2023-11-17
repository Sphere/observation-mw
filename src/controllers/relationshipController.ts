import { pool } from "./../utils/postgres-connection";
const addRelationship = async (req, res) => {
  const result = await pool.query(``, []);
  res.status(200).json({
    message: "Mentee successfully mapped",
    data: result,
  });
};
module.exports = { addRelationship };
