const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"],
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
    },
    activities: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Activity' 
    }],
    weather: {
        type: String
    },
    temperature: {
        type: Number
    },
    cost: {
        type: Number,
    }
  })

module.exports = mongoose.model('Day', DaySchema);