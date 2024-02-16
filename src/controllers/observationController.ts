import axios from "axios";
import { logger } from "../utils/logger";
import { requestValidator } from "../utils/requestValidator"
import { MentoringRelationship } from "../models/mentoringRelationshipModel"
import { MentoringObservation } from "../models/mentoringObservationModel"
import { MenteeSubmissionAttempts } from "../models/menteeSubmissionAttemptsModel"
import { Sequelize } from 'sequelize';
import { ObservationData } from "../models/observationMetaModel";
import { AddEntityToObservationRequestQuery, GetobservationDetailsRequestQuery, ObservationOtpVerificationRequestBody, SubmitObservationRequestBody, menteeConsolidatedObservationAttemptsV2QueryParams } from "../interfaces/observationControllerInterfaces";
import { ApiResponse } from '../utils/apiResponse';
import { Request, Response } from 'express';



const API_ENDPOINTS = {
    "getObservationDetails": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observations/assessment`,
    "passbookUpdate": `${process.env.HOST}api/user/v1/passbook`,
    "verifyObservationLink": `${process.env.ML_CORE_SERVICE_API_BASE}/v1/solutions/verifyLink`,
    "getSolutionsList": `${process.env.HOST}api/observationmw/v1/observation/getSolutionsList`,
    "verifyOtp": `${process.env.HOST}api/observationmw/v1/otp/verifyOtp`,
    "getEntity": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observations/entities`,
    "submitObservation": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observationSubmissions/update`,
    "addEntityToObservation": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/observations/updateEntities`,
    "dbFind": `${process.env.ML_CORE_SERVICE_API_BASE}/v1/admin/dbFind/observationSubmissions`
}
const observationServiceHeaders = (req: Request) => {
    return {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": process.env.SB_API_KEY,
        "X-authenticated-user-token": req.headers["x-authenticated-user-token"],
        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
    }
}

// Function to handle missing parameters and return an appropriate response
const handleMissingParams = (params: any, input: any, res: Response) => {
    const missingParams = requestValidator(params, input);
    if (missingParams.length > 0) {
        logger.info(missingParams, "Parameters missing")
        return res.status(400).json({
            "type": "Failed",
            "error": `Missing parameters: ${missingParams.join(', ')}`
        });
    }
    return false;
};
//Function to get entity ID for the mentor
const getEntitiesForMentor = async (req: Request) => {
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

const updateMenteeObservationDetails = async (mentoring_relationship_id: string, solution_id: string, details: any) => {
    try {
        logger.info("Inside updateMenteeObservationDetails")
        logger.info(details)
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
        console.log(error)
        logger.info("Something went wrong while updating mentee observation details")
        return false
    }
}
const insertMenteeAttemptDetails = async (mentor_id: string, mentee_id: string, mentoring_relationship_id: string, solution_id: string, submission_id: string, attempt_serial_number: number, user_submission: any, observation_id: string) => {
    try {
        logger.info("Inside insertMenteeAttemptDetails")
        logger.info(mentor_id, mentee_id, mentoring_relationship_id, solution_id, submission_id, attempt_serial_number, user_submission, observation_id)
        const attemptInstance = await MenteeSubmissionAttempts.create({ mentor_id, mentee_id, mentoring_relationship_id, solution_id, submission_id, attempt_serial_number, user_submission, observation_id });
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
const updateMenteeAttemptDetails = async (submission_id: string, details: any) => {
    logger.info("Inside updateMenteeAttemptDetails")
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
}
//Function to submit observation
const checkSubmissionEligibilty = async (solution_id: string, mentoring_relationship_id: string, req: Request) => {
    const observationInstance: any = await MentoringObservation.findOne({
        where: {
            mentoring_relationship_id,
            solution_id,
        }
    });
    if (observationInstance) {
        const otp_verified_on = observationInstance.otp_verified_on
        const solutionsData = await axios({
            data: {
                "solution_id": solution_id
            },
            headers: observationServiceHeaders(req),
            method: 'GET',
            url: `${API_ENDPOINTS.getSolutionsList}`,
        })
        const duration = solutionsData.data[0].duration
        const submissionTime = Date.now()
        const differenceInSeconds = Math.floor((submissionTime - otp_verified_on.getTime()) / 1000);
        if (differenceInSeconds < duration) {
            return true
        }
    }
    return false
}
export const getSolutionsList = async (req: Request, res: Response) => {
    try {
        const filters = req.body
        logger.info(filters)
        const solutionDetails = await ObservationData.findAll({
            where: filters
        });
        logger.info(solutionDetails)
        res.status(200).json(solutionDetails)
    } catch (error) {
        res.status(400).json(
            { "type": "Failed", "error": "Something went wrong while fetching list of solutions" }
        )
    }

}
export const getMentorAssignedSolutionsList = async (req: Request, res: Response) => {
    const mentorId = req.query.mentorId;
    MentoringRelationship.hasMany(MentoringObservation, {
        foreignKey: 'mentoring_relationship_id',
    });
    MentoringObservation.hasMany(ObservationData, {
        foreignKey: 'solution_id',
    });
    const solutionsData = await MentoringRelationship.findAll({
        attributes: ['mentoring_relationship_id'],
        include: [
            {
                model: MentoringObservation,
                attributes: ['solution_id',],
                include: [{
                    model: ObservationData,
                    as: 'observationData',
                    attributes: ['solution_id', 'solution_name']
                }]
            },
        ],
        where: { mentor_id: mentorId },
        subQuery: false,
    });
    const solutionIdNameMap: { [key: string]: string } = {};
    solutionsData.forEach((item: any) => {
        item.mentoring_observations?.forEach((obs: any) => {
            const solutionId = obs.observationData?.solution_id;
            const solutionName = obs.observationData?.solution_name;
            if (solutionId && solutionName) {
                solutionIdNameMap[solutionId] = solutionName;
            }
        });
    });
    res.status(200).json({ "message": "SUCCESS", solutionsList: solutionIdNameMap }
    )

}
export const updateSubmissionandCompetency = async (req: Request, res: Response) => {
    const { mentee_id, mentoring_relationship_id, competency_name, competency_id, competency_level_id, solution_name, solution_id, is_passbook_update_required } = req.body;
    //Call solution details API and get the result and update passbook accordingly
    if (!is_passbook_update_required) {
        await updateMenteeObservationDetails(mentoring_relationship_id, solution_id, {
            otp_verification_status: '',
        })
        return res.status(200).json({ "type": "Success", "error": "Attempt successful" });

    }
    try {
        const passbookData = await axios({
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
        logger.info("passbook data")
        logger.info(passbookData)
    } catch (error) {
        logger.info("Something went wrong while passbook update")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while passbook update" });


    }
    const menteeObservationUpdationStatus = await updateMenteeObservationDetails(mentoring_relationship_id, solution_id, {
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
export const menteeConsolidatedObservationAttempts = async (req: Request, res: Response) => {
    logger.info("Inside menteeConsolidatedObservationAttempts ")
    try {
        const { mentor_id, mentee_id } = req.query

        MenteeSubmissionAttempts.hasOne(ObservationData, {
            foreignKey: 'solution_id',
            sourceKey: 'solution_id',
        });
        const menteeAttemptInstance = await MenteeSubmissionAttempts.findAll({
            where: {
                mentor_id,
                mentee_id
            }, include: [
                {
                    model: ObservationData,
                    as: 'observationAttemptsMetaData',
                    attributes: ['solution_id', 'solution_name', 'competency_data', 'duration']
                },
            ],
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
//Function to get mentee submissionattempts grouped by solution Id or mentee Id  
export const menteeConsolidatedObservationAttemptsV2 = async (req: Request & { mentorId?: string }, res: Response) => {
    logger.info("Inside menteeConsolidatedObservationAttempts v2")
    try {
        const { menteeId = "", solutionId = "", groupBy = "" }: menteeConsolidatedObservationAttemptsV2QueryParams = req.query
        const filters: Record<string, string | undefined> = {
            "mentor_id": req.mentorId,
            "mentee_id": menteeId,
            "solution_id": solutionId
        }
        if (!filters.mentee_id && !filters.solution_id) {
            const apiResponse: ApiResponse<string> = {
                timestamp: Date.now(),
                status: 'error',
                message: "Mandatory Parameters MenteeId/SolutionId missing",
            };
            return res.status(400).json(apiResponse)
        }
        if (groupBy === "mentee_id") {
            delete filters.mentee_id
        }
        if (groupBy === "solution_id") {
            delete filters.solution_id
        }

        MenteeSubmissionAttempts.hasOne(ObservationData, {
            foreignKey: 'solution_id',
            sourceKey: 'solution_id',
        });
        const menteeAttemptInstance: any = await MenteeSubmissionAttempts.findAll({
            where: filters, include: [
                {
                    model: ObservationData,
                    as: 'observationAttemptsMetaData',
                    attributes: ['solution_id', 'solution_name', 'competency_data', 'duration']
                },
                {
                    model: MentoringRelationship,
                    attributes: ["mentor_name", "mentee_name", "mentee_contact_info"],
                    as: 'attemptsMentoringRelationshipMapping'
                }
            ],
        });
        const menteeAttemptsData = menteeAttemptInstance.reduce((grouped: any, item: any) => {
            const key = item[groupBy];
            const observation_name = item.observationAttemptsMetaData.solution_name;
            if (!grouped[key]) {
                grouped[key] = {
                    attempts: [],
                    solution_name: observation_name,
                };
            }
            grouped[key].attempts.push(item);
            return grouped;
        }, {});
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'success',
            data: menteeAttemptsData,
        };
        res.status(200).json(apiResponse);
    } catch (error) {
        console.log(error)
        const apiResponse: ApiResponse = {
            timestamp: Date.now(),
            status: 'error',
            message: 'An error occurred while fetching mentee attempts.',
        };
        res.status(400).json(apiResponse)
    }

}
//Function to get result of the submitted observations through DBFind API in ml-core service
export const getObservationSubmissionResult = async (req: Request, res: Response) => {
    try {
        const submission_id: string = req.body.submission_id;
        if (!submission_id) {
            const apiResponse: ApiResponse<string> = {
                timestamp: Date.now(),
                status: 'error',
                message: "Mandatory parameters Submission Id missing"
            };
            return res.status(500).json(apiResponse);
        }
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
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'success',
            data: submissionResult.data
        };
        res.status(200).json(apiResponse)
    } catch (error) {
        logger.error(error, "Something went wrong while getting observation result")
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'error',
            message: "Something went wrong while getting observation result"
        };
        return res.status(500).json(apiResponse);
    }

}
//Function to submit observation
export const submitObservation = async (req: Request & { mentorId?: string }, res: Response) => {
    try {
        let mentorId = req.mentorId || ""
        let { mentee_id = "", solution_id = "", submission_id = "", attempted_count = 0, mentoring_relationship_id = "", submission_data, observation_id = "" }: SubmitObservationRequestBody = req.body;
        if (handleMissingParams(["mentee_id", "solution_id", "submission_id", "attempted_count", "mentoring_relationship_id", "submission_data"], req.body, res)) return;
        if (!checkSubmissionEligibilty(solution_id, mentoring_relationship_id, req)) {
            const apiResponse: ApiResponse<string> = {
                timestamp: Date.now(),
                status: 'error',
                "message": "Mentee not allowed for submission"
            };
            return res.status(400).json(apiResponse)
        }
        const submitObservationDetails = await axios({
            headers: observationServiceHeaders(req),
            method: 'POST',
            data: submission_data,
            url: `${API_ENDPOINTS.submitObservation}/${submission_id}`
        })
        if (submitObservationDetails) {
            const menteeObservationUpdationStatus = updateMenteeObservationDetails(mentoring_relationship_id, solution_id, {
                attempted_count: Sequelize.literal('"attempted_count" + 1')
            })
            logger.info(menteeObservationUpdationStatus)
            const insertionStatus = insertMenteeAttemptDetails(mentorId, mentee_id, mentoring_relationship_id, solution_id, submission_id, attempted_count, submission_data, observation_id)
            logger.info(insertionStatus)

            if (await menteeObservationUpdationStatus && await insertionStatus) {
                const apiResponse: ApiResponse<string> = {
                    timestamp: Date.now(),
                    status: 'success',
                    data: submitObservationDetails.data
                };
                return res.status(200).json(apiResponse)
            }
            const apiResponse: ApiResponse<string> = {
                timestamp: Date.now(),
                status: 'error',
                "message": "Something went wrong while submitting observation"
            };
            res.status(400).json(apiResponse)
        }

    } catch (error) {
        logger.error(error, "Something went wrong while submitting observation")
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'error',
            "message": "Something went wrong while submitting observation"
        };
        return res.status(500).json(apiResponse);
    }

}
//End-points for verifying observation link
export const verifyobservationLink = async (req: Request, res: Response) => {
    try {
        logger.info("Inside verify observation link route");
        const observationLink = req.query.observationLink
        if (!observationLink) {
            const apiResponse: ApiResponse<string> = {
                timestamp: Date.now(),
                status: 'error',
                message: "Mandatory parameter Observation Link cannot be empty"
            };
            return res.status(400).json(apiResponse);
        }
        const observationDetails = await axios({
            params: {
                "createProject": "false"
            },
            headers: observationServiceHeaders(req),
            method: 'POST',
            url: `${API_ENDPOINTS.verifyObservationLink}/${observationLink}`,
        })
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'success',
            data: observationDetails.data
        };
        res.status(200).json(apiResponse)
    } catch (error) {
        logger.error(error, "Something went wrong while verifying observation link")
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'error',
            message: "Something went wrong while verifying observation link"
        };
        return res.status(500).json(apiResponse);
    }

};
//Function to add entities to the observation
export const addEntityToObservation = async (req: Request, res: Response) => {
    try {
        const { observation_id, mentee_id }: AddEntityToObservationRequestQuery = req.query;
        if (handleMissingParams(["observation_id", "mentee_id"], req.query, res)) return;
        const addEntityDetails = await axios({
            headers: observationServiceHeaders(req),
            data: {
                data: [mentee_id]
            },
            method: 'POST',
            url: `${API_ENDPOINTS.addEntityToObservation}/${observation_id}`,
        })
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'success',
            "data": addEntityDetails.data
        };
        res.status(200).json(apiResponse)
    } catch (error) {
        logger.error(error, "Something went wrong while adding entity to observation")
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'error',
            "message": "Something went wrong while adding entity to observation"
        };
        return res.status(500).json(apiResponse);
    }

}
//Endpoints for getting observation details
export const getobservationDetails = async (req: Request & { mentorId?: string }, res: Response) => {
    try {
        logger.info("Inside observation details route");
        const { observation_id, mentee_id, submission_number }: GetobservationDetailsRequestQuery = req.query
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
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'success',
            "data": observationDetails.data
        };
        res.status(200).json(apiResponse)
    } catch (error) {
        logger.error(error, "Something went wrong while fetching observation questions")
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'error',
            "message": "Something went wrong while fetching observation questions"
        };
        return res.status(500).json(apiResponse);
    }

};
export const observationOtpVerification = async (req: Request, res: Response) => {
    logger.info("Observation verification OTP route");
    try {
        const { otp, mentor_id, mentee_id, solution_id }: ObservationOtpVerificationRequestBody = req.body;
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
            const apiResponse: ApiResponse<string> = {
                timestamp: Date.now(),
                status: 'error',
                "message": "Unable to fulfill the verify OTP request due to a third-party API failure."
            };
            return res.status(500).json(apiResponse);
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
                //Update the observation instance
                const mentorEntityData = await getEntitiesForMentor(req);
                if (!mentorEntityData) {
                    const apiResponse: ApiResponse<string> = {
                        timestamp: Date.now(),
                        status: 'error',
                        "message": "Mentee Not Found with the respective solution Id"
                    };
                    return res.status(400).json(apiResponse);
                }
                const observation_id = mentorEntityData.data.result["_id"]
                await observationInstance.update({
                    otp_verification_status: 'verified',
                    observation_id: observation_id,
                    otp_verified_on: new Date()

                });
                logger.info("DB update successfull for OTP verification")
                const apiResponse: ApiResponse<string> = {
                    timestamp: Date.now(),
                    status: 'success',
                    data: observation_id
                };
                return res.status(200).json(apiResponse);
            } else {
                const apiResponse: ApiResponse<string> = {
                    timestamp: Date.now(),
                    status: 'error',
                    "message": "Observation not found"
                };
                return res.status(400).json(apiResponse);
            }
        }
        else if (otpVerified.data.type == "error") {
            const apiResponse: ApiResponse<string> = {
                timestamp: Date.now(),
                status: 'error',
                "message": "Mentee already verified for the given observation"
            };
            res.status(400).json(apiResponse)
        }
    } catch (error) {
        const apiResponse: ApiResponse<string> = {
            timestamp: Date.now(),
            status: 'error',
            "message": "Error occurred while observation verification"
        };
        res.status(500).json(apiResponse)
    }

}



