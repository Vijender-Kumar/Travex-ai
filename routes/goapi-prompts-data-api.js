const promptsData = require("../models/goapi-prompts-data-schema")
const eventData = require("../models/event-schema")
const bodyParser = require('body-parser');

module.exports = (app, connection) => {
    app.use(bodyParser.json());

    app.post(`${process.env.API_VERSION}/add-goapi-prompt`, async (req, res) => {
        try {
            const { eventname, description } = req.body;
            if (!eventname || eventname.trim() === '') {
                return res.status(400).send({
                    success: false,
                    error: 'eventname field is required'
                });
            }
            if (!description || description.trim() === '') {
                return res.status(400).send({
                    success: false,
                    error: 'description field is required'
                });
            }

            const eventNameData = await eventData.findOneByEventname(eventname.toUpperCase());
            if (!eventNameData) {
                return res.status(404).send({
                    success: false,
                    error: `Data not found for ${eventname}`
                })
            } else {
                const eventId = eventNameData._id;

                const reqData = {
                    eventId: eventId,
                    eventname: eventname.toUpperCase(),
                    descriptions: [{ description }],
                }

                const existingData = await promptsData.findOneByEventname(reqData.eventname);
                const existingDataDesc = await promptsData.findOneByEventAndDescription(reqData.eventname, description);

                if (existingData) {
                    if (!existingDataDesc) {
                        const descriptionObj = { description };
                        await promptsData.updatePromptLog(reqData.eventname, descriptionObj);
                        return res.status(200).send({
                            success: true,
                            message: `Description added to ${reqData.eventname} eventname`
                        });
                    } else {
                        return res.status(400).send({
                            success: false,
                            message: `Description already present in ${reqData.eventname} eventname`
                        });
                    }
                } else {
                    await promptsData.addNew(reqData)
                    return res.status(200).send({
                        success: true,
                        message: `New Description added to ${reqData.eventname} eventname`
                    });
                }
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });
}