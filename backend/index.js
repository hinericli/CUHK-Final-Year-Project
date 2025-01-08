const express = require('express');
const cors = require('cors');
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
  
/*function debug_test() {
  parseJSON(
`
{
    "planId": 2,
    "name": "5-Day Trip to Bangkok",
    "startingDate": "2023-11-01T00:00:00.000Z",
    "endingDate": "2023-11-05T23:59:59.000Z",
    "dayList": [
      {
        "day": 1,
        "date": "2023-11-01T00:00:00.000Z",
        "activities": [
          {
            "name": "Visit Grand Palace",
            "type": "Sightseeing",
            "startDateTime": "2023-11-01T09:00:00.000Z",
            "endDateTime": "2023-11-01T12:00:00.000Z",
            "place": "Phra Nakhon, Bangkok",
            "cost": 500,
            "description": "Explore the historic Grand Palace and its beautiful architecture."
          },
          {
            "name": "Lunch at Chinatown",
            "type": "Food",
            "startDateTime": "2023-11-01T13:00:00.000Z",
            "endDateTime": "2023-11-01T14:30:00.000Z",
            "place": "Chinatown, Bangkok",
            "cost": 300,
            "description": "Enjoy delicious street food in Chinatown."
          },
          {
            "name": "Visit Wat Arun",
            "type": "Sightseeing",
            "startDateTime": "2023-11-01T15:00:00.000Z",
            "endDateTime": "2023-11-01T17:00:00.000Z",
            "place": "Wat Arun, Bangkok",
            "cost": 100,
            "description": "Visit the iconic Wat Arun temple."
          }
        ],
        "weather": "Sunny",
        "temperature": 30,
        "cost": 900
      },
      {
        "day": 2,
        "date": "2023-11-02T00:00:00.000Z",
        "activities": [
          {
            "name": "Visit Chatuchak Weekend Market",
            "type": "Shopping",
            "startDateTime": "2023-11-02T09:00:00.000Z",
            "endDateTime": "2023-11-02T12:00:00.000Z",
            "place": "Chatuchak, Bangkok",
            "cost": 0,
            "description": "Shop for unique items at the Chatuchak Weekend Market."
          },
          {
            "name": "Lunch at Or Tor Kor Market",
            "type": "Food",
            "startDateTime": "2023-11-02T13:00:00.000Z",
            "endDateTime": "2023-11-02T14:30:00.000Z",
            "place": "Chatuchak, Bangkok",
            "cost": 300,
            "description": "Enjoy fresh and delicious food at Or Tor Kor Market."
          },
          {
            "name": "Visit Jim Thompson House",
            "type": "Sightseeing",
            "startDateTime": "2023-11-02T15:00:00.000Z",
            "endDateTime": "2023-11-02T17:00:00.000Z",
            "place": "Pathum Wan, Bangkok",
            "cost": 200,
            "description": "Explore the Jim Thompson House and its beautiful gardens."
          }
        ],
        "weather": "Cloudy",
        "temperature": 28,
        "cost": 500
      },
      {
        "day": 3,
        "date": "2023-11-03T00:00:00.000Z",
        "activities": [
          {
            "name": "Visit Wat Pho",
            "type": "Sightseeing",
            "startDateTime": "2023-11-03T09:00:00.000Z",
            "endDateTime": "2023-11-03T11:00:00.000Z",
            "place": "Phra Nakhon, Bangkok",
            "cost": 200,
            "description": "Visit the famous Wat Pho temple and see the Reclining Buddha."
          },
          {
            "name": "Lunch at Khao San Road",
            "type": "Food",
            "startDateTime": "2023-11-03T12:00:00.000Z",
            "endDateTime": "2023-11-03T13:30:00.000Z",
            "place": "Khao San Road, Bangkok",
            "cost": 300,
            "description": "Enjoy a variety of street food at Khao San Road."
          },
          {
            "name": "Visit MBK Center",
            "type": "Shopping",
            "startDateTime": "2023-11-03T15:00:00.000Z",
            "endDateTime": "2023-11-03T18:00:00.000Z",
            "place": "Pathum Wan, Bangkok",
            "cost": 0,
            "description": "Shop for electronics, clothes, and souvenirs at MBK Center."
          }
        ],
        "weather": "Rainy",
        "temperature": 27,
        "cost": 500
      },
      {
        "day": 4,
        "date": "2023-11-04T00:00:00.000Z",
        "activities": [
          {
            "name": "Visit Lumpini Park",
            "type": "Sightseeing",
            "startDateTime": "2023-11-04T09:00:00.000Z",
            "endDateTime": "2023-11-04T11:00:00.000Z",
            "place": "Pathum Wan, Bangkok",
            "cost": 0,
            "description": "Relax and enjoy the greenery at Lumpini Park."
          },
          {
            "name": "Lunch at Terminal 21",
            "type": "Food",
            "startDateTime": "2023-11-04T12:00:00.000Z",
            "endDateTime": "2023-11-04T13:30:00.000Z",
            "place": "Watthana, Bangkok",
            "cost": 300,
            "description": "Enjoy a variety of international cuisines at Terminal 21."
          },
          {
            "name": "Visit Erawan Shrine",
            "type": "Sightseeing",
            "startDateTime": "2023-11-04T15:00:00.000Z",
            "endDateTime": "2023-11-04T16:00:00.000Z",
            "place": "Pathum Wan, Bangkok",
            "cost": 0,
            "description": "Visit the famous Erawan Shrine."
          }
        ],
        "weather": "Sunny",
        "temperature": 29,
        "cost": 300
      },
      {
        "day": 5,
        "date": "2023-11-05T00:00:00.000Z",
        "activities": [
          {
            "name": "Visit Asiatique The Riverfront",
            "type": "Shopping",
            "startDateTime": "2023-11-05T09:00:00.000Z",
            "endDateTime": "2023-11-05T12:00:00.000Z",
            "place": "Bang Kho Laem, Bangkok",
            "cost": 0,
            "description": "Shop and dine at Asiatique The Riverfront."
          },
          {
            "name": "Lunch at Asiatique",
            "type": "Food",
            "startDateTime": "2023-11-05T12:00:00.000Z",
            "endDateTime": "2023-11-05T13:30:00.000Z",
            "place": "Bang Kho Laem, Bangkok",
            "cost": 300,
            "description": "Enjoy a variety of food options at Asiatique."
          },
          {
            "name": "Visit Wat Saket",
            "type": "Sightseeing",
            "startDateTime": "2023-11-05T15:00:00.000Z",
            "endDateTime": "2023-11-05T17:00:00.000Z",
            "place": "Pom Prap Sattru Phai, Bangkok",
            "cost": 100,
            "description": "Visit the Golden Mount at Wat Saket."
          }
        ],
        "weather": "Cloudy",
        "temperature": 28,
        "cost": 400
      }
    ],
    "dayCount": 5,
    "cost": 2600
}
`
  );
}

  debug_test()*/

  app.use(cors())
  app.use(express.json())

  // list specific plan accoding to planId
  app.get('/plan/:planId', async (req, res) => {
    const planId = req.params.planId;

    Plan.find({ planId: {$eq: planId} }).populate({path: 'dayList', populate: {path: 'activities', model: 'Activity'}})
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

  // add new plan to database
  app.post('/plan/', async (req, res) => {
    const { name, startingDate, endingDate, dayList, dayCount, cost } = req.body;

    try {
      Plan.find().sort({planId: -1}) // sort the documents in descending order by planId
      .then((response) => {
        res.set('Content-Type', 'text/plain')
        console.log(name, startingDate, endingDate, dayList, dayCount, cost);

        const emptyPlan = new Plan(
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

        emptyPlan.save().then(() => {
            console.log("Successfully added new empty plan to the database");
        }).then(() => {
            res.status(201).send("/plan/" + emptyPlan.planId)
        }).catch((err)=>console.log("Failed to create new empty plan. ", err))
      });
    } catch (err) {
        res.status(500).json({ error: 'Could not create empty plan' });
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
