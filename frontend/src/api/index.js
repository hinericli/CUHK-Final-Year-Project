import axios from 'axios';

export const getWeatherData = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
    );
    console.log(response.data); //You can see all the weather data in console log
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getPlacesData = async (type, sw, ne) => {
    try {
        const { data: {data}} = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-in-boundary`, {
          params: {
            bl_latitude: sw.lat,
            tr_latitude: ne.lat,
            bl_longitude: sw.lng,
            tr_longitude: ne.lng,
          },
          headers: {
            'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
            'x-rapidapi-host': 'travel-advisor.p.rapidapi.com'
          }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
}

export const getPlan = async (i) => {
  const url = `http://localhost:3000/plan/${i}`;
  try {
    const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
      });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
};

export const getMaxPlanId = async () => {
  const url = `http://localhost:3000/max-plan-id/`;
  try {
    const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
      });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

export const addActivityToPlan = async (planId, day, activityData) => {
  try {
    const response = await fetch(`http://localhost:3000/plan/${planId}/${day}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData)
    });

    if (!response.ok) {
      throw new Error('Failed to add activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

export const loadPlan = async (planJson) => {
  // for TEXT input
  try {
      const response = await fetch(`http://localhost:3000/plan/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: planJson
      });
      const data = await response.json();
  } catch (error) {
      console.log(error.message);
  }
}

export const saveJson = async (planJson) => {
  // for JSON OBJECT input
  try {
    console.log(planJson)
      const response = await fetch(`http://localhost:3000/save-json/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(planJson)
      });
      const data = await response.json();
  } catch (error) {
      console.log(error.message);
  }
}

export const deletePlanById = async (planId) => {
  try {
    const response = await fetch(`http://localhost:3000/plan/${planId}`, {
        method: 'DELETE',
    });
    const data = await response.text();
    console.log(data)
  } catch (error) {
      console.log(error.message);
  }

}