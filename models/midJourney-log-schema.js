var mongoose = require('mongoose');

const midJourneySchema = mongoose.Schema(
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
        promptUsed: {
            type: String,
            allowNull: true,
        },
        fullImageprogress: {
            type: Number,
            default: 0,
        },
        fullImageMessageId: {
            type: String,
            allowNull: true,
        },
        fullImageUrl: {
            type: String,
            allowNull: true,
        },
        buttonImageprogress: {
            type: Number,
            default: 0,
        },
        buttonImageMessageId: {
            type: String,
            allowNull: true,
        },
        buttonImageUrl: {
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

var midJourneyDataSchema = (module.exports = mongoose.model(
    'midjourney-data-log',
    midJourneySchema,
));

module.exports.addNew = async (logData) => {
    var insertdata = new midJourneyDataSchema(logData);
    return insertdata.save();
};

module.exports.findOneByRequestId = async (requestId) => {
    try {
        const data = await midJourneyDataSchema.findOne({ requestId });
        return data;
    } catch (err) {
        console.log(err);
    }
};

module.exports.updatePromptByRequestId = async (requestId, prompt) => {
    try {
        return await midJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { promptUsed: prompt } },
            { new: true }
        );
    } catch (error) {
        console.error('Error updating prompt by requestId ${requestId}:', error);
        throw error;
    }
};

module.exports.updateFullImageProgressByRequestId = async (requestId, progress) => {
    try {
        return await midJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { fullImageprogress: progress } },
            { new: true }
        );
    } catch (error) {
        console.error('Error updating full image progress by requestId ${requestId}:', error);
        throw error;
    }
};

module.exports.updateButtonImageProgressByRequestId = async (requestId, progress) => {
    try {
        return await midJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { buttonImageprogress: progress } },
            { new: true }
        );
    } catch (error) {
        console.error('Error updating button image progress by requestId ${requestId}:', error);
        throw error;
    }
};

module.exports.updateFullImageMessageId = async (requestId, fullImageMessageId) => {
    try {
        return await midJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { fullImageMessageId: fullImageMessageId } },
            { new: true }
        );
    } catch (error) {
        console.error(`Error updating fullImageMessageId by requestId ${requestId}:`, error);
        throw error;
    }
};

module.exports.updateFullImageUrl = async (requestId, fullImageUrl) => {
    try {
        return await midJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { fullImageUrl: fullImageUrl } },
            { new: true }
        );
    } catch (error) {
        console.error(`Error updating fullImageUrl by requestId ${requestId}:`, error);
        throw error;
    }
};

module.exports.updateButtonImageMessageId = async (requestId, buttonImageMessageId) => {
    try {
        return await midJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { buttonImageMessageId: buttonImageMessageId } },
            { new: true }
        );
    } catch (error) {
        console.error(`Error updating fullImageMessageId by requestId ${requestId}:`, error);
        throw error;
    }
};

module.exports.updateButtonImageUrl = async (requestId, buttonImageUrl) => {
    try {
        return await midJourneyDataSchema.findOneAndUpdate(
            { requestId: requestId },
            { $set: { buttonImageUrl: buttonImageUrl } },
            { new: true }
        );
    } catch (error) {
        console.error(`Error updating buttonImageUrl by requestId ${requestId}:`, error);
        throw error;
    }
};