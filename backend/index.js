const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.json())

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
  const PlaceSchema = new Schema({
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
  const Place = mongoose.model('Place', PlaceSchema);

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
        type: Schema.Types.ObjectId, ref: 'Place',
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

  async function parseJSON(jsonString) {
    try {
      const jsonData = JSON.parse(jsonString);
  
      // Save the places and create a mapping of place names to their ObjectIds
      const places = await Promise.all(jsonData.dayList.flatMap(day => 
        day.activities.map(activityData => {
          const newPlace = new Place(activityData.place);
          return newPlace.save();
        })
      ));
  
      // Create a mapping of place names to their ObjectIds
      const placeMap = {};
      places.forEach(place => {
        placeMap[place.name] = place._id;
      });
  
      // Now save the activities using the mapped ObjectIds
      const activities = await Promise.all(jsonData.dayList.flatMap(day => 
        day.activities.map(activityData => {
          const { place, ...activityWithoutPlace } = activityData; // destructure to get place details
          const activityToSave = new Activity({ ...activityWithoutPlace, place: placeMap[place.name] });
          return activityToSave.save();
        })
      ));
  
      // Now save the days with their activities
      const days = await Promise.all(jsonData.dayList.map(dayData => {
        const dayActivities = activities.filter(activity => 
          dayData.activities.some(a => a.name === activity.name)
        );
        return new Day({ ...dayData, activities: dayActivities }).save();
      }));
  
      // Finally, save the plan
      const plan = new Plan({ ...jsonData, dayList: days });
      await plan.save();
  
      console.log("Data successfully saved to MongoDB");
    } catch (error) {
      console.error("Error parsing JSON or saving to MongoDB:", error);
    }
  }
  
  /*
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
            "place": {
              "name": "Senso-ji Temple",
              "latitude": 35.7116,
              "longitude": 139.7967,
              "description": "Explore the historic Senso-ji Temple and its surroundings."
            },
            "cost": 0,
            "description": "Explore the historic Senso-ji Temple and its surroundings."
          },
          {
            "name": "Lunch at Tsukiji Outer Market",
            "type": "Food",
            "startDateTime": "2023-12-01T12:00:00.000Z",
            "endDateTime": "2023-12-01T13:30:00.000Z",
            "place": {
              "name": "Tsukiji Outer Market",
              "latitude": 35.6655,
              "longitude": 139.7700,
              "description": "Enjoy fresh sushi and other local delicacies."
            },
            "cost": 2000,
            "description": "Enjoy fresh sushi and other local delicacies."
          },
          {
            "name": "Tokyo Skytree Visit",
            "type": "Sightseeing",
            "startDateTime": "2023-12-01T15:00:00.000Z",
            "endDateTime": "2023-12-01T17:00:00.000Z",
            "place": {
              "name": "Tokyo Skytree",
              "latitude": 35.7106,
              "longitude": 139.8107,
              "description": "Get a panoramic view of Tokyo from the Skytree observation deck."
            },
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
            "place": {
              "name": "Meiji Shrine",
              "latitude": 35.6764,
              "longitude": 139.7006,
              "description": "Explore the serene Meiji Shrine and its forested surroundings."
            },
            "cost": 0,
            "description": "Explore the serene Meiji Shrine and its forested surroundings."
          },
          {
            "name": "Shopping in Harajuku",
            "type": "Shopping",
            "startDateTime": "2023-12-02T12:00:00.000Z",
            "endDateTime": "2023-12-02T14:00:00.000Z",
            "place": {
              "name": "Harajuku",
              "latitude": 35.6702,
              "longitude": 139.7021,
              "description": "Shop for trendy fashion and unique souvenirs in Harajuku."
            },
            "cost": 5000,
            "description": "Shop for trendy fashion and unique souvenirs in Harajuku."
          },
          {
            "name": "Dinner in Shibuya",
            "type": "Food",
            "startDateTime": "2023-12-02T19:00:00.000Z",
            "endDateTime": "2023-12-02T21:00:00.000Z",
            "place": {
              "name": "Shibuya",
              "latitude": 35.6586,
              "longitude": 139.7012,
              "description": "Enjoy a delicious dinner in the bustling Shibuya district."
            },
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
            "place": {
              "name": "Tokyo Disneyland",
              "latitude": 35.6329,
              "longitude": 139.8804,
              "description": "Spend a fun-filled day at Tokyo Disneyland."
            },
            "cost": 8200,
            "description": "Spend a fun-filled day at Tokyo Disneyland."
          },
          {
            "name": "Dinner in Odaiba",
            "type": "Food",
            "startDateTime": "2023-12-03T19:00:00.000Z",
            "endDateTime": "2023-12-03T21:00:00.000Z",
            "place": {
              "name": "Odaiba",
              "latitude": 35.6195,
              "longitude": 139.7753,
              "description": "Enjoy a waterfront dinner in Odaiba."
            },
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

  debug_test()*/

  // list specific plan accoding to planId
  app.get('/plan/:planId', async (req, res) => {
    const planId = req.params.planId;

    Plan.find({ planId: {$eq: planId} }).populate({ path: 'dayList', populate: { path: 'activities', model: 'Activity', populate: { path: 'place', model: 'Place' } } })
    .then((data) => {
        console.log(data)
        res.set('Content-Type', 'application/json');
        res.json(data);
    })
    .catch((err) => {
        console.error(err);
        res.status(404).send('PlanID Not Found');
    });
  });

  // get the largest planId
  app.get('/maxPlanId', async (req, res) => {
    Plan.find().sort({planId: -1})
    .then((data) => {
        res.set('Content-Type', 'application/json');
        res.json(data[0].planId);
    })
    .catch((err) => {
        console.error(err);
        res.status(404).send('PlanID Not Found');
    });

  })

  // load JSON plan to database
  app.post('/plan/', async (req, res) => {
    try {
      parseJSON(JSON.stringify(req.body));
    } catch (err) {
        res.status(500).json({ error: 'Could not add plan' });
    }
  });


  // add new empty plan to database
  app.post('/newPlan/', async (req, res) => {
    console.log(req.body)
    const { name, startingDate, endingDate, dayList, dayCount, cost } = req.body;

    try {
      Plan.find().sort({planId: -1}) // sort the documents in descending order by planId
      .then((response) => {
        res.set('Content-Type', 'text/plain')
        console.log(name, startingDate, endingDate, dayList, dayCount, cost);

        const newPlan = new Plan(
          {
            planId: response[0].planId + 1,
            name: name,
            startingDate: startingDate,
            endingDate: endingDate,
            dayList: dayList,
            dayCount: dayCount,
            cost: cost
          }
        );

        newPlan.save().then(() => {
            console.log("Successfully added new plan to the database");
        }).then(() => {
            res.status(201).send("/plan/" + newPlan.planId)
        }).catch((err)=>console.log("Failed to create new plan. ", err))
      });
    } catch (err) {
        res.status(500).json({ error: 'Could not create plan' });
    }
  });

  app.post('/plan/:planId', async (req, res) => {
    const planId = req.params.planId;
    const updatedData = req.body;

    try {
        // Validate the incoming data if necessary
        // For example, you can check if required fields are present

        // Update the plan in the database
        const updatedPlan = await Plan.findByIdAndUpdate(planId, updatedData, {
            new: true, // Return the updated document
            runValidators: true // Ensure the updated data meets schema validation
        });

        // Check if the plan was found and updated
        if (!updatedPlan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Return the updated plan
        res.status(200).json(updatedPlan);
    } catch (error) {
        // Handle errors (e.g., validation errors, database errors)
        console.error(error);
        res.status(500).json({ message: 'Error updating plan', error: error.message });
    }
});

  // handle ALL requests
  app.all('/*', (req, res) => {
    // send this to client
    res.send('Hello World!');
  });
})

// listen to port 3000
const server = app.listen(3000);
