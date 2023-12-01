export function requestValidator(requiredParams, requestBody) {
    const missingParams = [];

    for (const param of requiredParams) {
        if (!(param in requestBody)) {
            missingParams.push(param);
        }
    }

    return missingParams;
}
// Example usage:
// const requiredParams = ['name', 'email', 'age'];
// const requestBody = {
//     name: 'Amit Kumar',
//     age: 25,
// };

// const missingParams = validateRequestBody(requiredParams, requestBody);

// if (missingParams.length > 0) {
//     console.log(`Missing parameters: ${missingParams.join(', ')}`);
// } else {
//     console.log('All required parameters present');
// }