const axios = require('axios');
const configData = require('../utils/goApi-midjourney-config')

async function goApiFetchData(taskId) {
    try {
        const goApiMidjourneyFetchData = {
            task_id: taskId
        };
        const goApiFetchUrl = process.env.GO_API_URL + '/fetch';
        const fetchConfig = configData.goApiMidJourneyFetchConfig(goApiFetchUrl, goApiMidjourneyFetchData);
        const getImageResponse = await axios.request(fetchConfig);

        return getImageResponse.data;
    } catch (error) {
        console.error('Error in calling Go Fetch api:', error.message);
        const errorData = {
            success: false,
            error: error.message
        }
        return errorData;
    }
}

module.exports = {
    goApiFetchData,
}