import { Keycloak } from "keycloak-backend"
import { logger } from "./logger";
export let authCheck = async (req, res, next) => {
    let authenticatedToken = req.headers["x-authenticated-user-token"];
    logger.info('Entered into auth check');
    if (!authenticatedToken) {
        return res.status(401).json({ error: 'Unauthorized - Token missing' });
    }
    try {
        const keycloak = new Keycloak({
            "realm": "sunbird",
            "keycloak_base_url": process.env.KEYCLOAK_BASE_URL,
            "client_id": process.env.CLIENT_ID,
            "is_legacy_endpoint": false
        })
        const token = await keycloak.jwt.verify(authenticatedToken)
        const decodedTokenArray = token.content.sub.split(":")
        const userId = decodedTokenArray[decodedTokenArray.length - 1]
        req.userId = userId
        console.log(req.userId)
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });

    }
}
module.exports = { authCheck }