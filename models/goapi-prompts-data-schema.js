var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
mongoose.Promise = global.Promise;

var descriptionSchema = mongoose.Schema({
    description: {
        type: String,
        allowNull: true,
        unique: false,
    }
}, { _id: false });

var goApiPromptsData = mongoose.Schema(
    {
        id: {
            type: Number,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        eventId: {
            type: Number,
            allowNull: false,
        },
        eventname:{
            type: String,
            allowNull: false,
        },
        descriptions: [descriptionSchema],
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

autoIncrement.initialize(mongoose.connection);
goApiPromptsData.plugin(autoIncrement.plugin, 'goapi_prompt_id');
var goApiPromptsDataLog = (module.exports = mongoose.model(
    'goapi_prompts_data',
    goApiPromptsData,
));

module.exports.addNew = async (goApiPromptsData) => {
    var insertdata = new goApiPromptsDataLog(goApiPromptsData);
    return insertdata.save();
};

module.exports.findOneByEventname = async (eventname) => {
    try {
        const data = await goApiPromptsDataLog.findOne({ eventname });
        return data;
    } catch (err) {
        console.log(err);
    }
};

module.exports.findOneByEventId = async (eventId) => {
    try {
        const data = await goApiPromptsDataLog.findOne({ eventId });
        return data;
    } catch (err) {
        console.log(err);
    }
};

module.exports.findOneByEventAndDescription = async (eventname, description) => {
    try {
        const data = await goApiPromptsDataLog.findOne({ eventname });
        if (data) {
            const matchingDescriptions = data.descriptions.filter(desc => desc.description === description);
            if (matchingDescriptions.length > 0) {
                return true;
            }
        }
        return false;
    } catch (err) {
        console.log(err);
    }
};

module.exports.updatePromptLog = async (eventname, description) => {
    try {
        const updatedDocument = await goApiPromptsDataLog.findOneAndUpdate(
            { eventname },
            { $push: { descriptions: { $each: [description] } } },
            { new: true }
        );
        return updatedDocument;
    } catch (err) {
        console.log(err);
    }
};
