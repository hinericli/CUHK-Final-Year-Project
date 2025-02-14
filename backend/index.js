const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); 

const route = express();

route.use(cors())
route.use(bodyParser.text({type:"*/*"}));
route.use(express.json())

const mongoose = require('mongoose');
const { getPlan, getMaxPlanId, loadPlan, createEmptyPlan, addNewActivity } = require('./controllers/planController');
const { getSuggestion } = require('./controllers/GeminiController');
mongoose.connect('mongodb://127.0.0.1:27017/myDatabase');

const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console, 'Connection error:'));
// Upon opening the database successfully
db.once('open', function () {
  console.log("Connection is open...");
  const Plan = require('./models/planModel');

  route.get('/plan/:planId', (req, res) => getPlan(req, res));  // obtain specific plan accoding to planId
  route.get('/max-plan-id', async (req, res) => getMaxPlanId(req, res));  // get the largest planId

  route.post('/plan/', async (req, res) => loadPlan(req, res)); // load JSON plan to database
  route.post('/new-plan/', async (req, res) => createEmptyPlan(req, res)); // add new empty plan to database
  route.post('/plan-suggestion', async (req, res) => {
    const response = await getSuggestion(req.body);
    res.send(response);
  })

  route.put('/plan/:planId/:day', async (req, res) => addNewActivity(req, res)); // add activtity to specific day
})

// listen to port 3000
const server = route.listen(3000);