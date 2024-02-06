import { Sequelize, DataTypes } from 'sequelize';

const postgresConnectionDetails = {
    database: process.env.POSTGRES_DATABASE || "observation_mw",
    host: process.env.POSTGRES_HOST || "abcd",
    password: process.env.POSTGRES_PASSWORD || "abcd",
    port: Number(process.env.POSTGRES_PORT) || 1234,
    user: process.env.POSTGRES_USER || "abcd"
}
const sequelize = new Sequelize(postgresConnectionDetails.database, postgresConnectionDetails.user!, postgresConnectionDetails.password!, {
    host: postgresConnectionDetails.host,
    port: postgresConnectionDetails.port,
    dialect: 'postgres'
})

// Define the MentoringRelationship model
export const MentoringRelationship = sequelize.define('mentoring_relationships', {

    mentoring_relationship_id: {
        type: DataTypes.STRING(250),
        primaryKey: true,
    },
    mentor_id: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    mentee_id: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    mentor_name: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    mentee_name: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    mentee_designation: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    mentee_contact_info: {
        type: DataTypes.STRING(250),
        allowNull: false,
    }
});
module.exports = { MentoringRelationship }