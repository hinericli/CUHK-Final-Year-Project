import React, { useState, useEffect, createContext } from 'react';
import { CssBaseline, Grid, Typography, Button } from '@material-ui/core';
import EventNoteIcon from '@material-ui/icons/EventNote';
import LanguageIcon from '@material-ui/icons/Language';

import { getPlacesData } from './api';
import Header from './components/Header/Header';
import DiscoverList from './components/DiscoverList/DiscoverList';
import Planner from './components/Planner/Planner';
import Map from './components/Map/Map';

export const CoordinatesContext = createContext();
export const MapPlacesContext = createContext();
export const DisplayingTableContext = createContext();

const App = () => {
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);

    const [childClicked, setChildClicked] = useState(null);

    const [coordinates, setCoordinates] = useState();
    const [bounds, setBounds] = useState({}); // defining bound for Google Map (needed for API)

    const [isLoading, setIsLoading] = useState(false);  // loading state
    const [type, setType] = useState('restaurants');
    const [rating, setRating] = useState('');

    const [displayingTable, setDisplayingTable] = useState('Planner');

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

    // useEffect happens when type and bounds changes
    useEffect(() => {
        if (bounds.sw && bounds.ne) {
            setIsLoading(true);
            //console.log(coordinates, bounds);
            
            if (displayingTable === "Discover") {
                getPlacesData(type, bounds.sw, bounds.ne)
                    .then((data) => {
                        setPlaces(data?.filter((place) => place.name && place.num_reviews > 0));
                        setFilteredPlaces([]);
                    })
            }
            setIsLoading(false);
        }
        
    }, [type, bounds]);

    const components = {
        "Planner": 
        <Planner />,
        "Discover": 
            <DiscoverList 
                places={filteredPlaces.length ? filteredPlaces : places}
                childClicked={childClicked}
                isLoading={isLoading}
                type={type}
                setType={setType}
                rating={rating}
                setRating={setRating}
                setCoordinates={setCoordinates}/>
    }

    return (
        <>
            <CssBaseline />
            <Header />

            <DisplayingTableContext.Provider value={{displayingTable, setDisplayingTable}}>
            <MapPlacesContext.Provider value={{places, setPlaces}}>
            <CoordinatesContext.Provider value={{coordinates, setCoordinates}}>
            <Grid container style={{
                  display: "flex",
                  justifyContent: "spaceAround",
                  alignItems: "center",
                  position: "fixed",
                  bottom: 0,
                  width: "100%"
                  }}>
                <Grid item xs={6} md={2} style={{display: 'flex', justifyContent: "center", gap: "5px 10px"}}>
                    <EventNoteIcon/>
                    <Button variant="text" onClick={() => setDisplayingTable('Planner')}>Planner</Button>
                </Grid>
                <Grid item xs={6} md={2} style={{display: 'flex', justifyContent: "center", gap: "5px 10px"}}>
                    <LanguageIcon/>
                    <Button variant="text" onClick={() => setDisplayingTable('Discover')}>Discover</Button>
                </Grid>
            </Grid>
            
            <Grid container spacing={3} style={{width: '100%'}}>
                <Grid item xs={12} md={4}>
                    {components[displayingTable]}
                </Grid>
                <Grid item xs={12} md={8}>
                    <Map 
                        setCoordinates={setCoordinates}
                        setBounds={setBounds}
                        coordinates={coordinates}
                        setChildClicked={setChildClicked}
                    />
                </Grid>
            </Grid>
            </CoordinatesContext.Provider>
            </MapPlacesContext.Provider>
            </DisplayingTableContext.Provider>
        </>


    );
}

export default App;