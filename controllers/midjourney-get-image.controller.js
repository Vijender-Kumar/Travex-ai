const axios = require('axios');
const configData = require('../utils/midjourney-config')

async function getImageData(imageResponseMessageId) {
    try {
        const getImage = process.env.API_URL + `/message/${imageResponseMessageId}`;
        const getImageConfig = configData.midJourneyGetConfig(getImage, process.env.MIDJOURNEY_API_KEY);

        const getImageResponse = await axios.request(getImageConfig);

        return getImageResponse.data;
    } catch (error) {
        console.error('Error in calling Mid-Journey getImage api:', error.message);
        const errorData = {
            success: false,
            error: error.message
        }
        return errorData;
    }
}

module.exports = {
    getImageData
}