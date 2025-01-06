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
  // --- Setup MongoDB Schema ---
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
              return value >= 0;
            },
            message: () => "Please enter a valid cost",
          }
    },
    description: {
        type: String,
    }
  });
  const Activity = mongoose.model('Activity', ActivitySchema);

  const DaySchema = Schema({
    day: {
        type: Number,
        required: [true, "Day is required"],
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
    },
    activities: [{
        type: Schema.Types.ObjectId, ref: 'Activity' 
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
  const Day = mongoose.model('Day', DaySchema);

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
    dayList: [{
        type: Schema.Types.ObjectId, ref: 'Day' 
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
  const Plan = mongoose.model('Plan', PlanSchema);

  module.exports = { Activity, Day, Plan };

  //debug_test()

  // list specific plan accoding to planId
  app.get('/plan/:planId', async (req, res) => {
    const planId = req.params.planId;

    Plan.find({ planId: {$eq: planId} }).populate({path: 'dayList', populate: {path: 'activities', model: 'Activity'}})
    .then((data) => {
        console.log(data)
        res.set('Content-Type', 'text/plain');

        res.send(data);
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

// ---
async function parseJSON(jsonString) {
  try {
    const jsonData = JSON.parse(jsonString);

    const activities = await Promise.all(jsonData.dayList.flatMap(day => 
      day.activities.map(activityData => new Activity(activityData).save())
    ));

    const days = await Promise.all(jsonData.dayList.map(dayData => {
      const dayActivities = activities.filter(activity => 
        dayData.activities.some(a => a.name === activity.name)
      );
      return new Day({ ...dayData, activities: dayActivities }).save();
    }));

    const plan = new Plan({ ...jsonData, dayList: days });
    await plan.save();

    console.log("Data successfully saved to MongoDB");
  } catch (error) {
    console.error("Error parsing JSON or saving to MongoDB:", error);
  }
}

function debug_test() {
  parseJSON(
    `
{
  "planId": 1,
  "name": "3-Day Trip to Tokyo",
  "startingDate": "2023-12-01T00:00:00.000Z",
  "endingDate": "2023-12-03T23:59:59.000Z",
  "dayList": [
    {
      "day": 1,
      "date": "2023-12-01T00:00:00.000Z",
      "activities": [
        {
          "name": "Visit Senso-ji Temple",
          "type": "Sightseeing",
          "startDateTime": "2023-12-01T09:00:00.000Z",
          "endDateTime": "2023-12-01T11:00:00.000Z",
          "place": "Asakusa, Tokyo",
          "cost": 0,
          "description": "Explore the historic Senso-ji Temple and its surroundings."
        },
        {
          "name": "Lunch at Tsukiji Outer Market",
          "type": "Food",
          "startDateTime": "2023-12-01T12:00:00.000Z",
          "endDateTime": "2023-12-01T13:30:00.000Z",
          "place": "Tsukiji, Tokyo",
          "cost": 2000,
          "description": "Enjoy fresh sushi and other local delicacies."
        },
        {
          "name": "Tokyo Skytree Visit",
          "type": "Sightseeing",
          "startDateTime": "2023-12-01T15:00:00.000Z",
          "endDateTime": "2023-12-01T17:00:00.000Z",
          "place": "Sumida, Tokyo",
          "cost": 3000,
          "description": "Get a panoramic view of Tokyo from the Skytree observation deck."
        }
      ],
      "weather": "Sunny",
      "temperature": 15,
      "cost": 5000
    },
    {
      "day": 2,
      "date": "2023-12-02T00:00:00.000Z",
      "activities": [
        {
          "name": "Visit Meiji Shrine",
          "type": "Sightseeing",
          "startDateTime": "2023-12-02T09:00:00.000Z",
          "endDateTime": "2023-12-02T11:00:00.000Z",
          "place": "Shibuya, Tokyo",
          "cost": 0,
          "description": "Explore the serene Meiji Shrine and its forested surroundings."
        },
        {
          "name": "Shopping in Harajuku",
          "type": "Shopping",
          "startDateTime": "2023-12-02T12:00:00.000Z",
          "endDateTime": "2023-12-02T14:00:00.000Z",
          "place": "Harajuku, Tokyo",
          "cost": 5000,
          "description": "Shop for trendy fashion and unique souvenirs in Harajuku."
        },
        {
          "name": "Dinner in Shibuya",
          "type": "Food",
          "startDateTime": "2023-12-02T19:00:00.000Z",
          "endDateTime": "2023-12-02T21:00:00.000Z",
          "place": "Shibuya, Tokyo",
          "cost": 3000,
          "description": "Enjoy a delicious dinner in the bustling Shibuya district."
        }
      ],
      "weather": "Cloudy",
      "temperature": 13,
      "cost": 8000
    },
    {
      "day": 3,
      "date": "2023-12-03T00:00:00.000Z",
      "activities": [
        {
          "name": "Visit Tokyo Disneyland",
          "type": "Entertainment",
          "startDateTime": "2023-12-03T09:00:00.000Z",
          "endDateTime": "2023-12-03T18:00:00.000Z",
          "place": "Urayasu, Chiba",
          "cost": 8200,
          "description": "Spend a fun-filled day at Tokyo Disneyland."
        },
        {
          "name": "Dinner in Odaiba",
          "type": "Food",
          "startDateTime": "2023-12-03T19:00:00.000Z",
          "endDateTime": "2023-12-03T21:00:00.000Z",
          "place": "Odaiba, Tokyo",
          "cost": 4000,
          "description": "Enjoy a waterfront dinner in Odaiba."
        }
      ],
      "weather": "Rainy",
      "temperature": 12,
      "cost": 12200
    }
  ],
  "dayCount": 3,
  "cost": 25200
}
`
  );
}