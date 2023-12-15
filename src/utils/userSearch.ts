import { logger } from "./logger";

const axios = require("axios")
const cassandra = require('cassandra-driver');

const cassandraPort = process.env.CASSANDRA_PORT;
const client = new cassandra.Client({
    contactPoints: [cassandraPort],
    keyspace: 'sunbird',
    localDataCenter: 'datacenter1',
})
const userSearchRoute = `${process.env.LEARNER_SERVICE_API_BASE}/private/user/v1/search`
const descryptionServiceRoute = `${process.env.DECRYPTION_API_BASE}/decrypt`
export let userSearch = async (userAttributes) => {
    return await axios({
        data: {
            request: {
                filters: userAttributes,
                query: "",
            },
        },
        method: "POST",
        url: userSearchRoute
    });
}
export const userContactInfo = async (userId) => {
    logger.info("entered inside user contact info")
    const query = `SELECT * FROM user WHERE userId ='${userId}' ALLOW FILTERING`;
    const cassandraUserInfo = await client.execute(query)
    const userPhone = cassandraUserInfo.rows[0].phone;
    logger.info(userPhone);
    logger.info("userPhone")
    const decryptedData = await axios({
        data: {
            values: [userPhone],
        },
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        url: descryptionServiceRoute
    });
    console.log(decryptedData)
    logger.info(decryptedData.data[0])
    return decryptedData.data[0]
}

