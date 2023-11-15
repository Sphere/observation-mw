import pool from "./../utils/postgres-connection";

const getAllMentee = async (req, res) => {
  const result = await pool.query(
    `SELECT id FROM public.data_node where type=$1 and name ILIKE $2`,
    ["Competency", "%" + courseSearchRequestData.request.query + "%"]
  );
  res.status(200).json({
    message: "Mentee successfully mapped",
    data: result,
  });
};

module.exports = { getAllMentee };
