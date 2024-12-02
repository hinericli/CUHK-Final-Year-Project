import { writeFile } from 'fs';

// JSON object representing the classes Plan, Day, and Activity
const jsonData = {
  "plan": {
    "name": "Your Plan Name",
    "startingDate": "YYYY-MM-DD",
    "endingDate": "YYYY-MM-DD",
    "dayCount": 3,
    "cost": 500,
    "dayList": [
      {
        "day": 1,
        "date": "YYYY-MM-DD",
        "activities": [
          {
            "name": "Activity 1",
            "type": "Type A",
            "startDateTime": "YYYY-MM-DDTHH:mm:ss",
            "endDateTime": "YYYY-MM-DDTHH:mm:ss",
            "place": "Place A",
            "cost": 50,
            "description": "Description of Activity 1"
          },
          {
            "name": "Activity 2",
            "type": "Type B",
            "startDateTime": "YYYY-MM-DDTHH:mm:ss",
            "endDateTime": "YYYY-MM-DDTHH:mm:ss",
            "place": "Place B",
            "cost": 70,
            "description": "Description of Activity 2"
          }
        ],
        "weather": "Weather Condition",
        "temperature": 25,
        "cost": 120
      },
      {
        "day": 2,
        "date": "YYYY-MM-DD",
        "activities": [
          {
            "name": "Activity 3",
            "type": "Type C",
            "startDateTime": "YYYY-MM-DDTHH:mm:ss",
            "endDateTime": "YYYY-MM-DDTHH:mm:ss",
            "place": "Place C",
            "cost": 80,
            "description": "Description of Activity 3"
          }
        ],
        "weather": "Weather Condition",
        "temperature": 20,
        "cost": 80
      },
      {
        "day": 3,
        "date": "YYYY-MM-DD",
        "activities": [
          {
            "name": "Activity 4",
            "type": "Type D",
            "startDateTime": "YYYY-MM-DDTHH:mm:ss",
            "endDateTime": "YYYY-MM-DDTHH:mm:ss",
            "place": "Place D",
            "cost": 100,
            "description": "Description of Activity 4"
          }
        ],
        "weather": "Weather Condition",
        "temperature": 23,
        "cost": 100
      }
    ]
  }
};

// Convert JSON object to a string
const jsonString = JSON.stringify(jsonData, null, 2);

// Write JSON string to a file
writeFile('plan_data.json', jsonString, 'utf8', (err) => {
  if (err) {
    console.error('Error writing JSON file:', err);
  } else {
    console.log('JSON file has been saved successfully.');
  }
});