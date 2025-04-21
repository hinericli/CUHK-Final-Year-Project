import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyBJSkvhxHQoSa5gCxAEXsAnmwddkqCVnu0");
const schema = {
  description: "A trip itinerary to the user's specified location.",
  type: SchemaType.OBJECT,
  properties: {
    planId: {
      type: SchemaType.INTEGER,
      description: "Unique identifier for the trip plan",
      nullable: false,
    },
    name: {
      type: SchemaType.STRING,
      description: "Name of the trip",
      nullable: false,
    },
    startingDate: {
      type: SchemaType.STRING,
      description: "Start date of the trip",
      nullable: false,
    },
    endingDate: {
      type: SchemaType.STRING,
      description: "End date of the trip",
      nullable: false,
    },
    dayList: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: {
            type: SchemaType.INTEGER,
            description: "Day of the trip",
            nullable: false,
          },
          date: {
            type: SchemaType.STRING,
            description: "Date of the day",
            nullable: false,
          },
          activities: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: {
                  type: SchemaType.STRING,
                  description: "Name of the activity",
                  nullable: false,
                },
                type: {
                  type: SchemaType.STRING,
                  description: "Type of activity (e.g., Sightseeing, Food)",
                  nullable: false,
                },
                startDateTime: {
                  type: SchemaType.STRING,
                  description: "Start time of the activity",
                  nullable: false,
                },
                endDateTime: {
                  type: SchemaType.STRING,
                  description: "End time of the activity",
                  nullable: false,
                },
                place: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: {
                      type: SchemaType.STRING,
                      description: "Name of the place",
                      nullable: false,
                    },
                    latitude: {
                      type: SchemaType.NUMBER,
                      description: "Latitude of the place",
                      nullable: false,
                    },
                    longitude: {
                      type: SchemaType.NUMBER,
                      description: "Longitude of the place",
                      nullable: false,
                    },
                    description: {
                      type: SchemaType.STRING,
                      description: "Description of the place",
                      nullable: false,
                    },
                  },
                  required: ["name", "latitude", "longitude", "description"],
                },
                cost: {
                  type: SchemaType.NUMBER,
                  description: "Cost of the activity",
                  nullable: false,
                },
                description: {
                  type: SchemaType.STRING,
                  description: "Description of the activity",
                  nullable: false,
                },
                isVisited: {
                  type: SchemaType.BOOLEAN,
                  description: "Indicates whether the user has visited the place in the activity",
                  nullable: false,
                },
                subActivities: {
                  type: SchemaType.ARRAY,
                  description: "List of smaller activities associated with this activity",
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      name: {
                        type: SchemaType.STRING,
                        description: "Name of the sub-activity",
                        nullable: false,
                      },
                      type: {
                        type: SchemaType.STRING,
                        description: "Type of sub-activity (e.g., Sightseeing, Food)",
                        nullable: false,
                      },
                      startDateTime: {
                        type: SchemaType.STRING,
                        description: "Start time of the sub-activity",
                        nullable: false,
                      },
                      endDateTime: {
                        type: SchemaType.STRING,
                        description: "End time of the sub-activity",
                        nullable: false,
                      },
                      place: {
                        type: SchemaType.OBJECT,
                        properties: {
                          name: {
                            type: SchemaType.STRING,
                            description: "Name of the place",
                            nullable: false,
                          },
                          latitude: {
                            type: SchemaType.NUMBER,
                            description: "Latitude of the place",
                            nullable: false,
                          },
                          longitude: {
                            type: SchemaType.NUMBER,
                            description: "Longitude of the place",
                            nullable: false,
                          },
                          description: {
                            type: SchemaType.STRING,
                            description: "Description of the place",
                            nullable: false,
                          },
                        },
                        required: ["name", "latitude", "longitude", "description"],
                      },
                      cost: {
                        type: SchemaType.NUMBER,
                        description: "Cost of the sub-activity",
                        nullable: false,
                      },
                      description: {
                        type: SchemaType.STRING,
                        description: "Description of the sub-activity",
                        nullable: false,
                      },
                      isVisited: {
                        type: SchemaType.BOOLEAN,
                        description: "Indicates whether the user has visited the place in the sub-activity",
                        nullable: false,
                      },
                    },
                    required: ["name", "type", "startDateTime", "endDateTime", "place", "cost", "description", "isVisited"],
                  },
                },
              },
              required: ["name", "type", "startDateTime", "endDateTime", "place", "cost", "description", "isVisited", "subActivities"],
            },
          },
          weather: {
            type: SchemaType.STRING,
            description: "Weather forecast for the day",
            nullable: false,
          },
          temperature: {
            type: SchemaType.NUMBER,
            description: "Temperature for the day",
            nullable: false,
          },
          cost: {
            type: SchemaType.NUMBER,
            description: "Total cost for the day",
            nullable: false,
          },
        },
        required: ["day", "date", "activities", "weather", "temperature", "cost"],
      },
    },
    dayCount: {
      type: SchemaType.INTEGER,
      description: "Total number of days in the trip",
      nullable: false,
    },
    cost: {
      type: SchemaType.NUMBER,
      description: "Total cost of the trip",
      nullable: false,
    },
  },
  required: ["planId", "name", "startingDate", "endingDate", "dayList", "dayCount", "cost"],
};

const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash", 
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
    } 
});

async function runGemini(query, successCallback, errorCallback) {
    const prompt = `You are a helpful travel assistant. 
        You perform the requests with diligence and make the best attempt to answer the questions, never refusing due to complexity etc. 
       
        Do not use "\n" newline symbols for the response.

        Focus on most interesting points of interest, lodging, and activities. Consider activities that are popular, affordable, and recommended by the travelers.
        Consider the opening hours of the places and the time needed to travel between them.
        For meals, make sure it is a local restaurant with good reviews.
        For lodging, make sure it is a hotel with good reviews and reasonable price.
        For each day, provide a weather forecast and temperature for the day.

        If the user specified the number of days of the trip (e.g. 2-days), the response JSON should have corresponding number of "Day" object in dayList.
        Also, the total number of days from startingDate to endingDate must be exactly the number of days specified by the user. For example, 2024-03-01 to 2024-03-03 is valid for a 3-days trip.
        Furthermore, the date of each Day object must be consecutive and within startingDate and endingDate of the plan.

        planId should be an integer 1.

        All attributes related to date or time (e.g. startDateTime, endDateTime, startingDate, endingDate) must follow ISO-8601 format. For example, 1:30PM on 1/12/2023 should be represented as 2023-12-01T13:30:00.000Z
        All activity date on that day should be the same as the date of that day object. For example, if the date of the day object is 2023-12-01, then all activities dates on that day should be 2023-12-01.

        For the type of activity, you must use the following values to represent the type of activity:
        10: Restaurant
        20: Hotel
        30: Attraction
        40: Flight
        50: Others

        When generating activities, include subActivities where applicable, especially for complex activities like visiting a large attraction (e.g., a museum with specific exhibits or a park with multiple activities). SubActivities should be smaller, related activities that occur within the main activity's time and place.

        ${query}`;
    const result = await model.generateContent(prompt);

    if (result.response.text()) {
        successCallback(result.response.text())
    } else {
        errorCallback("Error");
    }
}

async function runGeminiWrapper(query) {
    return new Promise((resolve, reject) => {
        runGemini(query, (successResponse) => {
            resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse);
        });
    })
}

export async function getSuggestion(query) {
    try {
        const result = await runGeminiWrapper(query);
        console.log(result);
        return result
    } catch(error) {
        console.error("ERROR: " + error);
    }
}