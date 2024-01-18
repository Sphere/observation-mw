import { Sequelize, DataTypes } from 'sequelize';
import { ObservationData } from './observationMetaModel';
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

// Define the MentoringRelationship model
export const MenteeSubmissionAttempts = sequelize.define('mentee_submission_attempts', {

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
    solution_id: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    submission_id: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    domain: {
        type: DataTypes.STRING(250),
    },
    attempt_serial_number: {
        type: DataTypes.STRING(250),
    },
    user_submission: {
        type: DataTypes.JSONB,
        allowNull: false,
    },
    result_percentage: {
        type: DataTypes.INTEGER,
    },
    total_score: {
        type: DataTypes.INTEGER,
    },
    acquired_score: {
        type: DataTypes.INTEGER,
    }

});
MenteeSubmissionAttempts.hasOne(ObservationData, {
    foreignKey: 'solution_id',
    sourceKey: 'solution_id',
    as: 'observationAttemptsMetaData',
});
module.exports = { MenteeSubmissionAttempts }