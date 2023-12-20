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
    "addEntityToObservation": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observations/updateEntities`
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

//End-points for verifying observation link
const verifyobservationLink = async (req, res) => {
    try {
        logger.info("Inside verify observation link route");
        const observationLink = req.query.observationLink
        if (!observationLink) {
            res.status(400).json({
                "type": "Failed",
                "error": `Missing parameters: Observation link}`
            })
        }
        const userToken = req.headers["x-authenticated-user-token"]
        const observationDetails = await axios({
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
            url: `${API_ENDPOINTS.verifyObservationLink}/${observationLink}`,
        })
        res.status(200).json(observationDetails.data)
    } catch (error) {
        logger.error(error, "Something went wrong while verifying observation link")
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
    }

};
const addEntityToObservation = async (req, res) => {
    const observation_id = req.query.observation_id;
    const mentee_id = req.query.mentee_id;
    const userToken = req.headers["x-authenticated-user-token"]
    const addEntityDetails = await axios({
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "Authorization": process.env.SB_API_KEY,
            "X-authenticated-user-token": userToken
        },
        data: {
            data: [mentee_id]
        },
        method: 'POST',
        url: `${API_ENDPOINTS.addEntityToObservation}/${observation_id}`,
    })
    res.status(200).json(addEntityDetails.data)
}
//Endpoints for getting observation details
const getobservationDetails = async (req, res) => {
    try {
        logger.info("Inside observation details route");
        const { solution_id, mentee_id, mentor_id, submision_number } = req.query
        const userToken = req.headers["x-authenticated-user-token"]
        const observationDetails = await axios({
            params: {
                "entityId": mentee_id,
                "submissionNumber": submision_number
            },
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "Authorization": process.env.SB_API_KEY,
                "X-authenticated-user-token": userToken
            },
            data: {
                "users": mentor_id,
                "roles": "MENTOR,MENTEE"
            },
            method: 'POST',
            url: `${API_ENDPOINTS.getObservationDetails}/${solution_id}`,
        })
        res.status(200).json(observationDetails.data)
    } catch (error) {
        logger.error(error, "Something went wrong while fetching survey details")
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });
    }

};
const getEntitiesForMentor = async (req) => {
    const solution_id = req.body.solution_id;
    const entityData = await axios({
        params: {
            solutionId: solution_id
        },
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "Authorization": process.env.SB_API_KEY,
            "X-authenticated-user-token": req.headers["x-authenticated-user-token"]
        },
        method: 'GET',
        url: `${API_ENDPOINTS.getEntity}`,
    })
    return entityData;
}
export const observationOtpVerification = async (req, res) => {
    logger.info("Inside observation verification OTP route");
    const userToken = req.headers["x-authenticated-user-token"]
    try {
        const { otp, mentor_id, mentee_id, solution_id } = req.body;
        if (handleMissingParams(["otp", "mentor_id", "mentee_id", "solution_id"], req, res)) return;
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

        if (otpVerified.data.type == "success") {
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
                console.log('Update successful');
                return res.status(200).json({
                    message: 'Update successful',
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



module.exports = { getobservationDetails, verifyobservationLink, observationOtpVerification, addEntityToObservation }


