import React, { useState, useEffect } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';

import { getPlacesData } from './api';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

const App = () => {
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);

    const [childClicked, setChildClicked] = useState(null);

    const [coordinates, setCoordinates] = useState();
    const [bounds, setBounds] = useState({}); // defining bound for Google Map (needed for API)

    const [isLoading, setIsLoading] = useState(false);  // loading state
    const [type, setType] = useState('restaurants');
    const [rating, setRating] = useState('');

    // only happens at the start
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(({coords: {latitude, longitude}}) => {
            console.log("Starting coordinates: " + latitude, longitude);
            if (latitude === undefined || longitude === undefined) {
                setCoordinates({lat: 0, lng: 0})
            } else {
                setCoordinates({lat: latitude, lng: longitude})
            }
        })
    }, [])

    // this occurs when the selected rating filter is changed
    useEffect(() => {
        const filteredPlaces = places.filter((place) => place.rating > rating);
        setFilteredPlaces(filteredPlaces);
    }, [rating]);

    // useEffect happens when type, coors and bounds changes
    useEffect(() => {
        if (bounds.sw && bounds.ne) {
            setIsLoading(true);
            //console.log(coordinates, bounds);

            getPlacesData(type, bounds.sw, bounds.ne)
                .then((data) => {
                    setPlaces(data?.filter((place) => place.name && place.num_reviews > 0));
                    setFilteredPlaces([]);
                    setIsLoading(false);
                })
        }
        
    }, [type, bounds]);

    return (
        <>
            <CssBaseline />
            <Header />
            <Grid container spacing={3} style={{width: '100%'}}>
                <Grid item xs={12} md={4}>
                    <List 
                        places={filteredPlaces.length ? filteredPlaces : places}
                        childClicked={childClicked}
                        isLoading={isLoading}
                        type={type}
                        setType={setType}
                        rating={rating}
                        setRating={setRating}
                        setCoordinates={setCoordinates}/>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Map 
                        setCoordinates={setCoordinates}
                        setBounds={setBounds}
                        coordinates={coordinates}
                        places={filteredPlaces.length ? filteredPlaces : places}
                        setChildClicked={setChildClicked}
                    />
                </Grid>
            </Grid>
        </>


    );
}

export default App;