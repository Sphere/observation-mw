import axios from "axios";
import { logger } from "../utils/logger";
import { requestValidator } from "../utils/requestValidator"
const uuid = require('uuid');
import { uuid } from "uuid"
import { sequelize } from "../utils/postgres-sequelize"
import { MentoringRelationship } from "../models/mentoringRelationshipModel"
import { MentoringObservation } from "../models/mentoringObservationModel"
import { userSearch } from "../utils/userSearch"

const API_ENDPOINTS = {
    "getSurveyDetails": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/surveys/details`,
    "verifySurveyLink": `${process.env.ML_CORE_SERVICE_API_BASE}/v1/solutions/verifyLink`,
    "sendOtp": `${process.env.HOST}/api/v1/otp/sendOtp`
}

// Function to handle missing parameters and return an appropriate response
const handleMissingParams = (params, req, res) => {
    const missingParams = requestValidator(params, req.query);
    if (missingParams.length > 0) {
        logger.info(missingParams, "Paramters missing")
        return res.status(400).json({
            "type": "Failed",
            "error": `Missing parameters: ${missingParams.join(', ')}`
        });
    }
    return false;
};
//End-points for verifying survey link
const verifySurveyLink = async (req, res) => {
    try {
        logger.info("Inside verify survey link route");

        const surveyLink = req.query.surveyLink
        const userToken = req.headers["x-authenticated-user-token"]
        const surveyDetails = await axios({
            params: {
                "createProject": "false"
            },
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "Authorization": process.env.SB_API_KEY,
                "X-authenticated-user-token": userToken
            },
            method: 'POST',
            url: `${API_ENDPOINTS.verifySurveyLink}/${surveyLink}`,
        })
        res.status(200).json(surveyDetails.data)
    } catch (error) {
        logger.error(error, "Something went wrong while verifying survey")
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
    }

};

//Endpoints for getting survey details
const getSurveyDetails = async (req, res) => {
    try {
        logger.info("Inside survey details route");
        const solutionId = req.query.solutionId
        logger.info("SolutionID", solutionId)
        const userToken = req.headers["x-authenticated-user-token"]
        const surveyDetails = await axios({
            params: {
                solutionId,
                "retrytype": "text"
            },
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "Authorization": process.env.SB_API_KEY,
                "X-authenticated-user-token": userToken
            },
            method: 'POST',
            url: API_ENDPOINTS.getSurveyDetails || "http://localhost:3000",
        })
        res.status(200).json(surveyDetails.data)
    } catch (error) {
        logger.error(error, "Something went wrong while fetching survey details")
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
    }

};
const surveyOtpVerification = async (req, res) => {
    logger.info("Inside survey otp verification route")
    try {
        const userToken = req.headers["x-authenticated-user-token"]

        const uuidV4 = uuid.v4();
        const { otp, mentor_id, mentee_id, observation_id, phone } = req.body;
        if (handleMissingParams(["otp", "phone", "mentor_id", "mentee_id", "observation_id"], req, res)) return;
        const mentorMenteeProfileData = await userSearch({
            "id": [mentor_id, mentee_id]
        })
        logger.info(mentorMenteeProfileData)
        const mentorDetails = mentorMenteeProfileData.data.result.response.content.find(user => user.id === mentor_id);
        const menteeDetails = mentorMenteeProfileData.data.result.response.content.find(user => user.id === mentee_id);

        let otpVerified;
        try {
            otpVerified = await axios({
                params: {
                    otp, phone
                },
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "Authorization": process.env.SB_API_KEY,
                    "X-authenticated-user-token": userToken
                },
                method: 'POST',
                url: `${API_ENDPOINTS.sendOtp}`,
            })
        } catch (error) {
            logger.error(error, "Something went wrong while survey otp verification")
            return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
        }
        logger.info(otpVerified.data)
        if (otpVerified.data.type = "success") {
            const mentoringAndRealtionshipCreationData = {
                mentoring_relationship_id: uuidV4,
                mentor_id,
                mentee_id,
                mentor_name: mentorDetails.firstName + mentorDetails.lastName,
                mentee_name: menteeDetails.firstName + menteeDetails.lastName,
                mentee_designation: menteeDetails.profileDetails.profileReq.professionalDetails.designation,
                observation_id

            };
            logger.info(mentoringAndRealtionshipCreationData, "mentoringAndRealtionshipCreationData")
            const reponseFromRelationshipCreation = await createMentoringRelationshipAndObservation(mentoringAndRealtionshipCreationData)
            if (reponseFromRelationshipCreation.message == "SUCCESS") {
                res.status(200).json({
                    "message": "Relationship updated successfully"
                })
            }
            else {
                res.status(400).json({
                    "message": "Failed during relationship creation"
                })
            }

        }
    } catch (error) {
        logger.error(error, "Something went wrong while survey otp verification")
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
    }

}
const createMentoringRelationshipAndObservation = async (mentoringAndRealtionshipCreationData) => {
    let transaction;

    try {
        // Start a transaction
        transaction = await sequelize.transaction();
        const mentoringRelationshipData = {
            mentoring_relationship_id: mentoringAndRealtionshipCreationData.mentoring_relationship_id,
            mentor_id: mentoringAndRealtionshipCreationData.mentor_id,
            mentee_id: mentoringAndRealtionshipCreationData.mentee_id,
            mentor_name: mentoringAndRealtionshipCreationData.mentor_name,
            mentee_name: mentoringAndRealtionshipCreationData.mentee_name,
            mentee_designation: mentoringAndRealtionshipCreationData.mentee_designation
        };
        // Create a MentoringRelationship record
        await MentoringRelationship.create(mentoringRelationshipData, { transaction });

        // Sample data for MentoringObservation
        const mentoringObservationData = {
            mentoring_relationship_id: mentoringAndRealtionshipCreationData.mentoring_relationship_id,
            observation_id: mentoringAndRealtionshipCreationData.observation_id,
            observation_status: 'your_observation_status',
            additional_data: { key: 'value', anotherKey: 'anotherValue' },
        };

        // Create a MentoringObservation record
        await MentoringObservation.create(mentoringObservationData, { transaction });

        // Commit the transaction
        await transaction.commit();

        console.log('Records created successfully.');
        return { "message": "SUCCESS" }
    } catch (error) {
        // If there is an error, rollback the transaction
        if (transaction) await transaction.rollback();

        console.error('Error creating records:', error);
        return { "message": "FAILED" }

    };
}

module.exports = { getSurveyDetails, verifySurveyLink, surveyOtpVerification }


