const promptsData = require('../models/prompts-data-schema')
const midJourneyDataLog = require('../models/midJourney-log-schema')
const bodyParser = require('body-parser');
const { imagineAPI, buttonAPI, getImageData } = require('../controllers/index')

module.exports = (app, connection) => {
    app.use(bodyParser.json());

    app.post(`${process.env.API_VERSION}/midjourney-api`, async (req, res) => {
        try {
            const apiName = "MID-JOURNEY"
            const requestId = `${process.env.COMPANY_NAME}-${apiName}-${Date.now()}`
            const { eventId } = req.body;
            const randomPrompt = await promptsData.findOneByEventId(eventId);
            if (!randomPrompt) {
                return res.status(404).send({
                    success: false,
                    error: `No data found for this eventId: ${eventId}`
                });
            }

            const midJourneyLog = {
                eventId: randomPrompt.eventId,
                eventname: randomPrompt.eventname,
                requestId: requestId,
            }
            await midJourneyDataLog.addNew(midJourneyLog);

            const randomIndex = Math.floor(Math.random() * randomPrompt.descriptions.length);
            const randomDescription = randomPrompt.descriptions[randomIndex].description;
            console.log("Prompt used in Mid Journey API:", randomDescription);

            const insertPrompt = midJourneyDataLog.updatePromptByRequestId(requestId, randomDescription);

            const imagineResponse = await imagineAPI(randomDescription);
            if (!imagineResponse.success) {
                throw {
                    error: imagineResponse.error
                }
            }

            const imagineResponseMessageId = imagineResponse.messageId
            const updateFullImageId = await midJourneyDataLog.updateFullImageMessageId(requestId, imagineResponseMessageId)

            let getFullImageResponse = await getImageData(imagineResponseMessageId);

            while (getFullImageResponse.progress < 100 || getFullImageResponse.progress === undefined) {
                const progressData = {
                    success: true,
                    progress: getFullImageResponse.progress || 0,
                    message: "Full image progress data is not completed yet"
                }
                console.log("Full Image Progress:", progressData)

                const updateProgress = await midJourneyDataLog.updateFullImageProgressByRequestId(requestId, getFullImageResponse.progress)

                await new Promise(resolve => setTimeout(resolve, 3000));
                getFullImageResponse = await getImageData(imagineResponseMessageId);
            }
            
            const updateProgress = await midJourneyDataLog.updateFullImageProgressByRequestId(requestId, getFullImageResponse.progress)

            if (getFullImageResponse.progress === 100) {
                const updateFullUrl = await midJourneyDataLog.updateFullImageUrl(requestId, getFullImageResponse.uri)
                const imagineResponseMessageId = imagineResponse.messageId

                const buttonApiResponse = await buttonAPI(imagineResponseMessageId)
                const buttonImageMessageId = buttonApiResponse.messageId
                const updateButtonId = await midJourneyDataLog.updateButtonImageMessageId(requestId, buttonImageMessageId)

                let getbuttonImageResponse = await getImageData(buttonImageMessageId);

                while (getbuttonImageResponse.progress < 100 || getbuttonImageResponse.progress === undefined) {
                    const progressData = {
                        success: true,
                        progress: getbuttonImageResponse.progress || 0,
                        message: "Button image progress data is not completed yet"
                    }
                    console.log("Button Image Progress:", progressData)

                    const updateProgress = await midJourneyDataLog.updateButtonImageProgressByRequestId(requestId, getbuttonImageResponse.progress)
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    getbuttonImageResponse = await getImageData(buttonImageMessageId);
                }

                const updateProgress = await midJourneyDataLog.updateButtonImageProgressByRequestId(requestId, getbuttonImageResponse.progress)

                if (getbuttonImageResponse.progress === 100) {
                    const updateButtonUrl = await midJourneyDataLog.updateButtonImageUrl(requestId, getbuttonImageResponse.uri)

                    return res.status(200).send({
                        success: true,
                        message: "Image has been generated successfully",
                        data: {
                            finalImageUrl: getbuttonImageResponse.uri
                        }
                    })
                } else {
                    throw {
                        error: "Error in generating the button image",
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
            console.error('Error in midjourney:', error);
            const errorMessage = error.success === false ? 'Please contact administrator' : 'Internal Server Error';

            res.status(500).send({
                success: false,
                error: errorMessage
            });
        }
    });
    

    // DUMMY DATA For Midjourney API
    app.post('/midjourney-api-v1', async (req, res) => {
        try {
            return res.status(200).send({
                success: true,
                message: "Image has been generated successfully",
                data: {
                    finalImageUrl: process.env.DUMMY_MID_JOURNEY_IMAGE_URL
                }
            })

        } catch (error) {
            console.error('Error in midjourney:', error);
            res.status(500).send({
                success: false,
                error: 'Internal Server Error'
            });
        }
    });
}