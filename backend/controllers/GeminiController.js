import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { generatePlanSystemPrompt, modifyPlanSystemPrompt } from "../prompts.js";

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

async function runGemini(prompt, userPrompt, successCallback, errorCallback) {
    const craftedPrompt = prompt + `\n\nUser: ${userPrompt}`;
    const result = await model.generateContent(craftedPrompt);

    if (result.response.text()) {
        successCallback(result.response.text())
    } else {
        errorCallback("Error");
    }
}

async function runGeminiWrapper(prompt, userPrompt) {
  // System prompt & user prompt as parameters
    return new Promise((resolve, reject) => {
        runGemini(prompt, userPrompt, (successResponse) => {
            resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse);
        });
    })
}

export async function getSuggestion (userPrompt) {
    try {
        const result = await runGeminiWrapper(generatePlanSystemPrompt, userPrompt);
        console.log(result);
        return result
    } catch(error) {
        console.error("ERROR: " + error);
    }
}

export async function getModifyPlanSuggestion(json) {
  // json includes both the json plan and the user request
  console.log("Recevied json: " + json);
  try {
      const result = await runGeminiWrapper(modifyPlanSystemPrompt, JSON.stringify(json));
      console.log(result);
      return result
  } catch(error) {
      console.error("ERROR: " + error);
  }
}