export function requestValidator(requiredParams, requestBody) {
    const missingParams = [];
    for (const param of requiredParams) {
        if (!(param in requestBody)) {
            missingParams.push(param);
        }
    }
    return missingParams;
}
