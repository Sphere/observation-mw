const { Sequelize, DataTypes } = require("sequelize");
import { sequelize } from "../utils/postgres-sequelize"
import { MentoringRelationship } from "./mentoringRelationshipModel"
// Define the MentoringObservation model
export const MentoringObservation = sequelize.define('mentoring_observation', {
    uuid_id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
    observation_id: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    observation_status: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    submission_status: {
        type: DataTypes.STRING(250),
    },
    additional_data: {
        type: DataTypes.JSON,
    }
});

// Synchronize the model with the database (create the table)
sequelize.sync({ force: true })
    .then(() => {
        console.log('MentoringObservation table created successfully');
    })
    .catch((error) => {
        console.error('Error creating MentoringObservation table:', error);
    });

// Export the model for use in other parts of your application
module.exports = MentoringObservation;