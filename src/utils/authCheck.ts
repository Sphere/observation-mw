import { Keycloak } from "keycloak-backend"
import { logger } from "./logger";
import axios from "axios";

const API_ENDPOINTS = {
    "userRead": `${process.env.HOST}api/user/v1/read`,
}
export let authCheck = async (req: any, res: any, next: any) => {
    let authenticatedToken = req.headers["x-authenticated-user-token"];
    logger.info('Entered into auth check');
    if (!authenticatedToken) {
        return res.status(401).json({ error: 'Unauthorized - Token missing' });
    }
    try {
        const keycloak = new Keycloak({
            "realm": "sunbird",
            "keycloak_base_url": process.env.KEYCLOAK_BASE_URL || "",
            "client_id": process.env.CLIENT_ID || "",
            "is_legacy_endpoint": false
        })
        const token = await keycloak.jwt.verify(authenticatedToken)
        const decodedTokenArray = token.content.sub.split(":")
        const userId = decodedTokenArray[decodedTokenArray.length - 1]
        const userRoles = await userRoleCheck(authenticatedToken, userId);
        // if (!userRoles.includes("OBS_MENTOR")) {
        //     return res.status(401).json({ error: 'Invalid user role: Expected OBS_MENTOR role' });
        // }
        req.mentorId = userId
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });

    }
}
const userRoleCheck = async (userToken: any, userId: String) => {
    const userReadResponse = await axios({
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "Authorization": process.env.SB_API_KEY,
            "X-authenticated-user-token": userToken,
        },
        method: 'GET',
        url: `${API_ENDPOINTS.userRead}/${userId}`,
    })
    return userReadResponse.data.result.response.roles

}
module.exports = { authCheck }