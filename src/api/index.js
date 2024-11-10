import axios from 'axios';

const URL = 'https://travel-advisor.p.rapidapi.com/restaurants/list-in-boundary';

const options = {
  params: {
    bl_latitude: '11.847676',
    tr_latitude: '12.838442',
    bl_longitude: '109.095887',
    tr_longitude: '109.149359',
  },
  headers: {
    'x-rapidapi-key': '3acb814468msh4c2710a101f5c07p124be3jsn3c1e14495b35',
    'x-rapidapi-host': 'travel-advisor.p.rapidapi.com'
  }
};


export const getPlacesData = async () => {
    try {
        const { data: {data}} = await axios.get(URL, options);

        return data;
    } catch (error) {
        console.log(error)


    }

}