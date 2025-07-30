const promptsData = require('../models/goapi-prompts-data-schema')
const goApiMidJourneyDataLog = require('../models/goapi-midJourney-log-schema')
const bodyParser = require('body-parser');
const { goApiImagine, goApiFetchData, goApiUpscale } = require('../controllers/index')

module.exports = (app, connection) => {
    app.use(bodyParser.json());

    app.post(`${process.env.API_VERSION}/goapi-midjourney-api`, async (req, res) => {
        try {
            const apiName = "GO-MID-JOURNEY-API"
            const requestId = `${process.env.COMPANY_NAME}-${apiName}-${Date.now()}`
            const { eventId } = req.body;
            const randomPrompt = await promptsData.findOneByEventId(eventId);
            if (!randomPrompt) {
                return res.status(404).send({
                    success: false,
                    error: `No data found for this eventId: ${eventId}`
                });
            }

            const goApiMidJourneyLog = {
                eventId: randomPrompt.eventId,
                eventname: randomPrompt.eventname,
                requestId: requestId,
            }
            await goApiMidJourneyDataLog.addNew(goApiMidJourneyLog);

            const randomIndex = Math.floor(Math.random() * randomPrompt.descriptions.length);
            const randomDescription = randomPrompt.descriptions[randomIndex].description;
            console.log("Prompt used in Go API Mid Journey API:", randomDescription);

            await goApiMidJourneyDataLog.updatePromptByRequestId(requestId, randomDescription);

            const goApiImagineResponse = await goApiImagine(randomDescription);
            if (!goApiImagineResponse.success) {
                let errorObj = {
                    error: goApiImagineResponse.error
                };
                if (goApiImagineResponse.status_code) {
                    errorObj.status_code = goApiImagineResponse.status_code;
                }
                throw errorObj;
            }
            const fetchImagineTaskId = goApiImagineResponse.task_id
            await goApiMidJourneyDataLog.updateFullImageTaskId(requestId, fetchImagineTaskId)

            let getFullImageResponse = await goApiFetchData(fetchImagineTaskId);

            while (getFullImageResponse.status === 'pending' || getFullImageResponse.status === 'processing') {
                const progressData = {
                    success: true,
                    progress: getFullImageResponse.status,
                    message: "Full image progress data is not completed yet"
                };
                console.log("Full Image Progress:", progressData);

                await goApiMidJourneyDataLog.updateFullImageProgressByRequestId(requestId, getFullImageResponse.status);

                await new Promise(resolve => setTimeout(resolve, 3000));
                getFullImageResponse = await goApiFetchData(fetchImagineTaskId);
            }

            await goApiMidJourneyDataLog.updateFullImageProgressByRequestId(requestId, getFullImageResponse.status);
            if (getFullImageResponse.status === 'finished') {
                await goApiMidJourneyDataLog.updateFullImageUrl(requestId, getFullImageResponse.task_result.image_url)

                const upscaleImageResponse = await goApiUpscale(fetchImagineTaskId)
                const upscaleImageTaskId = upscaleImageResponse.task_id;
                await goApiMidJourneyDataLog.updateUpscaleImageTaskId(requestId, upscaleImageTaskId)
                let getUpscaleImageResponse = await goApiFetchData(upscaleImageTaskId);

                while (getUpscaleImageResponse.status === 'pending' || getUpscaleImageResponse.status === 'processing') {
                    const progressData = {
                        success: true,
                        progress: getUpscaleImageResponse.status,
                        message: "Upscale image progress data is not completed yet"
                    }
                    console.log("Upscale Image Progress:", progressData)

                    await goApiMidJourneyDataLog.updateUpscaleImageProgressByRequestId(requestId, getUpscaleImageResponse.status);

                    await new Promise(resolve => setTimeout(resolve, 3000));
                    getUpscaleImageResponse = await goApiFetchData(upscaleImageTaskId);
                }
                await goApiMidJourneyDataLog.updateUpscaleImageProgressByRequestId(requestId, getUpscaleImageResponse.status)

                if (getUpscaleImageResponse.status === 'finished') {
                    await goApiMidJourneyDataLog.updateUpscaleImageUrl(requestId, getUpscaleImageResponse.task_result.image_url)
                    return res.status(200).send({
                        success: true,
                        message: "Image has been generated successfully",
                        data: {
                            finalImageUrl: getUpscaleImageResponse.task_result.image_url
                        }
                    })
                } else {
                    throw {
                        error: "Error in generating the upscale image",
                        success: false
                    }
                }
            } else {
                throw {
                    error: "Error in generating the full image",
                    success: false
                }
            }
        } catch (error) {
            let errorMessage;
            let statusCode = 500;
            if (error.status_code === 402) {
                statusCode = 402;
                errorMessage = error.error;
            } else {
                errorMessage = error.success === false ? 'Please contact administrator' : 'Internal Server Error';
            }

            res.status(statusCode).send({
                success: false,
                error: errorMessage
            });
        }
    });
}