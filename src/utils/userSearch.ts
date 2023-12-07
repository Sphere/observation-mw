const axios = require("axios")

const userSearchRoute = `${process.env.LEARNER_SERVICE_API_BASE}/private/user/v1/search`
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