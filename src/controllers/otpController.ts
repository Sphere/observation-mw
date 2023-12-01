const axios = require("axios")
import { requestValidator } from "../utils/requestValidator"


const API_ENDPOINTS = {
    USER_SEARCH: `${process.env.LEARNER_SERVICE_API_BASE}/private/user/v1/search`,
    SEND_OTP: "https://control.msg91.com/api/v5/otp",
    RESEND_OTP: "https://control.msg91.com/api/v5/otp/retry",
    VERIFY_OTP: "https://control.msg91.com/api/v5/otp/verify",

}
const msg91AuthKey = process.env.MSG_91_AUTH_KEY
const msg91TemplateId = process.env.MSG_91_TEMPLATE_ID

// Function to handle missing parameters and return an appropriate response
const handleMissingParams = (params, req, res) => {
    const missingParams = requestValidator(params, req.query);
    if (missingParams.length > 0) {
        return res.status(400).json({
            "type": "Failed",
            "error": `Missing parameters: ${missingParams.join(', ')}`
        });
    }
    return false;
};

// Endpoint for sending OTP
const sendOtp = async (req, res) => {
    const phone = req.query.phone;
    // Check for missing parameters
    if (handleMissingParams(["phone"], req, res)) return;
    try {
        const userSearch = await axios({
            data: {
                request: {
                    filters: { phone },
                    query: "",
                },
            },
            method: "POST",
            url: API_ENDPOINTS.USER_SEARCH,
        });
        userSearch.data.result.response.count = 1;
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
        // Handle errors
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });

    }
}
// Endpoint for verifying OTP
const verifyOtp = async (req, res) => {
    const otp = req.query.otp;
    const phone = req.query.phone;
    // Check for missing parameters
    if (handleMissingParams(["otp", "phone"], req, res)) return;
    try {
        // Verify OTP using Msg91 API
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
        // Handle errors
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });

    }

}
// Endpoint for resending OTP
const resendOtp = async (req, res) => {
    const phone = req.query.phone;
    // Check for missing parameters
    if (handleMissingParams(["otp", "phone"], req, res)) return;
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
        return res.status(500).json({ "type": "Failed", "error": "Internal Server Error" });

    }

}
module.exports = { sendOtp, verifyOtp, resendOtp }