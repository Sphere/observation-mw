import axios from "axios";
import { logger } from "../utils/logger";
import { requestValidator } from "../utils/requestValidator"

import { MentoringRelationship } from "../models/mentoringRelationshipModel"
import { MentoringObservation } from "../models/mentoringObservationModel"

const API_ENDPOINTS = {
    "getSurveyDetails": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/surveys/details`,
    "verifySurveyLink": `${process.env.ML_CORE_SERVICE_API_BASE}/v1/solutions/verifyLink`,
    "verifyOtp": `${process.env.HOST}api/observationmw/v1/otp/verifyOtp`
}

// Function to handle missing parameters and return an appropriate response
const handleMissingParams = (params, req, res) => {
    const missingParams = requestValidator(params, req.body);
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
const verifyobservationLink = async (req, res) => {
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
const getobservationDetails = async (req, res) => {
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
export const observationOtpVerification = async (req, res) => {
    logger.info("Inside observation verification OTP route");
    const userToken = req.headers["x-authenticated-user-token"]
    try {
        const { otp, mentor_id, mentee_id, observation_id } = req.body;
        console.log(req.body.otp)
        if (handleMissingParams(["otp", "mentor_id", "mentee_id", "observation_id"], req, res)) return;
        let otpVerified;
        try {
            otpVerified = await axios({
                params: {
                    otp,
                    menteeId: mentee_id
                },
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "Authorization": process.env.SB_API_KEY,
                    "X-authenticated-user-token": userToken
                },
                method: 'GET',
                url: `${API_ENDPOINTS.verifyOtp}`,
            })
        } catch (error) {
            logger.error(error, "Something went wrong while survey otp verification")
            return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
        }
        console.log(otpVerified.data.type)
        logger.info(otpVerified.data)
        if (otpVerified.data.type == "success") {
            MentoringObservation.belongsTo(MentoringRelationship, {
                foreignKey: 'mentoring_relationship_id',
                as: 'observation_mentoring_relationship',
            });
            await MentoringObservation.findOne({
                where: {
                    '$mentoring_relationship.mentor_id$': mentor_id,
                    '$mentoring_relationship.mentee_id$': mentee_id,
                    observation_id: observation_id,
                },
                include: [
                    {
                        model: MentoringRelationship,
                        attributes: [],
                        as: 'observation_mentoring_relationship',
                    },
                ],
            })
                .then((observationInstance) => {
                    if (observationInstance) {
                        // Update the observation instance
                        return observationInstance.update({ observation_status: 'verified' });
                    } else {
                        return res.status(400).json({
                            "message": "Observation not found"
                        }) // Handle the case where the observation is not found
                    }
                })
                .then(() => {
                    console.log('Update successful');
                })
                .catch((error) => {
                    console.error('Error updating records:', error);
                    return res.status(400).json({
                        "message": "Error updating records"
                    }) //
                });

        }
        else if (otpVerified.data.type == "error") {
            res.status(400).json({
                "message": "Mentee already verified"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({
            "message": "Error occurred while observation verification"
        })
    }

}

// const sampleDataInsertion = async (req, res) => {
//     logger.info("Inside observation otp verification route")
//     try {
//         const userToken = req.headers["x-authenticated-user-token"]
//         const uuidV4 = uuid.v4();
//         const { otp, mentor_id, mentee_id, observation_id, phone } = req.body;
//         if (handleMissingParams(["otp", "phone", "mentor_id", "mentee_id", "observation_id"], req, res)) return;
//         const mentorMenteeProfileData = await userSearch({
//             "id": [mentor_id, mentee_id]
//         })
//         logger.info(mentorMenteeProfileData)
//         const mentorDetails = mentorMenteeProfileData.data.result.response.content.find(user => user.id === mentor_id);
//         const menteeDetails = mentorMenteeProfileData.data.result.response.content.find(user => user.id === mentee_id);

//         let otpVerified;
//         try {
//             otpVerified = await axios({
//                 params: {
//                     otp, phone
//                 },
//                 headers: {
//                     accept: "application/json",
//                     "content-type": "application/json",
//                     "Authorization": process.env.SB_API_KEY,
//                     "X-authenticated-user-token": userToken
//                 },
//                 method: 'GET',
//                 url: `${API_ENDPOINTS.verifyOtp}`,
//             })
//         } catch (error) {
//             logger.error(error, "Something went wrong while survey otp verification")
//             return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
//         }
//         logger.info(otpVerified.data)
//         if (otpVerified.data.type = "success") {
//             const mentoringAndRealtionshipCreationData = {
//                 mentoring_relationship_id: uuidV4,
//                 mentor_id,
//                 mentee_id,
//                 mentor_name: mentorDetails.firstName + mentorDetails.lastName,
//                 mentee_name: menteeDetails.firstName + menteeDetails.lastName,
//                 mentee_designation: menteeDetails.profileDetails.profileReq.professionalDetails.designation || "Dummy designation",
//                 observation_id

//             };
//             logger.info(mentoringAndRealtionshipCreationData, "mentoringAndRealtionshipCreationData")
//             const reponseFromRelationshipCreation = await createMentoringRelationshipAndObservation(mentoringAndRealtionshipCreationData)
//             if (reponseFromRelationshipCreation.message == "SUCCESS") {
//                 res.status(200).json({
//                     "message": "Relationship updated successfully"
//                 })
//             }
//             else {
//                 res.status(400).json({
//                     "message": "Failed during relationship creation"
//                 })
//             }

//         }
//     } catch (error) {
//         logger.error(error, "Something went wrong while survey otp verification")
//         return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
//     }

// }
// const createMentoringRelationshipAndObservation = async (mentoringAndRealtionshipCreationData) => {
//     let transaction;

//     try {
//         // Start a transaction
//         transaction = await sequelize.transaction();
//         const mentoringRelationshipData = {
//             mentoring_relationship_id: mentoringAndRealtionshipCreationData.mentoring_relationship_id,
//             mentor_id: mentoringAndRealtionshipCreationData.mentor_id,
//             mentee_id: mentoringAndRealtionshipCreationData.mentee_id,
//             mentor_name: mentoringAndRealtionshipCreationData.mentor_name,
//             mentee_name: mentoringAndRealtionshipCreationData.mentee_name,
//             mentee_designation: mentoringAndRealtionshipCreationData.mentee_designation
//         };
//         // Create a MentoringRelationship record
//         await MentoringRelationship.create(mentoringRelationshipData, { transaction });

//         // Sample data for MentoringObservation
//         const mentoringObservationData = {
//             mentoring_relationship_id: mentoringAndRealtionshipCreationData.mentoring_relationship_id,
//             observation_id: mentoringAndRealtionshipCreationData.observation_id,
//             observation_status: 'your_observation_status',
//             type: "Survey",
//             additional_data: { key: 'value', anotherKey: 'anotherValue' },
//         };

//         // Create a MentoringObservation record
//         await MentoringObservation.create(mentoringObservationData, { transaction });

//         // Commit the transaction
//         await transaction.commit();

//         console.log('Records created successfully.');
//         return { "message": "SUCCESS" }
//     } catch (error) {
//         // If there is an error, rollback the transaction
//         if (transaction) await transaction.rollback();

//         console.error('Error creating records:', error);
//         return { "message": "FAILED" }

//     };
// }


module.exports = { getobservationDetails, verifyobservationLink, observationOtpVerification }


