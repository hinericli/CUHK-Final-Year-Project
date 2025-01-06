const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/myDatabase');

const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon opening the database successfully
db.once('open', function () {
  console.log("Connection is open...");
  const Schema = mongoose.Schema;

  const ActivitySchema = Schema({
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
        type: String,
        required: [true, "Place is required"],
    },
    cost: {
        type: Number,
        validate: {
            validator: function (value) {
              return value > 0;
            },
            message: () => "Please enter a valid cost",
          }
    },
    description: {
        type: String,
    }
  });
  const Activity = mongoose.model("Activity", ActivitySchema);

  const DaySchema = Schema({
    day: {
        type: Number,
        required: [true, "Day is required"],
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
    },
    activities: {
        type: Schema.Types.ObjectId, ref: 'Activity' 
    },
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
  const Day = mongoose.model("Day", DaySchema);

  const PlanSchema = Schema({
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
    dayList: {
        type: Schema.Types.ObjectId, ref: 'Day' 
    },
    dayCount: { 
        type: Number
    },
    cost: {
        type: Number,
        validate: {
            validator: function (value) {
              return value > 0;
            },
            message: () => "Please enter a valid cost",
          }
    }
  })
  const Plan = mongoose.model("Plan", PlanSchema);

  module.exports = { Activity, Day, Plan };

  // list specific plan accoding to planId
  app.get('/plan/:planId', async (req, res) => {
    const planId = req.params.planId;

    Plan.find({ planId: {$eq: planId} })//.populate('loc')
    .then((data) => {
        console.log(data)
        res.set('Content-Type', 'text/plain');

        res.send("Check console.")
    })
    .catch((err) => {
        console.error(err);
        res.status(404).send('PlanID Not Found');
    });
});

  // handle ALL requests
  app.all('/*', (req, res) => {
    // send this to client
    res.send('Hello World!');
  });
})

// listen to port 3000
const server = app.listen(3000);

/*

  // creating a mongoose model
  const EventSchema = mongoose.Schema({
    eventID: {
      type: Number,
      required: [true, "Name is required"],
    },
    location: {
      type: String,
      required: true,
    },
    quota: {
      type: Number,
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: () => "Please enter a valid quota",
      },
    },
  });
  
  const Event = mongoose.model("Event", EventSchema);
  
  //Creating a new event
  let newEvent = new Event({
    eventID: 123,
    location: "SHB130",
    quota: 9999,
  });

  //Saving this new event to database
  newEvent
    .save()
    .then(() => {
      console.log("a new event created successfully");
    })
    .catch((error) => {
      console.log("failed to save new event");
    });
  
  // Read all data
  Event.find({})
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log("failed to read");
  });  

  // Search for quota >= 500
  Event.find({ quota: { $gte: 500 } })
  .then((data) => console.log("the event with quota more than 500:", data))
  .catch((error) => console.log(error));

  // update the location if quota >= 500
  Event.findOneAndUpdate(
      { quota: { $gte:500 } },  
      { location:"Large Conference Room"}, 
      { new: true},  
    )
    .then((data) => {console.log('the updated data is:', data)})
    .catch((error) => console.log(error));

  // delete the event if quota >= 500
  Event.findOneAndDelete(
    { quota: { $gte:500 } }  
  )
  .then((data) => {console.log('the deleted data is:', data)})
  .catch((error) => console.log(error));
*/