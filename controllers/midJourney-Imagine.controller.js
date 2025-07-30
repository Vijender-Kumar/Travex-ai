const axios = require('axios');
const configData = require('../utils/midjourney-config')

async function imagineAPI(randomDescription) {
    try {
        const midjourneyImagineData = {
            prompt: randomDescription
        };
        const imagineUrl = process.env.API_URL + '/imagine';
        const imagineConfig = configData.midJourneyPostConfig(imagineUrl, process.env.MIDJOURNEY_API_KEY, midjourneyImagineData);
        const imagineResponse = await axios.request(imagineConfig);

        if (imagineResponse.data.success === true && imagineResponse.status === 200) {
            return imagineResponse.data;
        } else {
            throw {
                success: false,
                message: "Error in Mid-Journey imagine api"
            }
        }
    } catch (error) {
        console.error('Error in calling Mid-Journey imagine api:', error.message);
        const errorData = {
            success: false,
            error: error.message
        }
        return errorData;
    }
}

module.exports = {
    imagineAPI
}