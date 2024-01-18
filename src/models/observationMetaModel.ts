import { Sequelize, DataTypes } from 'sequelize';
const postgresConnectionDetails = {
    database: process.env.POSTGRES_DATABASE,
    host: process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER
}
const sequelize = new Sequelize(postgresConnectionDetails.database, postgresConnectionDetails.user, postgresConnectionDetails.password, {
    host: postgresConnectionDetails.host,
    port: postgresConnectionDetails.port,
    dialect: 'postgres'
})
// Define the ObservationData model
export const ObservationData = sequelize.define('observation_data', {
    solution_id: {
        type: DataTypes.STRING(250),
        allowNull: false,
        primaryKey: true,
    },
    solution_name: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    solution_link_id: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    competency_data: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
    },
});

module.exports = { ObservationData }
