import { Pool } from "pg";
require("dotenv").config();

export const pool = new Pool({
  database: process.env.POSTGRES_DATABASE,
  host: process.env.POSTGRES_HOST,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
});
