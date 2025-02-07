const express = require('express');
const cors = require('cors');
const route = express();

route.use(cors())
route.use(express.json())

const mongoose = require('mongoose');
const { getPlan, getMaxPlanId, loadPlan, createEmptyPlan, addNewActivity } = require('./controllers/planController');
mongoose.connect('mongodb://127.0.0.1:27017/myDatabase');

const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon opening the database successfully
db.once('open', function () {
  console.log("Connection is open...");
  // --- Setup MongoDB Schema ---
  const Place = require('./models/placeModel');
  const Activity = require('./models/activityModel');
  const Day = require('./models/dayModel');
  const Plan = require('./models/planModel');

  // list specific plan accoding to planId
  route.get('/plan/:planId', (req, res) => getPlan(req, res));

  // get the largest planId
  route.get('/maxPlanId', async (req, res) => getMaxPlanId(req, res));

  // load JSON plan to database
  route.post('/plan/', async (req, res) => loadPlan(req, res));

  // add new empty plan to database
  route.post('/newPlan/', async (req, res) => createEmptyPlan(req, res));

  // WIP: update plan
  route.post('/plan/:planId', async (req, res) => {
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


  route.put('/plan/:planId/:day', async (req, res) => addNewActivity(req, res));

  // handle ALL requests
  route.all('/*', (req, res) => {
    // send this to client
    res.send('Hello World!');
  });
})

// listen to port 3000
const server = route.listen(3000);