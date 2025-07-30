const axios = require('axios');
const configData = require('../utils/midjourney-config')

async function buttonAPI(imagineResponseMessageId) {
    try {
        const midjourneyButtonData = {
            messageId: imagineResponseMessageId,
            button: process.env.IMAGE_BUTTON
        };
        const buttonUrl = process.env.API_URL + '/button';
        const buttonConfig = configData.midJourneyPostConfig(buttonUrl, process.env.MIDJOURNEY_API_KEY, midjourneyButtonData);
        const buttonResponse = await axios.request(buttonConfig);
        if (buttonResponse.data.success === true && buttonResponse.status === 200) {
            return buttonResponse.data;
        } else {
            throw {
                success: false,
                message: "Error in Mid-Journey button api"
            }
        }
    } catch (error) {
        console.error('Error in calling Mid-Journey button api:', error.message);
        const errorData = {
            success: false,
            error: error.message
        }
        return errorData;
    }
}

module.exports = {
    buttonAPI
}