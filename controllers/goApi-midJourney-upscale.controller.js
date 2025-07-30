const axios = require('axios');
const configData = require('../utils/goApi-midjourney-config')

async function goApiUpscale(taskId) {
    try {
        const goApiMidjourneyUpscaleData = {
            origin_task_id: taskId,
            index: process.env.GO_API_UPSCALE_INDEX
        };
        const goApiUpscaleUrl = process.env.GO_API_URL + '/upscale';
        const upscaleConfig = configData.goApiMidJourneyPostConfig(goApiUpscaleUrl, process.env.GO_API_MIDJOURNEY_KEY, goApiMidjourneyUpscaleData);
        const goApiUpscaleResponse = await axios.request(upscaleConfig);

        if (goApiUpscaleResponse.data.success === true && goApiUpscaleResponse.status === 200) {
            return goApiUpscaleResponse.data;
        } else {
            throw {
                success: false,
                message: "Error in Go API Mid-Journey Upscel"
            }
        }
    } catch (error) {
        console.error('Error in calling Go Upscale API Mid-Journey:', error.message);
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
    goApiUpscale
}