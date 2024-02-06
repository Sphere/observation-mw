import { Sequelize, DataTypes } from 'sequelize';
const postgresConnectionDetails = {
    database: process.env.POSTGRES_DATABASE || "observation_mw",
    host: process.env.POSTGRES_HOST || "abcd",
    password: process.env.POSTGRES_PASSWORD || "abcd",
    port: Number(process.env.POSTGRES_PORT) || 1234,
    user: process.env.POSTGRES_USER || "abcd"
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
