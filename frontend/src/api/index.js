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
    const json = await response.json();
    console.log(json);
    return json;
  } catch (error) {
    console.error(error.message);
  }
};
