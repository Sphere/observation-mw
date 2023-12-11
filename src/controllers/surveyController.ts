import axios from "axios";
import { logger } from "../utils/logger";
const API_ENDPOINTS = {
    "getSurveyDetails": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/surveys/details`,
    "verifySurveyLink": `${process.env.ML_CORE_SERVICE_API_BASE}/v1/solutions/verifyLink`
}
//End-points for verifying survey link
const verifySurveyLink = async (req, res) => {
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
};

//Endpoints for getting survey details
const getSurveyDetails = async (req, res) => {
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
};
module.exports = { getSurveyDetails, verifySurveyLink }