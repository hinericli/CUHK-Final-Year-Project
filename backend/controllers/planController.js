import mongoose from 'mongoose';
import Place from '../models/placeModel.js';
import Activity from '../models/activityModel.js';
import Day from '../models/dayModel.js';
import Plan from '../models/planModel.js';

async function parseJSON(jsonString) {
    try {
        const jsonData = JSON.parse(jsonString);
        console.log('Parsed JSON:', jsonData);

        // Validate dayList
        if (!jsonData.dayList || !Array.isArray(jsonData.dayList)) {
            throw new Error('Invalid JSON: dayList must be an array');
        }

        // Save all places and create a mapping of place names to their ObjectIds
        const allPlaces = jsonData.dayList.flatMap(day =>
            day.activities.flatMap(activity => [
                activity.place,
                ...activity.subActivities.map(subActivity => subActivity.place)
            ])
        );

        const savedPlaces = await Promise.all(allPlaces.map(placeData => {
            const newPlace = new Place(placeData);
            return newPlace.save();
        }));

        const placeMap = {};
        savedPlaces.forEach(place => {
            placeMap[place.name] = place._id;
        });

        // Save all activities (including sub-activities) and create a mapping
        const activityMap = {};
        const activities = await Promise.all(jsonData.dayList.flatMap(day =>
            day.activities.map(async activityData => {
                const { place, subActivities, ...activityWithoutPlace } = activityData;

                // Save sub-activities first
                const savedSubActivities = await Promise.all(subActivities.map(async subActivityData => {
                    const { place: subPlace, ...subActivityWithoutPlace } = subActivityData;
                    const subActivityToSave = new Activity({
                        ...subActivityWithoutPlace,
                        place: placeMap[subPlace.name]
                    });
                    const savedSubActivity = await subActivityToSave.save();
                    activityMap[subActivityData.name] = savedSubActivity._id;
                    return savedSubActivity._id;
                }));

                // Save the main activity
                const activityToSave = new Activity({
                    ...activityWithoutPlace,
                    place: placeMap[place.name],
                    subActivities: savedSubActivities
                });
                const savedActivity = await activityToSave.save();
                activityMap[activityData.name] = savedActivity._id;
                return savedActivity;
            })
        ));

        // Save the days with their activities
        const days = await Promise.all(jsonData.dayList.map(async dayData => {
            try {
                const dayActivities = activities.filter(activity =>
                    dayData.activities.some(a => a.name === activity.name)
                );
                const dayToSave = new Day({ ...dayData, activities: dayActivities });
                return await dayToSave.save();
            } catch (error) {
                console.error(`Error saving day ${dayData.day}:`, error);
                throw error;
            }
        }));

        console.log('Saved days:', days);
        console.log('Is days an array?', Array.isArray(days));

        // Return the parsed data with saved references instead of saving the plan
        return { ...jsonData, dayList: days };
    } catch (error) {
        console.error('Error parsing JSON or saving to MongoDB:', error);
        throw error;
    }
}

async function getMaxPlanIdBackend () {
    // for backend
    try {
        const plans = await Plan.find().sort({ planId: -1 }).limit(1).exec(); // Get the highest planId
        if (!plans || plans.length === 0) {
            console.log('No plans found, returning 0');
            return 0; // Return 0 if no plans exist
        }
        console.log('Max plan ID found:', plans[0].planId);
        return plans[0].planId; // Return the highest planId
    } catch (error) {
        console.error('Error in getMaxPlanId:', error.message);
        throw error; // Propagate the error
    }
}

export async function getPlan(req, res) {
    const planId = req.params.planId;

    Plan.find({ planId: { $eq: planId } })
        .populate({
            path: 'dayList',
            populate: {
                path: 'activities',
                model: 'Activity',
                populate: [
                    { path: 'place', model: 'Place' },
                    {
                        path: 'subActivities',
                        model: 'Activity',
                        populate: { path: 'place', model: 'Place' }
                    }
                ]
            }
        })
        .then((data) => {
            console.log(data);
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
        let inputString = JSON.stringify(req.body).replace(/[\n\r\t\s]+/g, ' ').trim();
        parseJSON(inputString);
    } catch (err) {
        res.status(500).json({ error: 'Could not add plan' });
    }
}

export async function saveJson(req, res) {
    try {
        const tripData = req.body;

        // Validate input
        if (!tripData || typeof tripData !== 'object' || tripData === null) {
            throw new Error('Invalid trip data: Must be a non-null object');
        }

        if (!Array.isArray(tripData.dayList)) {
            throw new Error('Invalid trip data: dayList must be an array');
        }

        // Save Places and Activities for each Day
        const dayIds = [];
        for (const dayData of tripData.dayList) {
            if (!dayData || !Array.isArray(dayData.activities)) {
                throw new Error(`Invalid day data for day ${dayData?.day}: activities must be an array`);
            }

            const activityIds = [];
            for (const activityData of dayData.activities) {
                if (!activityData || !activityData.place) {
                    throw new Error('Invalid activity data: place is required');
                }

                // Save place
                const place = new Place({
                    name: activityData.place.name,
                    latitude: activityData.place.latitude,
                    longitude: activityData.place.longitude,
                    description: activityData.place.description,
                });
                const savedPlace = await place.save();

                // Save subActivities (if any)
                const subActivityIds = [];
                if (Array.isArray(activityData.subActivities)) {
                    for (const subActivityData of activityData.subActivities) {
                        if (!subActivityData || !subActivityData.place) {
                            throw new Error('Invalid subActivity data: place is required');
                        }

                        // Save subActivity place
                        const subPlace = new Place({
                            name: subActivityData.place.name,
                            latitude: subActivityData.place.latitude,
                            longitude: subActivityData.place.longitude,
                            description: subActivityData.place.description,
                        });
                        const savedSubPlace = await subPlace.save();

                        // Save subActivity
                        const subActivity = new Activity({
                            name: subActivityData.name,
                            type: subActivityData.type,
                            startDateTime: new Date(subActivityData.startDateTime),
                            endDateTime: new Date(subActivityData.endDateTime),
                            place: savedSubPlace._id,
                            cost: subActivityData.cost,
                            description: subActivityData.description,
                            isVisited: subActivityData.isVisited,
                        });
                        const savedSubActivity = await subActivity.save();
                        subActivityIds.push(savedSubActivity._id);
                    }
                }

                // Save activity
                const activity = new Activity({
                    name: activityData.name,
                    type: activityData.type,
                    startDateTime: new Date(activityData.startDateTime),
                    endDateTime: new Date(activityData.endDateTime),
                    place: savedPlace._id,
                    cost: activityData.cost,
                    description: activityData.description,
                    isVisited: activityData.isVisited,
                    subActivities: subActivityIds,
                });
                const savedActivity = await activity.save();
                activityIds.push(savedActivity._id);
            }

            // Save day
            const day = new Day({
                day: dayData.day,
                date: new Date(dayData.date),
                activities: activityIds,
                weather: dayData.weather,
                temperature: dayData.temperature,
                cost: dayData.cost,
            });
            const savedDay = await day.save();
            dayIds.push(savedDay._id);
        }

        // Save the Plan
        const maxPlanId = await getMaxPlanIdBackend(); // Await the result
        console.log('Max Plan ID:', maxPlanId);

        const plan = new Plan({
            planId: Number(maxPlanId) + 1,
            name: tripData.name,
            startingDate: new Date(tripData.startingDate),
            endingDate: new Date(tripData.endingDate),
            dayList: dayIds,
            dayCount: tripData.dayCount,
            cost: tripData.cost,
        });
        const savedPlan = await plan.save();

        console.log('Trip plan saved successfully with ID:', savedPlan._id);
        return savedPlan; // Return the saved plan to the caller

    } catch (error) {
        console.error('Error saving trip plan:', error.message);
        throw error; // Re-throw the error to be handled by the caller
    }
}

// for updating the plan in backend, not for router
export async function updatePlan(req_str) {
    try {
        // Parse the JSON string and await the result
        const tripData = await parseJSON(req_str);

        console.log('Parsed tripData:', tripData);

        // Validate input
        if (!tripData || typeof tripData !== 'object' || tripData === null) {
            throw new Error('Invalid trip data: Must be a non-null object');
        }

        if (!Array.isArray(tripData.dayList)) {
            throw new Error('Invalid trip data: dayList must be an array');
        }

        if (!tripData.planId) {
            throw new Error('Invalid trip data: planId is required for update');
        }

        // Find existing plan
        const existingPlan = await Plan.findOne({ planId: tripData.planId });
        if (!existingPlan) {
            throw new Error('Plan not found');
        }

        // Update the Plan
        const updatedPlan = await Plan.findByIdAndUpdate(
            existingPlan._id,
            {
                name: tripData.name,
                startingDate: new Date(tripData.startingDate),
                endingDate: new Date(tripData.endingDate),
                dayList: tripData.dayList.map(day => day._id), // Use saved Day ObjectIds
                dayCount: tripData.dayCount,
                cost: tripData.cost,
            },
            { new: true }
        );

        console.log('Trip plan updated successfully with ID:', updatedPlan._id);
        return updatedPlan;

    } catch (error) {
        console.error('Error updating trip plan:', error.message);
        throw error;
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
          res.status(201).json("/plan/" + planId)
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

export async function deletePlanById(planId) {
    try {
        // Find the plan
        const plan = await Plan.findOne({ planId: planId }).populate({
            path: 'dayList',
            populate: {
                path: 'activities',
                populate: {
                    path: 'place'
                }
            }
        });

        if (!plan) {
            throw new Error(`Plan with planId ${planId} not found`);
        }

        // Extract IDs of related documents
        const dayIds = plan.dayList.map(day => day._id);
        const activityIds = plan.dayList.flatMap(day => day.activities.map(activity => activity._id));
        const placeIds = plan.dayList
            .flatMap(day => day.activities.map(activity => activity.place._id))
            .filter(id => id); // Remove null/undefined values

        // Delete all related documents
        await Place.deleteMany({ _id: { $in: placeIds } });
        await Activity.deleteMany({ _id: { $in: activityIds } });
        await Day.deleteMany({ _id: { $in: dayIds } });
        await Plan.deleteOne({ planId: planId });

        return {
            success: true,
            message: `Plan with planId ${planId} and all related data deleted successfully`,
            deletedData: {
                planId: planId,
                deletedDays: dayIds.length,
                deletedActivities: activityIds.length,
                deletedPlaces: placeIds.length
            }
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
}

export async function updateActivity(req, res) {
    const { planId, day, activityId } = req.params;
    const dayIndex = Number(day) > 0 ? Number(day) - 1 : 0;
    const { name, type, startDateTime, endDateTime, place, cost, description, isVisited } = req.body;

    try {
        // Find the plan by planId
        const plan = await Plan.findOne({ planId: { $eq: planId } }).populate({
            path: 'dayList',
            populate: { path: 'activities', model: 'Activity', populate: { path: 'place', model: 'Place' } }
        });

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Check if the day exists
        if (!plan.dayList[dayIndex]) {
            return res.status(404).json({ error: 'Day not found' });
        }

        // Find the activity by activityId
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Update or create the place
        let placeDoc;
        if (place._id) {
            // Update existing place
            placeDoc = await Place.findByIdAndUpdate(
                place._id,
                {
                    name: place.name,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    description: place.description
                },
                { new: true }
            );
        } else {
            // Create new place
            placeDoc = new Place({
                name: place.name,
                latitude: place.latitude,
                longitude: place.longitude,
                description: place.description
            });
            await placeDoc.save();
        }

        // Update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(
            activityId,
            {
                name,
                type,
                startDateTime,
                endDateTime,
                place: placeDoc._id,
                cost,
                description,
                isVisited
            },
            { new: true }
        );

        console.log('Successfully updated activity');
        return res.status(200).json({ message: 'Activity updated', activity: updatedActivity });
    } catch (error) {
        console.error('Error updating activity:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}