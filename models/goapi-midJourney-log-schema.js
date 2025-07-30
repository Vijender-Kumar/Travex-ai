var mongoose = require('mongoose');

const goApiMidJourneySchema = mongoose.Schema(
    {
        requestId: {
            type: String,
            allowNull: false,
        },
        eventId: {
            type: Number,
            allowNull: false,
        },
        eventname: {
            type: String,
            allowNull: false,
        },
        goApiPromptUsed: {
            type: String,
            allowNull: true,
        },
        fullImageprogress: {
            type: String,
            enum: ['pending', 'processing', 'finished'],
            allowNull: true,
        },
        fullImageTaskId: {
            type: String,
            allowNull: true,
        },
        fullImageUrl: {
            type: String,
            allowNull: true,
        },
        upscaleImageprogress: {
            type: String,
            enum: ['pending', 'processing', 'finished'],
            allowNull: true,
        },
        upscaleImageTaskId: {
            type: String,
            allowNull: true,
        },
        upscaleImageUrl: {
            type: String,
            allowNull: true,
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

var goApiMidJourneyDataSchema = (module.exports = mongoose.model(
    'goapi-midjourney-data-log',
    goApiMidJourneySchema,
));

module.exports.addNew = async (logData) => {
    var insertdata = new goApiMidJourneyDataSchema(logData);
    return insertdata.save();
};

module.exports.findOneByRequestId = async (requestId) => {
    try {
        const data = await goApiMidJourneyDataSchema.findOne({ requestId });
        return data;
    } catch (err) {
        console.log(err);
    }
};

module.exports.updatePromptByRequestId = async (requestId, prompt) => {
    try {
        return await goApiMidJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { goApiPromptUsed: prompt } },
            { new: true }
        );
    } catch (error) {
        console.error('Error updating prompt by requestId ${requestId}:', error);
        throw error;
    }
};

module.exports.updateFullImageProgressByRequestId = async (requestId, progress) => {
    try {
        return await goApiMidJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { fullImageprogress: progress } },
            { new: true }
        );
    } catch (error) {
        console.error('Error updating full image progress by requestId ${requestId}:', error);
        throw error;
    }
};

module.exports.updateUpscaleImageProgressByRequestId = async (requestId, progress) => {
    try {
        return await goApiMidJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { upscaleImageprogress: progress } },
            { new: true }
        );
    } catch (error) {
        console.error('Error updating button image progress by requestId ${requestId}:', error);
        throw error;
    }
};

module.exports.updateFullImageTaskId = async (requestId, fullImageTaskId) => {
    try {
        return await goApiMidJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { fullImageTaskId: fullImageTaskId } },
            { new: true }
        );
    } catch (error) {
        console.error(`Error updating fullImageTaskId by requestId ${requestId}:`, error);
        throw error;
    }
};

module.exports.updateFullImageUrl = async (requestId, fullImageUrl) => {
    try {
        return await goApiMidJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { fullImageUrl: fullImageUrl } },
            { new: true }
        );
    } catch (error) {
        console.error(`Error updating fullImageUrl by requestId ${requestId}:`, error);
        throw error;
    }
};

module.exports.updateUpscaleImageTaskId = async (requestId, upscaleImageTaskId) => {
    try {
        return await goApiMidJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { upscaleImageTaskId: upscaleImageTaskId } },
            { new: true }
        );
    } catch (error) {
        console.error(`Error updating fullImageTaskId by requestId ${requestId}:`, error);
        throw error;
    }
};

module.exports.updateUpscaleImageUrl = async (requestId, upscaleImageUrl) => {
    try {
        return await goApiMidJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { upscaleImageUrl: upscaleImageUrl } },
            { new: true }
        );
    } catch (error) {
        console.error(`Error updating upscaleImageUrl by requestId ${requestId}:`, error);
        throw error;
    }
};