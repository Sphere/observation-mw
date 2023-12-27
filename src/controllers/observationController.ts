import axios from "axios";
import { logger } from "../utils/logger";
import { requestValidator } from "../utils/requestValidator"
import { MentoringRelationship } from "../models/mentoringRelationshipModel"
import { MentoringObservation } from "../models/mentoringObservationModel"

const API_ENDPOINTS = {
    "getObservationDetails": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observations/assessment`,
    "verifyObservationLink": `${process.env.ML_CORE_SERVICE_API_BASE}/v1/solutions/verifyLink`,
    "verifyOtp": `${process.env.HOST}api/observationmw/v1/otp/verifyOtp`,
    "getEntity": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observations/entities`,
    "submitObservation": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observationSubmissions/update`,
    "addEntityToObservation": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observations/updateEntities`,
    "dbFind": `${process.env.ML_CORE_SERVICE_API_BASE}/v1/admin/dbFind/observationSubmissions`
}
const observationServiceHeaders = (req) => {
    return {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": process.env.SB_API_KEY,
        "X-authenticated-user-token": req.headers["x-authenticated-user-token"],
        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
    }
}

// Function to handle missing parameters and return an appropriate response
const handleMissingParams = (params, input, res) => {
    const missingParams = requestValidator(params, input);
    if (missingParams.length > 0) {
        logger.info(missingParams, "Paramters missing")
        return res.status(400).json({
            "type": "Failed",
            "error": `Missing parameters: ${missingParams.join(', ')}`
        });
    }
    return false;
};
//Function to get entity ID for the moentor
const getEntitiesForMentor = async (req) => {
    try {
        const solution_id = req.body.solution_id;
        const entityData = await axios({
            params: {
                solutionId: solution_id
            },
            headers: observationServiceHeaders(req),
            method: 'GET',
            url: `${API_ENDPOINTS.getEntity}`,
        })
        return entityData;
    } catch (error) {
        logger.error(error, "Something went wrong while getting observation result")
    }

}
//Function to get result of the submitted observations through DBFind API in ml-core service
export const getObservationSubmissionResult = async (req, res) => {
    try {
        const observation_filter_data = req.body;
        const submissionResult = await axios({
            data: {
                "query": {
                    "_id": observation_filter_data.query["_id"]
                },
                "mongoIdKeys": [
                    "_id"
                ],
                "projection": [],
                "limit": 200,
                "skip": 0
            },
            headers: observationServiceHeaders(req),
            method: 'GET',
            url: `${API_ENDPOINTS.dbFind}`,
        })
        res.status(200).json({
            "message": "SUCCESS",
            "data": submissionResult.data
        })
    } catch (error) {
        logger.error(error, "Something went wrong while getting observation result")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while getting observation result" });
    }

}
//Function to submit observation
export const submitObservation = async (req, res) => {
    try {
        const submission_id = req.query.submission_id;
        if (handleMissingParams(["submission_id"], req.query, res)) return;
        const submission_data = req.body;
        const submitObservationDetails = await axios({
            headers: observationServiceHeaders(req),
            method: 'POST',
            data: submission_data,
            url: `${API_ENDPOINTS.submitObservation}/${submission_id}`
        })
        res.status(200).json({
            "message": "SUCCESS",
            "data": submitObservationDetails.data
        })
    } catch (error) {
        logger.error(error, "Something went wrong while submitting observation")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while submitting observation" });
    }

}
//End-points for verifying observation link
export const verifyobservationLink = async (req, res) => {
    try {
        logger.info("Inside verify observation link route");
        const observationLink = req.query.observationLink
        if (handleMissingParams(["observationLink"], req.query, res)) return;
        const observationDetails = await axios({
            params: {
                "createProject": "false"
            },
            headers: observationServiceHeaders(req),
            method: 'POST',
            url: `${API_ENDPOINTS.verifyObservationLink}/${observationLink}`,
        })
        res.status(200).json(observationDetails.data)
    } catch (error) {
        logger.error(error, "Something went wrong while verifying observation link")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while verifying observation link" });
    }

};
//Function to add entities to the observation
export const addEntityToObservation = async (req, res) => {
    try {
        const [observation_id, mentee_id] = req.query;
        if (handleMissingParams(["observation_id", "mentee_id"], req.query, res)) return;
        const addEntityDetails = await axios({
            headers: observationServiceHeaders(req),
            data: {
                data: [mentee_id]
            },
            method: 'POST',
            url: `${API_ENDPOINTS.addEntityToObservation}/${observation_id}`,
        })
        res.status(200).json(addEntityDetails.data)
    } catch (error) {
        logger.error(error, "Something went wrong while adding entity to observation")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while adding entity to observation" });
    }

}
//Endpoints for getting observation details
export const getobservationDetails = async (req, res) => {
    try {
        logger.info("Inside observation details route");
        const { observation_id, mentee_id, mentor_id, submision_number } = req.query
        if (handleMissingParams(["observation_id", "mentor_id", "mentee_id", "submision_number"], req.query, res)) return;
        const observationDetails = await axios({
            params: {
                "entityId": mentee_id,
                "submissionNumber": submision_number
            },
            headers: observationServiceHeaders(req),
            data: {
                "users": mentor_id,
                "roles": "MENTOR,MENTEE"
            },
            method: 'POST',
            url: `${API_ENDPOINTS.getObservationDetails}/${observation_id}`,
        })
        res.status(200).json(observationDetails.data)
    } catch (error) {
        logger.error(error, "Something went wrong while fetching observation questions")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while fetching observation questions" });
    }

};

export const observationOtpVerification = async (req, res) => {
    logger.info("Observation verification OTP route");
    try {
        const { otp, mentor_id, mentee_id, solution_id } = req.body;
        if (handleMissingParams(["otp", "mentor_id", "mentee_id", "solution_id"], req.body, res)) return;
        let otpVerified;
        try {
            otpVerified = await axios({
                params: {
                    otp,
                    menteeId: mentee_id
                },
                headers: observationServiceHeaders(req),
                method: 'GET',
                url: `${API_ENDPOINTS.verifyOtp}`,
            })
        } catch (error) {
            logger.error(error, "MSG-91 API issue")
            return res.status(500).json({ "type": "Failed", "error": "Unable to fulfill the verify OTP request due to a third-party API failure." });
        }

        if (otpVerified.data.type == "success") {
            logger.info("OTP verified successfully from msg-91")
            MentoringObservation.belongsTo(MentoringRelationship, {
                foreignKey: 'mentoring_relationship_id',
            });
            const observationInstance = await MentoringObservation.findOne({
                where: {
                    '$mentoring_relationship.mentor_id$': mentor_id,
                    '$mentoring_relationship.mentee_id$': mentee_id,
                    solution_id: solution_id,
                },
                include: [
                    {
                        model: MentoringRelationship,
                        as: 'mentoring_relationship',
                        attributes: [],
                    },
                ],
            });
            if (observationInstance) {
                // Update the observation instance
                const mentorEntityData = await getEntitiesForMentor(req);
                const observation_id = mentorEntityData.data.result["_id"]
                await observationInstance.update({
                    otp_verification_status: 'verified',
                    observation_id: observation_id
                });
                logger.info("DB update successfull for OTP verification")
                return res.status(200).json({
                    message: 'OTP verification sompleted successfully',
                    observation_id: observation_id
                });
            } else {
                return res.status(400).json({
                    message: 'Observation not found',
                });
            }
        }
        else if (otpVerified.data.type == "error") {
            res.status(400).json({
                "message": otpVerified.data.type.message
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            "message": "Error occurred while observation verification"
        })
    }

}



