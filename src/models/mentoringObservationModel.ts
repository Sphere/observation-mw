import { Sequelize, DataTypes } from 'sequelize';
import { MentoringRelationship } from "./mentoringRelationshipModel"
import { ObservationData } from './observationMetaModel';

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
// Define the MentoringObservation model
export const MentoringObservation = sequelize.define('mentoring_observations', {
    uuid_id: {
        type: DataTypes.STRING(250),
        primaryKey: true,
    },
    mentoring_relationship_id: {
        type: DataTypes.STRING(250),
        allowNull: false,
        references: {
            model: MentoringRelationship,
            key: 'mentoring_relationship_id',
        },
    },
    type: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    observation_id: {
        type: DataTypes.STRING(250),
    },
    otp_verification_status: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    solution_id: {
        type: DataTypes.STRING(250),
    },
    submission_status: {
        type: DataTypes.STRING(250),
    },
    attempted_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
});

MentoringObservation.belongsTo(MentoringRelationship, {
    foreignKey: 'mentoring_relationship_id',
    as: 'relationship',
});

MentoringObservation.hasOne(ObservationData, {
    foreignKey: 'solution_id',
    sourceKey: 'solution_id',
    as: 'observationData',
});
// sequelize
//     .sync()
//     .then(() => {
//         console.log('Tables created successfully');
//     })
//     .catch((error) => {
//         console.error('Error creating tables:', error);
//     });
module.exports = { MentoringObservation }