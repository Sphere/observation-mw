import axios from "axios";
import { logger } from "../utils/logger";
import { requestValidator } from "../utils/requestValidator"
import { MentoringRelationship } from "../models/mentoringRelationshipModel"
import { MentoringObservation } from "../models/mentoringObservationModel"
import { MenteeSubmissionAttempts } from "../models/menteeSubmissionAttemptsModel"

import { Sequelize } from "sequelize";

const API_ENDPOINTS = {
    "getObservationDetails": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observations/assessment`,
    "passbookUpdate": `${process.env.HOST}api/user/v1/passbook`,
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
        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
    }
}

// Function to handle missing parameters and return an appropriate response
const handleMissingParams = (params, input, res) => {
    console.log(input)
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

const updateMenteeObservationDetails = async (mentoring_relationship_id, solution_id, details) => {
    try {
        logger.info("Inside updateMenteeObservationDetails")
        const observationInstance = await MentoringObservation.findOne({
            where: {
                mentoring_relationship_id,
                solution_id,
            }
        });
        if (observationInstance) {
            await observationInstance.update(details)
            logger.info("DB update successfull for observation submission")
            return true
        } else {
            return false
        }
    } catch (error) {
        logger.info("Something went wrong while updating mentee observation details")
        return false
    }
}
const insertMenteeAttemptDetails = async (mentor_id, mentee_id, mentoring_relationship_id, solution_id, submission_id, attempt_serial_number, user_submission) => {
    try {
        logger.info("Inside insertMenteeAttemptDetails")
        logger.info(mentor_id, mentee_id, mentoring_relationship_id, solution_id, submission_id, attempt_serial_number, user_submission)
        const attemptInstance = await MenteeSubmissionAttempts.create({ mentor_id, mentee_id, mentoring_relationship_id, solution_id, submission_id, attempt_serial_number, user_submission });
        if (attemptInstance) {
            logger.info("Attempt insertion successfull for observation submission")
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        logger.info("Something went wrong while inserting attempts")
        return false
    }
}
const updateMenteeAttemptDetails = async (submission_id, details) => {
    logger.info("Inside updateMenteeAttemptDetails")
    // const menteeAttemptUpdate = await MenteeSubmissionAttempts.findOne({
    //     where: {
    //         submission_id: submission_id
    //     }
    // });
    // console.log(submission_id)
    // console.log(menteeAttemptUpdate)
    // console.log(details)
    const result = await MenteeSubmissionAttempts.update(
        details,
        {
            where: {
                submission_id: submission_id, // replace with the actual submission_id value
            },
        }
    );
    if (result[0] > 0) {
        console.log('Record updated successfully');
        return true
    } else {
        console.log('No records updated');
    }
    // if (menteeAttemptUpdate) {
    //     await menteeAttemptUpdate.update(details)
    //     logger.info("DB update successfull for observation submission")
    //     return true
    // } else {
    //     return false
    // }
}
export const updateSubmissionandCompetency = async (req, res) => {
    const { mentee_id, mentoring_relationship_id, competency_name, competency_id, competency_level_id, solution_name, solution_id } = req.body;
    //Call solution details API and get the result and update passbook accordingly
    try {
        await axios({
            data: {
                request: {
                    userId: mentee_id,
                    typeName: 'competency',
                    competencyDetails: [
                        {
                            competencyId: competency_id.toString(),
                            additionalParams: {
                                competencyName: competency_name
                            },
                            acquiredDetails: {
                                acquiredChannel: 'admin',
                                competencyLevelId: competency_level_id,
                                additionalParams: {
                                    competencyName: competency_name,
                                    courseName: "Obs-" + solution_name,
                                    courseId: solution_id,
                                    solutionName: solution_name,
                                    solutionId: solution_id
                                },
                            },
                        },
                    ],
                }
            },
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "Authorization": process.env.SB_API_KEY,
                "X-authenticated-user-token": req.headers["x-authenticated-user-token"],
                "x-authenticated-userid": mentee_id
            },
            method: 'PATCH',
            url: `${API_ENDPOINTS.passbookUpdate}`,
        })

    } catch (error) {
        logger.info("Something went wrong while passbook update")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while passbook update" });


    }
    const menteeObservationUpdationStatus = updateMenteeObservationDetails(mentoring_relationship_id, solution_id, {
        submission_status: 'submitted',
    })
    if (menteeObservationUpdationStatus) {
        res.status(200).json({
            message: 'Submission status and Passbook updated successfully',
        });
    }
    else {
        res.status(404).json({
            message: 'Something went wrong while updating passboook and submission status',
        });
    }

}
export const menteeConsolidatedObservationAttempts = async (req, res) => {
    logger.info("Inside menteeConsolidatedObservationAttempts ")
    try {
        const { mentor_id, mentee_id } = req.query
        const menteeAttemptInstance = await MenteeSubmissionAttempts.findAll({
            where: {
                mentor_id,
                mentee_id
            }
        });
        logger.info(menteeAttemptInstance)
        res.status(200).json(menteeAttemptInstance)
    } catch (error) {
        console.log(error)
        res.status(400).json({
            "message": "Something went wrong while fetching observations"
        })
    }

}
//Function to get result of the submitted observations through DBFind API in ml-core service
export const getObservationSubmissionResult = async (req, res) => {
    try {
        const submission_id = req.body.submission_id;
        const submissionResult = await axios({
            data: {
                "query": {
                    "_id": submission_id
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
        logger.info(submissionResult.data.result[0].pointsBasedPercentageScore)


        if (submissionResult) {
            const attemptResultUpdateDetails = {
                result_percentage: Math.round(submissionResult.data.result[0].pointsBasedPercentageScore),
                total_score: Math.round(submissionResult.data.result[0].pointsBasedMaxScore),
                acquired_score: Math.round(submissionResult.data.result[0].pointsBasedScoreAchieved)
            }
            await updateMenteeAttemptDetails(submission_id, attemptResultUpdateDetails)
        }
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
        const { mentee_id, mentor_id, solution_id, submission_id, attempted_count, mentoring_relationship_id, submission_data } = req.body;
        if (handleMissingParams(["mentee_id", "mentor_id", "solution_id", "submission_id", "attempted_count", "mentoring_relationship_id", "submission_data"], req.body, res)) return;
        const submitObservationDetails = await axios({
            headers: observationServiceHeaders(req),
            method: 'POST',
            data: submission_data,
            url: `${API_ENDPOINTS.submitObservation}/${submission_id}`
        })
        logger.info("submit observation details")
        logger.info(submitObservationDetails.data)
        if (submitObservationDetails) {
            const menteeObservationUpdationStatus = updateMenteeObservationDetails(mentoring_relationship_id, solution_id, {
                attempted_count: Sequelize.literal('"attempted_count" + 1')
            })
            logger.info(menteeObservationUpdationStatus)
            const insertionStatus = insertMenteeAttemptDetails(mentor_id, mentee_id, mentoring_relationship_id, solution_id, submission_id, attempted_count, submission_data)
            logger.info(insertionStatus)

            if (menteeObservationUpdationStatus && insertionStatus) {
                logger.info("inside if")

                return res.status(200).json({
                    "message": "SUCCESS",
                    "data": submitObservationDetails.data
                })
            }
            res.status(400).json({
                "message": "SUCCESS",
                "data": "Something went wrong while submitting observation"
            })
        }

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
        const { observation_id, mentee_id } = req.query;
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
        const { observation_id, mentee_id, submission_number } = req.query
        if (handleMissingParams(["observation_id", "mentee_id", "submission_number"], req.query, res)) return;
        const observationDetails = await axios({
            params: {
                "entityId": mentee_id,
                "submissionNumber": submission_number
            },
            headers: observationServiceHeaders(req),
            data: {
                "users": req.mentorId,
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
        console.log(req.body)
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
                    message: 'OTP verification completed successfully',
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
                "message": "Mentee already verified for the given observation"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            "message": "Error occurred while observation verification"
        })
    }

}



