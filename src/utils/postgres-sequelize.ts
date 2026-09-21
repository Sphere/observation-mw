import { logger } from "./logger";
import { Sequelize } from "sequelize";
const postgresConnectionDetails = {
    database: process.env.POSTGRES_DATABASE || "abc",
    host: process.env.POSTGRES_HOST || "abc",
    password: process.env.POSTGRES_PASSWORD || "abc",
    port: Number(process.env.POSTGRES_PORT) || 1234,
    user: process.env.POSTGRES_USER || "abc"
}
export const sequelize = new Sequelize(postgresConnectionDetails.database, postgresConnectionDetails.user, postgresConnectionDetails.password, {
    host: postgresConnectionDetails.host,
    port: postgresConnectionDetails.port,
    dialect: 'postgres'
})
const checkConnectionDetails = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connection has been established successfully.');
    } catch (error) {
        logger.info('Unable to connect to the database:', error);
    }
}
checkConnectionDetails();
module.exports = { sequelize }