import axios from "axios"
import { requestValidator } from "../utils/requestValidator"
import { logger } from "../utils/logger"
import { userContactInfo } from "../utils/userSearch"
const API_ENDPOINTS = {
    USER_SEARCH: `${process.env.LEARNER_SERVICE_API_BASE}/private/user/v1/search`,
    SEND_OTP: "https://control.msg91.com/api/v5/otp",
    RESEND_OTP: "https://control.msg91.com/api/v5/otp/retry",
    VERIFY_OTP: "https://control.msg91.com/api/v5/otp/verify",

}
const msg91AuthKey = process.env.MSG_91_AUTH_KEY
const msg91TemplateId = process.env.MSG_91_TEMPLATE_ID
const countryCode = "+91";
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
// Endpoint for sending OTP
export const sendOtp = async (req, res) => {
    const menteeId = req.query.menteeId;
    if (handleMissingParams(["menteeId"], req.query, res)) return;
    let phone = await userContactInfo(menteeId)
    phone = countryCode + phone;
    logger.info(phone)
    logger.info(menteeId)
    logger.info('Entered into send otp route');
    // Check for missing parameters
    try {
        const userSearch = await axios({
            data: {
                request: {
                    filters: { phone: phone },
                    query: "",
                },
            },
            method: "POST",
            url: API_ENDPOINTS.USER_SEARCH,
        });
        userSearch.data.result.response.count = 1;
        logger.info(userSearch.data.result.response, "User search reponse from learner service")
        if (userSearch.data.result.response.count > 0) {
            // Send OTP using Msg91 API
            const sendOtpResponse = await axios({
                params: {
                    mobile: phone,
                    template_id: msg91TemplateId
                },
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "authkey": msg91AuthKey
                },
                method: 'POST',
                url: API_ENDPOINTS.SEND_OTP,
            })
            res.status(200).json(sendOtpResponse.data)
        }
    } catch (error) {
        logger.error(error, "Something went wrong while sending OTP")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while sending OTP" });

    }
}
// Endpoint for verifying OTP
export const verifyOtp = async (req, res) => {
    const [otp, menteeId] = req.query;
    if (handleMissingParams(["otp", "menteeId"], req.query, res)) return;
    let phone = await userContactInfo(menteeId);
    phone = countryCode + phone;
    try {
        // Verify OTP using Msg91 API
        logger.info("Inside verify OTP route");
        const verifyOtpResponse = await axios({
            params: {
                mobile: phone,
                otp
            },
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "authkey": msg91AuthKey
            },
            method: 'GET',
            url: API_ENDPOINTS.VERIFY_OTP,
        })
        res.status(200).json(verifyOtpResponse.data)
    } catch (error) {
        logger.error(error, "Something went wrong while sending OTP")
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });

    }
}
// Endpoint for resending OTP
export const resendOtp = async (req, res) => {
    logger.info("Inside resend OTP route")
    const phone = req.query.phone;
    if (handleMissingParams(["phone"], req.query, res)) return;
    try {
        // Resend OTP using Msg91 API
        const verifyOtpResponse = await axios({
            params: {
                mobile: phone,
                "retrytype": "text"
            },
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "authkey": msg91AuthKey
            },
            method: 'GET',
            url: API_ENDPOINTS.RESEND_OTP,
        })
        res.status(200).json(verifyOtpResponse.data)
    } catch (error) {
        logger.error(error, "Something went wrong while resending OTP")
        return res.status(500).json({ "type": "Failed", "error": "Something went wrong while resending OTP" });

    }

}
