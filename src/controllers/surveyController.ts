import axios from "axios";
import jwt_decode from 'jwt-decode'
const API_ENDPOINTS = {
    "getSurveyDetails": `${process.env.ML_SURVEY_SERVICE_API_BASE}/v1/surveys/details`
}
const authenticatedToken = 'x-authenticated-user-token'
const decodeToken = (req: any, res: any) => {
    try {
        const accessToken = req.headers[authenticatedToken]
        // tslint:disable-next-line: no-any
        const decodedToken: any = jwt_decode(accessToken.toString())
        const decodedTokenArray = decodedToken.sub.split(':')
        const userId = decodedTokenArray[decodedTokenArray.length - 1]
        return {
            accessToken,
            decodedToken,
            status: 200,
            userId,
        }
    } catch (error) {
        return res.status(404).json({
            message: 'User token missing or invalid',
            redirectUrl: 'https://sphere.aastrika.org/public/home',
        })
    }
}

const getSurveyDetails = async (req, res) => {
    const solutionId = req.query.solutionId
    const userToken = req.headers["x-authenticated-user-token"]
    const accessTokenValidity = decodeToken(req, res)
    if (accessTokenValidity.status = 200) {
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
    }

};
module.exports = { getSurveyDetails }