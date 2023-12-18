import { Sequelize, DataTypes } from 'sequelize';

import { MentoringRelationship } from "./mentoringRelationshipModel"

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
// Define the MentoringObservation model
const MentoringObservation = sequelize.define('mentoring_observations', {
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
        allowNull: false,
    },
    observation_status: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    observation_name: {
        type: DataTypes.STRING(250),
    },
    submission_status: {
        type: DataTypes.STRING(250),
    },
    competency_data: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
    },
    additional_data: {
        type: DataTypes.JSON,
    }
});

MentoringObservation.hasOne(MentoringRelationship, {
    foreignKey: 'mentoring_relationship_id',
    as: 'relationship', // Use a unique alias
});

// Synchronize the model with the database (create the table)
// sequelize.sync()
//     .then(() => {
//         console.log('MentoringObservation table created successfully');
//     })
//     .catch((error) => {
//         console.error('Error creating MentoringObservation table:', error);
//     });
MentoringRelationship.sync()
    .then(() => {
        console.log('MentoringRelationship table created successfully');
        // Now, sync the MentoringObservation model
        return MentoringObservation.sync();
    })
    .then(() => {
        console.log('MentoringObservation table created successfully');
    })
    .catch((error) => {
        console.error('Error creating tables:', error);
    });
// Export the model for use in other parts of your application
export { MentoringObservation }