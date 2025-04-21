const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    type: {
        type: String,
    },
    startDateTime: {
        type: Date,
        required: [true, "Start date and time is required"],
    },
    endDateTime: {
        type: Date,
        required: [true, "End date and time is required"],
    },
    place: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Place',
        required: [true, "Place is required"],
    },
    cost: {
        type: Number,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: () => "Please enter a valid cost",
        }
    },
    description: {
        type: String,
    },
    isVisited: {
        type: Boolean,
        default: false,
        description: "Indicates whether the user has visited the place in the activity",
    },
    subActivities: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Activity',
        description: "List of smaller activities associated with this activity",
    }]
});

module.exports = mongoose.model('Activity', ActivitySchema);