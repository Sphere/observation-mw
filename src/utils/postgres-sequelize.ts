import { logger } from "./logger";
import { Sequelize } from "sequelize";
const postgresConnectionDetails = {
    database: process.env.POSTGRES_DATABASE,
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER
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