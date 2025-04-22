import React, { useState, useEffect, createContext, useContext } from 'react';
import { CssBaseline, Grid, Typography, Button } from '@material-ui/core';
import EventNoteIcon from '@material-ui/icons/EventNote';
import LanguageIcon from '@material-ui/icons/Language';

import { getPlacesData } from '../api';
import Header from './components/Header/Header';
import DiscoverList from './components/DiscoverList/DiscoverList';
import Planner from './components/Planner/Planner';
import Map from './components/Map/Map';
import PlanSuggestion from './components/PlanSuggestion/PlanSuggestion';

// Unified context for all state and setters
export const AppContext = createContext();

const App = () => {
    // --- State for planner ---
    const [plan, setPlan] = useState(null);

    // --- State for discover page ---
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [childClicked, setChildClicked] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState('restaurants');
    const [rating, setRating] = useState('');
    const [selectedPlaceFromDiscover, setSelectedPlaceFromDiscover] = useState(null);   // for adding activity

    // --- State for map ---
    const [coordinates, setCoordinates] = useState();
    const [bounds, setBounds] = useState({});
    const [directionColor, setDirectionColor] = useState('#0000FF');
    const [directionInformation, setDirectionInformation] = useState([]);   // for storing directions information

    // --- State for planner page ---
    const [activityList, setActivityList] = useState([]);
    const [currentDay, setCurrentDay] = useState(0);
    const [selectedActivityCardCoord, setSelectedActivityCardCoord] = useState(null);
    const [toBeAddedActivity, setToBeAddedActivity] = useState({
        name: '',
        type: '',
        startDateTime: null,
        endDateTime: null,
        place: '',
        cost: 0,
        description: ''
    });

    // --- State for displaying table ---
    const [displayingTable, setDisplayingTable] = useState('Planner'); // Planner or Discover
    const [displayingComponent, setDisplayingComponent] = useState('SelectPlan');  

    // --- State for LLM integration ---
    const [generatedResponseData, setGeneratedResponseData] = useState(null);

    useEffect(() => {
        if (displayingTable === "Planner" && displayingComponent === "Planner") {
            const previousActivityList = plan.dayList[currentDay].activities
            setActivityList(previousActivityList)
        }
    }, [displayingTable])

    // Initialize coordinates with geolocation
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            console.log("Starting coordinates:", latitude, longitude);
            setCoordinates(
                latitude === undefined || longitude === undefined
                    ? { lat: 0, lng: 0 }
                    : { lat: latitude, lng: longitude }
            );
        });
    }, []);

    // Filter places based on rating
    useEffect(() => {
        const filtered = places.filter((place) => place.rating > rating);
        setFilteredPlaces(filtered);
    }, [rating, places]);

    // Fetch places data when type, bounds, or displayingTable changes
    useEffect(() => {
        if (bounds.sw && bounds.ne && displayingTable === 'Discover') {
            setIsLoading(true);
            getPlacesData(type, bounds.sw, bounds.ne).then((data) => {
                setPlaces(data?.filter((place) => place.name && place.num_reviews > 0));
                setFilteredPlaces([]);
                setIsLoading(false);
            });
        }
    }, [type, bounds, displayingTable]);

    // Component mapping for Planner and Discover
    const components = {
        Planner: (
            <Planner/>
        ),
        Discover: (
            <DiscoverList
                places={filteredPlaces.length ? filteredPlaces : places}
                childClicked={childClicked}
                isLoading={isLoading}
                type={type}
                setType={setType}
                rating={rating}
                setRating={setRating}
                setCoordinates={setCoordinates}
            />
        ),
    };

    // Context value containing all state and setters
    const contextValue = {
        plan,
        setPlan,
        places,
        setPlaces,
        filteredPlaces,
        setFilteredPlaces,
        childClicked,
        setChildClicked,
        isLoading,
        setIsLoading,
        type,
        setType,
        rating,
        setRating,
        coordinates,
        setCoordinates,
        bounds,
        setBounds,
        directionColor,
        setDirectionColor,
        selectedActivityCardCoord,
        setSelectedActivityCardCoord,
        toBeAddedActivity,
        setToBeAddedActivity,
        displayingTable,
        setDisplayingTable,
        displayingComponent,
        setDisplayingComponent,
        generatedResponseData,
        setGeneratedResponseData,
        directionInformation,
        setDirectionInformation,
        selectedPlaceFromDiscover,
        setSelectedPlaceFromDiscover,
        activityList,
        setActivityList,
        currentDay,
        setCurrentDay,
    };

    return (
        <AppContext.Provider value={contextValue}>
            <CssBaseline />
            <Header
                setDirectionColor={setDirectionColor}
                directionColor={directionColor}
            />
            <Grid
                container
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                }}
            >
                <Grid item xs={6} md={2} style={{ display: 'flex', justifyContent: 'center', gap: '5px 10px' }}>
                    <EventNoteIcon />
                    <Button variant="text" onClick={() => setDisplayingTable('Planner')}>
                        Planner
                    </Button>
                </Grid>
                <Grid item xs={6} md={2} style={{ display: 'flex', justifyContent: 'center', gap: '5px 10px' }}>
                    <LanguageIcon />
                    <Button variant="text" onClick={() => setDisplayingTable('Discover')}>
                        Discover
                    </Button>
                </Grid>
                <Grid item xs={0} md={8} style={{ display: 'flex', justifyContent: 'center', gap: '5px 10px' }}>
                    <PlanSuggestion
                        setGeneratedResponseData={setGeneratedResponseData}
                        displayingComponent={displayingComponent}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3} style={{ width: '100%' }}>
                <Grid item xs={12} md={4}>
                    {components[displayingTable]}
                </Grid>
                <Grid item xs={12} md={8}>
                    <Map
                        setCoordinates={setCoordinates}
                        setBounds={setBounds}
                        coordinates={coordinates}
                        setChildClicked={setChildClicked}
                        directionColor={directionColor}
                    />
                </Grid>
            </Grid>
        </AppContext.Provider>
    );
};

export default App;