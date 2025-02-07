const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    planId: {
        type: Number,
        required: [true, "Plan ID is required"],
    },
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    startingDate: {
        type: Date,
        required: [true, "Starting date is required"],
    },
    endingDate: {
        type: Date,
        required: [true, "Ending date is required"],
    },
    dayList: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Day' 
    }],
    dayCount: { 
        type: Number
    },
    cost: {
        type: Number,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: () => "Please enter a valid cost",
            }
    }
})

module.exports = mongoose.model('Plan', PlanSchema);