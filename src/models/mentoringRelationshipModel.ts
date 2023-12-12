const { DataTypes } = require("sequelize");
import { sequelize } from "../utils/postgres-sequelize"

// Define the MentoringRelationship model
export const MentoringRelationship = sequelize.define('mentoring_relationship', {
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
});

// Synchronize the model with the database (create the table)
sequelize.sync({ force: true })
    .then(() => {
        console.log('MentoringRelationship table created successfully');
    })
    .catch((error) => {
        console.error('Error creating MentoringRelationship table:', error);
    });

// Export the model for use in other parts of your application
module.exports = MentoringRelationship;