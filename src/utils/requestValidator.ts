export function requestValidator(requiredParams: any, requestBody: any) {
    const missingParams = [];
    for (const param of requiredParams) {
        if (!(param in requestBody)) {
            missingParams.push(param);
        }
    }
    return missingParams;
}
