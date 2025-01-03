import React, { useState, useContext, useEffect, useMemo, act, createContext } from 'react';
import { Typography, Button, Container, CardContent, CardActions, Box, MenuItem, Menu } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Grid, Row, Col } from 'react-flexbox-grid';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

import AddActivity from '../AddActivity/AddActivity';
import dayjs from 'dayjs';

import useStyles from './styles';
import { MapPlacesContext } from '../../App';
import Activity from './Activity';
import SelectPlan from '../SelectPlan/SelectPlan';
import { getWeatherData } from '../../api';

export const PlanContext = createContext();
export const ActivitiesListContext = createContext();

const customParseFormat = require("dayjs/plugin/customParseFormat");
var toObject = require("dayjs/plugin/toObject");
dayjs.extend(customParseFormat);
dayjs.extend(toObject)

const savePlan = () => {};  // placeholder

// add 0 to the single digit (for hours and minutes)
function singleDigitTransformer(value) {
    if (value.toString().length === 1) {
        value = "0" + value;
    }
    return value;
}

function handlePlaceName(place) {
    if (!place) return "/";

    if (place.name === place.formatted_address) {
        return place.name
    } else {
        return (place.name + ", " + place.formatted_address)
    }
}

const Planner = (setCoordinates) => {
    const classes = useStyles();
    const {places, setPlaces} = useContext(MapPlacesContext);   // places to be displayed on map

    const [plan, setPlan] = useState(null);
    const [currentDay, setCurrentDay] = useState(0); // Index of the current viewing day
    const [weatherData, setWeatherData] = useState(null);
    const [activityList, setActivityList] = useState([]);   
    const [toBeAddedActivity, setToBeAddedActivity] = useState({
        name: '',
        type: '',
        startDateTime: null,
        endDateTime: null,
        place: '',
        cost: 0,
        description: ''
    });
    const [showAdditionalInfo, setShowAdditionalInfo] = useState({});
    const [displayingComponent, setDisplayingComponent] = useState('Planner'); // This includes SelectPlan, Planner, AddActivity

    // --- Delete Activity ---
    const deleteActivity = (delIndex) => {
        let newActivityList = activityList.filter((_, index) => index !== delIndex)
        setActivityList(newActivityList);
        if (plan === null) return
        plan.dayList[currentDay].activities = newActivityList
    };
    // ensure that the places updates after the activity list updates (for showing map pins and routes correctly)
    useEffect(() => {
        setPlaces(activityList.map(activity => activity.place.place))
        savePlan(plan)
    }, [activityList])

    // Push new Activity when there's a new Activity to be added (clicked the FINISH button)
    useMemo(() => {
        // add new activity to activityList
        activityList.push(
            new Activity(
                toBeAddedActivity.name,  
                toBeAddedActivity.type,
                toBeAddedActivity.startDateTime,
                toBeAddedActivity.endDateTime,
                toBeAddedActivity.place,
                toBeAddedActivity.cost,
                toBeAddedActivity.description
            )
        )
        // sort the activities according to the startDateTime
        let sortedActivities = activityList.sort((a, b) => {
            if (a.startDateTime && b.startDateTime) {
                const dateA = new Date(
                    a.startDateTime.years,
                    a.startDateTime.months,
                    a.startDateTime.date,
                    a.startDateTime.hours,
                    a.startDateTime.minutes
                );
                const dateB = new Date(
                    b.startDateTime.years,
                    b.startDateTime.months,
                    b.startDateTime.date,
                    b.startDateTime.hours,
                    b.startDateTime.minutes
                );
                return dateA - dateB;
            }
            return 0;
        });
        setActivityList(sortedActivities);
        setPlaces(sortedActivities.map(activity => activity.place.place))
        if (plan === null) return
        plan.dayList[currentDay].activities = sortedActivities
        savePlan(plan)
    }, [toBeAddedActivity])

    // pop out the empty object first when start
    useEffect(() => {
        activityList.pop()
        //activityList[0]?.place?getWeatherData(22.314162085829565, 113.91225954047268)
        //let lat = activityList[0]?.place?.place?.geometry?.location.lat(), lng=activityList[0]?.place?.place?.geometry?.location.lng();
        //if (lat!=undefined && lng!=undefined) {
        setWeatherData(getWeatherData(22.314162085829565, 113.91225954047268))
        //}
    }, [])

    // Change Day
    const switchToPreviousDay = () => {
        setCurrentDay(currentDay - 1 < 0 ? 0 : currentDay - 1);
    };

    const switchToNextDay = () => {
        setCurrentDay(currentDay + 1 >= plan.dayCount ? plan.dayCount - 1 : currentDay + 1);
    };

    const getCostSum = () => {
        let costList = plan?.dayList[currentDay]?.activities.map(activity => Number(activity.cost)) || [];
        let totalCost = costList.reduce((acc, cost) => acc + cost, 0);  // sum up all the cost
        
        return String(Number(totalCost).toFixed(2));
    }

    const toggleAdditionalInfo = (index) => {
        setShowAdditionalInfo(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    useEffect(() => {
        setActivityList(plan?plan.dayList[currentDay].activities:[])
    }, [currentDay])

    // Convert day of week index/number stored by dayjs to day word
    const toDayName = (dayOfWeekNum) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return daysOfWeek[dayOfWeekNum];
    }

    const activityTypeName = ["Restaurant", "Hotel", "Attraction", "Flight", "Others"] 
    let currentDayJS = dayjs(plan?.startingDate?.add(currentDay, 'day'))
    const components = {
        "Planner":   
        <>
        <Grid fluid >
            <Button variant="text" onClick={() => switchToPreviousDay()}>
                <ChevronLeftIcon style={{position: "fixed", top: "50%", left: 0}}/>
            </Button>
            <Button variant="text" onClick={() => switchToNextDay()}>
                <ChevronRightIcon style={{position: "fixed", top: "50%", left: "30%"}}/>
            </Button>
        </Grid>

        <Grid fluid >
        <Row className={classes.title}> <Typography>{currentDayJS.format('DD/MM/YYYY')}</Typography> </Row>

        <Row>
            <Col xs={4} className={classes.title}> <Typography>{toDayName(currentDayJS.day())}</Typography> </Col>
            <Col xs={4} className={classes.title}> <Typography>
                21°
            </Typography> <WbSunnyIcon/> </Col>
            <Col xs={4} className={classes.title}> <Typography>Cost: ${getCostSum()}</Typography> </Col>
        </Row>
        
        <Row className={classes.subtitle}>
            <Col xs={4} md={3}>
                <Typography>Time</Typography>
            </Col>
            <Col xs={8} md={9}>
                <Typography>Activity</Typography>
            </Col>
        </Row>
        
        {
            activityList?.map((activity, i) => {
                return (
                    <>
                    <Row key={i}>
                        <Col xs={4} md={3}>
                            <CardContent>
                                <Typography variant="subtitle1">
                                    {activity.startDateTime? 
                                        singleDigitTransformer(activity.startDateTime.hours) + ":" + singleDigitTransformer(activity.startDateTime.minutes) : 
                                        '-'}
                                </Typography>
                                <Typography variant="subtitle1">
                                    {activity.endDateTime ? singleDigitTransformer(activity.endDateTime.hours) + ":" + singleDigitTransformer(activity.endDateTime.minutes) : '-'}
                                </Typography>
                            </CardContent>
                        </Col>

                        <Col xs={8} md={9}>
                        <CardContent>
                            {i+1}
                            <Typography gutterBottom variant="subtitle1">{activity.name? activity.name : '?'}</Typography>
                            <Box display="flex">
                                <LocationOnIcon/> 
                                <Typography gutterBottom variant="subtitle2">{handlePlaceName(activity.place.place)}</Typography>
                            </Box>
                            <CardActions display="flex" justifyContent="space-between">
                                <Button size="small" color="primary" onClick={() => toggleAdditionalInfo(i)}>
                                    {showAdditionalInfo[i] ? "Hide Info" : "More Info"}
                                </Button>
                                <Button size="small" color="primary" onClick={() => deleteActivity(i)}>
                                    Delete
                                </Button>
                            </CardActions>

                            {showAdditionalInfo[i] && (
                            <>
                                <Typography>Type: {activityTypeName[Number(activity.type)/10 - 1]}</Typography>
                                <Typography>Cost: ${activity.cost}</Typography>
                                <Typography>Description: {activity.description}</Typography>
                                <Typography>Summary: {activity.place.editorialSummary?activity.place.editorialSummary:'-'}</Typography>
                            </>
                            )}
                            

                        </CardContent>
                        </Col>
                    </Row>
                    </>
                )
            })
        }

        <Row className={classes.plusButton}>
            <Button variant="outlined" onClick={() => {setDisplayingComponent('AddActivity')}}> <AddCircleIcon/> </Button>
        </Row>
        </Grid>
        </>
        ,
        "AddActivity": 
            <AddActivity 
                setCoordinates={setCoordinates}
                setDisplayingComponent={setDisplayingComponent}
                setToBeAddedActivity={setToBeAddedActivity}/>
        ,
        "SelectPlan":
            <SelectPlan 
                setDisplayingComponent={setDisplayingComponent}
            />
    }


    return (
        <>
        <PlanContext.Provider value={{plan, setPlan}}>
        <ActivitiesListContext.Provider value={{activityList, setActivityList}}>
            {components[displayingComponent]}
        </ActivitiesListContext.Provider>
        </PlanContext.Provider>

        </>
    );

}

export default Planner;

/*
<Button
    size="small"
    color="primary"
    onClick={() => {
        if (i >= 0 && i < activityList.length) {
            swapActivities(i-1, i);
        }
    }}
>
    <ArrowUpwardIcon/>
</Button>
<Button
    size="small"
    color="primary"
    onClick={() => {
        if (i >= 0 && i < activityList.length) {
            swapActivities(i, i + 1);
        }
    }}
>
    <ArrowDownwardIcon/>
</Button>

*/