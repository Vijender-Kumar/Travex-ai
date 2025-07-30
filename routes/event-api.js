const eventData = require("../models/event-schema")
const bodyParser = require('body-parser');
const { fetchImageFromGoogleDrive, fetchImageFromMidJourneyUrl, extractFileId } = require('../services/fetchImageUrls')

module.exports = (app, connection) => {
    app.use(bodyParser.json());

    app.post(`${process.env.API_VERSION}/add-event`, async (req, res) => {
        try {
            const { eventname, imageUrl, event_type } = req.body;
            if (!eventname || eventname.trim() === '') {
                return res.status(400).send({
                    success: false,
                    error: 'eventname field is required'
                });
            }
            if (!event_type || event_type.trim() === '') {
                return res.status(400).send({
                    success: false,
                    error: 'event_type field is required'
                });
            }
            if (event_type.trim().toUpperCase() !== 'DESTINATION' && (!imageUrl || imageUrl.trim() === '')) {
                return res.status(400).send({
                    success: false,
                    error: 'imageUrl field is required'
                });
            }
            const reqData = {
                eventType: event_type.toUpperCase(),
                eventname: eventname.toUpperCase(),
                imageUrls: event_type.trim().toUpperCase() === "DESTINATION" ? [] : [{ imageUrl }],
            }

            const searchEvent = await eventData.findOneByEventname(reqData.eventname);

            if (searchEvent) {
                return res.status(400).send({
                    success: false,
                    message: `Event ${reqData.eventname} already present`
                })
            } else {
                const addData = await eventData.addNew(reqData);
                return res.status(200).send({
                    success: true,
                    message: `New event ${reqData.eventname} added`
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    app.post(`${process.env.API_VERSION}/add-event-image`, async (req, res) => {
        try {
            const { eventname, imageUrl } = req.body;
            if (!eventname || eventname.trim() === '') {
                return res.status(400).send({
                    success: false,
                    error: 'eventname field is required'
                });
            }
            if (!imageUrl || imageUrl.trim() === '') {
                return res.status(400).send({
                    success: false,
                    error: 'imageUrl field is required'
                });
            }
            const reqData = {
                eventname: eventname.toUpperCase(),
                imageUrls: [{ imageUrl }],
            }

            const searchEvent = await eventData.findOneByEventname(reqData.eventname);
            const existingEventUrl = await eventData.findOneByEventAndUrl(reqData.eventname, imageUrl);
            if (searchEvent) {
                if (!existingEventUrl) {
                    const urlObj = { imageUrl };
                    const updateData = await eventData.updateImageUrl(reqData.eventname, urlObj);
                    return res.status(200).send({
                        success: true,
                        message: `Url added to ${reqData.eventname} eventname`
                    });
                } else {
                    return res.status(400).send({
                        success: false,
                        message: `Url already present`
                    });
                }
            } else {
                return res.status(404).send({
                    success: true,
                    message: `Event ${reqData.eventname} not found`
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    app.get(`${process.env.API_VERSION}/get-destinations`, async (req, res) => {
        try {
            const eventType = "DESTINATION";
            const events = await eventData.findAllByEventType(eventType);

            if (!events || events.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No events found for the given event type.'
                });
            }
            const finalDestinations = events.map(event => ({
                _id: event._id,
                eventname: event.eventname
            }));

            return res.status(200).send({
                success: true,
                destinations: finalDestinations
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    })

    app.get(`${process.env.API_VERSION}/get-event/:event_type`, async (req, res) => {
        try {
            const eventType = req.params.event_type;
            if (!eventType || eventType.trim() === '') {
                return res.status(400).send({
                    success: false,
                    error: 'eventType required in url params'
                });
            }
            const event_type = eventType.toUpperCase();
            const searchEventType = await eventData.findOneByEventType(event_type)
            if (!searchEventType) {
                return res.status(400).send({
                    success: false,
                    message: `eventType ${event_type} not found`
                })
            } else {
                const getEvent = await eventData.findLatest(event_type);
                const extractFileIdPromises = getEvent.map(async event => ({
                    eventId: event._id,
                    eventType: event.eventType,
                    eventname: event.eventname,
                    originalUrl: event.imageUrl,
                    downloadUrl: event.imageUrl.includes("drive.google.com")
                        ? `https://drive.google.com/uc?export=download&id=${await extractFileId(event.imageUrl)}`
                        : event.imageUrl,
                    imageUrl: event.imageUrl.includes("drive.google.com")
                        ? `https://drive.google.com/thumbnail?id=${await extractFileId(event.imageUrl)}`
                        : event.imageUrl
                }));
                const outputData = await Promise.all(extractFileIdPromises);
                return res.status(200).send({
                    success: true,
                    data: outputData,
                    message: `Latest data fetched for ${event_type}`
                })
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // app.get(`${process.env.API_VERSION}/get-event/:event_type`, async (req, res) => {
    //     try {
    //         const eventType = req.params.event_type;
    //         if (!eventType || eventType.trim() === '') {
    //             return res.status(400).send({
    //                 success: false,
    //                 error: 'eventType required in url params'
    //             });
    //         }
    //         const event_type = eventType.toUpperCase();
    //         const searchEventType = await eventData.findOneByEventType(event_type)
    //         if (!searchEventType) {
    //             return res.status(400).send({
    //                 success: false,
    //                 message: `eventType ${event_type} not found`
    //             })
    //         } else {
    //             const getEvent = await eventData.findLatest(event_type);
    //             const outputData = getEvent.map(event => ({
    //                 eventId: event._id,
    //                 eventType: event.eventType,
    //                 eventname: event.eventname,
    //                 imageUrl: event.imageUrl
    //             }));
    //             return res.status(200).send({
    //                 success: true,
    //                 data: outputData,
    //                 message: `Latest data fetched for ${event_type}`
    //             })
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).send({
    //             success: false,
    //             error: 'Internal server error'
    //         });
    //     }
    // });


    app.get(`${process.env.API_VERSION}/regenerate-event-image/:_id`, async (req, res) => {
        try {
            const eventId = parseInt(req.params._id);
            if (eventId === null) {
                return res.status(400).send({
                    success: false,
                    error: '_id required in url params'
                });
            }
            if (isNaN(eventId)) {
                return res.status(400).send({
                    success: false,
                    error: '_id must be a valid integer'
                });
            }
            const newImageUrl = await eventData.regenerateImage(eventId)
            if (newImageUrl === false) {
                return res.status(404).send({
                    success: false,
                    error: '_id not found'
                });
            }

            const regenerateUrl = {
                originalUrl: newImageUrl,
                downloadUrl: newImageUrl.includes("drive.google.com")
                    ? `https://drive.google.com/uc?export=download&id=${await extractFileId(newImageUrl)}`
                    : newImageUrl,
                imageUrl: newImageUrl.includes("drive.google.com")
                    ? `https://drive.google.com/thumbnail?id=${await extractFileId(newImageUrl)}`
                    : newImageUrl
            }
            return res.status(200).send({
                success: true,
                data: regenerateUrl,
                message: "New Image fetched"
            })
        } catch (error) {
            console.error(error);
            return res.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // app.get(`${process.env.API_VERSION}/regenerate-event-image/:_id`, async (req, res) => {
    //     try {
    //         const eventId = parseInt(req.params._id);
    //         if (eventId === null) {
    //             return res.status(400).send({
    //                 success: false,
    //                 error: '_id required in url params'
    //             });
    //         }
    //         if (isNaN(eventId)) {
    //             return res.status(400).send({
    //                 success: false,
    //                 error: '_id must be a valid integer'
    //             });
    //         }
    //         const newImageUrl = await eventData.regenerateImage(eventId)
    //         if (newImageUrl === false) {
    //             return res.status(404).send({
    //                 success: false,
    //                 error: '_id not found'
    //             });
    //         }
    //         return res.status(200).send({
    //             success: true,
    //             data: newImageUrl,
    //             message: "New Image fetched"
    //         })
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).send({
    //             success: false,
    //             error: 'Internal server error'
    //         });
    //     }
    // });

    app.get(`${process.env.API_VERSION}/fetch-event-image`, async (req, res) => {
        const imageUrl = req.body.url;

        try {
            if (!imageUrl) {
                return res.status(400).send(
                    {
                        success: false,
                        error: 'URL parameter is required'
                    });
            }

            let imageData;
            if (imageUrl.startsWith('https://drive.google')) {
                imageData = await fetchImageFromGoogleDrive(imageUrl);
                res.set('Content-Type', 'image/jpeg');
            } else if (imageUrl.startsWith('https://cdn.discordapp')) {
                imageData = await fetchImageFromMidJourneyUrl(imageUrl);
                res.set('Content-Type', imageData.headers['content-type'])
            }
            else {
                return res.status(400).send(
                    {
                        success: false,
                        error: 'Unsupported URL'
                    });
            }

            imageData.pipe(res);
        } catch (error) {
            console.error("Error in fetching the image:", error);
            return res.status(500).send({
                success: false,
                error: 'Internal server error'
            });
        }
    });
}