const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
    },
    description: {
      type: String,
    }
  });

module.exports = mongoose.model('Place', PlaceSchema);