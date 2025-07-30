const axios = require('axios');
const configData = require('../utils/goApi-midjourney-config')

async function goApiImagine(randomDescription) {
    try {
        const goApiMidjourneyImagineData = {
            prompt: randomDescription,
            aspect_ratio: process.env.ASPECT_RATIO,
            process_mode: process.env.PROCESS_MODE,
        };
        const goApiImagineUrl = process.env.GO_API_URL + '/v2/imagine';
        const imagineConfig = configData.goApiMidJourneyPostConfig(goApiImagineUrl, process.env.GO_API_MIDJOURNEY_KEY, goApiMidjourneyImagineData);
        const goApiImagineResponse = await axios.request(imagineConfig);

        if (goApiImagineResponse.data.success === true && goApiImagineResponse.status === 200) {
            return goApiImagineResponse.data;
        } else {
            throw {
                success: false,
                message: "Error in Go API Mid-Journey imagine"
            }
        }
    } catch (error) {
        console.error('Error in calling Go Imagine API Mid-Journey:', error.message);
        let errorData = {
            success: false,
            error: error.message
        };

        if (error.response && error.response.status === 402) {
            errorData.error = "Please check your GoAPI account for the credits";
            errorData.status_code = 402
        }

        return errorData;
    }
}

module.exports = {
    goApiImagine
}