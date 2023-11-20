import { pool } from "./../utils/postgres-connection";
export const addRelationship = async (_req, res) => {
  const result = await pool.query(``, []);
  res.status(200).json({
    message: "Mentee successfully mapped",
    data: result,
  });
};
