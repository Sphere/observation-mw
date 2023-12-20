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


// // Synchronize the model with the database (create the table)
// sequelize.sync({ force: true })
//     .then(() => {
//         console.log('MentoringRelationship table created successfully');
//     })
//     .catch((error) => {
//         console.error('Error creating MentoringRelationship table:', error);
//     });


// Export the model for use in other parts of your application
module.exports = { MentoringRelationship }