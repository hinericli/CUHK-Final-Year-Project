import Place from '../models/placeModel.js';
import Activity from '../models/activityModel.js';
import Day from '../models/dayModel.js';
import Plan from '../models/planModel.js';

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

export async function getPlan (req, res) {
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
}

export async function getMaxPlanId (req, res) {
    Plan.find().sort({planId: -1})
    .then((data) => {
        res.set('Content-Type', 'application/json');
        res.json(data[0].planId);
    })
    .catch((err) => {
        console.error(err);
        res.status(404).send('PlanID Not Found');
    });
}

export async function loadPlan (req, res) {
    try {
      parseJSON(JSON.stringify(req.body));
    } catch (err) {
        res.status(500).json({ error: 'Could not add plan' });
    }
}

export async function createEmptyPlan (req, res) {
    console.log(req.body)
    const { name, startingDate, endingDate, dayList, dayCount, cost } = req.body;

    try {
      console.log(dayList);

      Plan.find().sort({planId: -1}) // sort the documents in descending order by planId
      .then((response) => {
        res.set('Content-Type', 'text/plain')
        console.log(name, startingDate, endingDate, dayList, dayCount, cost);

        const newPlan = new Plan(
          {
            planId: response[0] ? response[0].planId+1 : 1,
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
}

export async function addNewActivity (req, res) {
    const planId = req.params.planId;
    const day = Number(req.params.day)>0 ? Number(req.params.day)-1 : 0;
    const { name, type, startDateTime, endDateTime, place, cost, description } = req.body;
    //console.log(name, type, startDateTime, endDateTime, place, cost, description)

    Plan.findOne({planId: {$eq: planId}}).populate({ path: 'dayList', populate: { path: 'activities', model: 'Activity', populate: { path: 'place', model: 'Place' } } })
    .then((response) => {
      const newPlace = new Place(
        {
            name: place.name,
            latitude: place.latitude,
            longitude: place.longitude,
            description: place.description
        }
      )
      newPlace.save().then(() => {
        console.log("Successfully added new place to the database")
      })
      
      const newActivity = new Activity(
          {
              name: name,
              type: type,
              startDateTime: startDateTime,
              endDateTime: endDateTime,
              place: newPlace,
              cost: cost,
              description: description
          }
      );
      
      response.dayList[day].activities.push(newActivity);
      /*
      Plan.findOneAndUpdate({planId: {$eq: planId}}, { $push: { dayList: { $each: [response.dayList[day]], $position: day } } }, {new: true})
      .then(() => {
        response.save().then(() => {
          console.log(response.dayList[day].activities);
      });*/

      newActivity.save().then(() => {
          console.log("Successfully added new activity to the database");
      }).then(() => {
          res.status(201).send("/plan/" + planId)
      })

      return response
  }).then((response) => {
    const newActivityId = response.dayList[day].activities[response.dayList[day].activities.length-1]._id
    console.log(response.dayList[day])

    Plan.findOne({planId: {$eq: planId}}).populate({ path: 'dayList', populate: { path: 'activities', model: 'Activity', populate: { path: 'place', model: 'Place' } } })
    .then((response) => {
      Day.findById(response.dayList[day]._id).updateOne({}, { $push: { activities: newActivityId } })
      .then(() => {console.log("Successfully updated Day")})
    }).then(() => {
    })
  })
}