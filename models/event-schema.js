var autoIncrement = require('mongoose-auto-increment');
var mongoose = require('mongoose');

var imageUrlSchema = mongoose.Schema({
    imageUrl: {
        type: String,
        allowNull: true,
        unique: false,
    }
}, { _id: false });

const eventSchema = mongoose.Schema(
    {
        id: {
            type: Number,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        eventType: {
            type: String,
            allowNull: false,
        },
        eventname: {
            type: String,
            allowNull: false,
        },
        imageUrls: [imageUrlSchema],
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
eventSchema.plugin(autoIncrement.plugin, 'event_id');
var eventDataSchema = (module.exports = mongoose.model(
    'event_data',
    eventSchema,
));

module.exports.addNew = async (eventdata) => {
    var insertdata = new eventDataSchema(eventdata);
    return insertdata.save();
};

module.exports.findOneByEventname = async (eventname) => {
    try {
        const data = await eventDataSchema.findOne({ eventname });
        return data;
    } catch (err) {
        console.log(err);
    }
};

module.exports.findAll = async () => {
    try {
        const alleventData = await eventDataSchema.find().lean().select('-updated_at -__v -isDelete ');
        const events = alleventData.map(data => data.eventname);
        return events;
    } catch (err) {
        console.log(err);
    }
}

module.exports.findOneByEventAndUrl = async (eventname, imageUrl) => {
    try {
        const data = await eventDataSchema.findOne({ eventname });
        if (data) {
            const matchingImageUrls = data.imageUrls.filter(desc => desc.imageUrl === imageUrl);
            if (matchingImageUrls.length > 0) {
                return true;
            }
        }
        return false;
    } catch (err) {
        console.log(err);
    }
};

module.exports.findOneByEventType = async (eventType) => {
    try {
        const data = await eventDataSchema.findOne({ eventType });
        return data;
    } catch (err) {
        console.log(err);
    }
};

module.exports.findLatest = async (eventType) => {
    try {
        const latestEventData = await eventDataSchema
            .find({ eventType })
            .sort({ created_at: -1 })
            .limit(8)
            .lean()
            .select('-updated_at -__v -isDelete');
        const imageUrlData = latestEventData.map(event => ({
            ...event,
            imageUrl: event.imageUrls.length > 0 ? event.imageUrls[0].imageUrl : ''
        }))
        return imageUrlData;
    } catch (err) {
        console.log(err);
    }
};

module.exports.updateImageUrl = async (eventname, imageUrl) => {
    try {
        const updatedDocument = await eventDataSchema.findOneAndUpdate(
            { eventname },
            { $push: { imageUrls: { $each: [imageUrl] } } },
            { new: true }
        );
        return updatedDocument;
    } catch (err) {
        console.log(err);
    }
};

module.exports.regenerateImage = async (_id) => {
    try {
        const data = await eventDataSchema.findOne({ _id });
        if (data) {
            const randomIndex = Math.floor(Math.random() * data.imageUrls.length);
            const randomImageUrl = data.imageUrls[randomIndex].imageUrl;
            return randomImageUrl;
        }
        return false;
    } catch (err) {
        console.log(err);
    }
};

module.exports.findAllByEventType = async (eventType) => {
    try {
        const events = await eventDataSchema.find({ eventType }).lean();
        return events;
    } catch (err) {
        console.log(err);
    }
};