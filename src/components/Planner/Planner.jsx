import React, { useState, useContext, useEffect, useMemo, act } from 'react';
import { Typography, Button, Container } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import { Grid, Row, Col } from 'react-flexbox-grid';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AddActivity from '../AddActivity/AddActivity';
import dayjs from 'dayjs';

import useStyles from './styles';
import { MapPlacesContext } from '../../App';
import Activity from './Activity';

class Day {
    constructor(date, activities) {
        this.date=date;
    }
}

const customParseFormat = require("dayjs/plugin/customParseFormat");
var toObject = require("dayjs/plugin/toObject");
dayjs.extend(customParseFormat);
dayjs.extend(toObject)

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
    const {places, setPlaces} = useContext(MapPlacesContext);

    const [displayingComponent, setDisplayingComponent] = useState('Planner');

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


    // Push new Activity when there's a new Activity to be added (clicked the FINISH button)
    useMemo(() => {
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
        setActivityList(activityList)
        //console.log(activityList.map(activity => activity.place.place))
        setPlaces(activityList.map(activity => activity.place.place))
        //console.log(activityList)
    }, [toBeAddedActivity])

    // pop out the empty object first when start
    useEffect(() => {
        activityList.pop()
    }, [])

    const components = {
        "Planner":   
        <>
        <Grid fluid >
        <Row className={classes.title}> <Typography>26/7 - 29/7</Typography> </Row>

        <Row>
            <Col xs={4} className={classes.title}> <Typography>28/7 Saturday</Typography> </Col>
            <Col xs={4} className={classes.title}> <Typography>26° </Typography> <WbSunnyIcon/> </Col>
            <Col xs={4} className={classes.title}> <Typography>Cost: $400</Typography> </Col>
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
            activityList?.map((activity) => {
                return (
                    <>
                    <Row>
                        <Col xs={4} md={3}>
                            <Typography variant="subtitle1">
                                {activity.startDateTime? 
                                    singleDigitTransformer(activity.startDateTime.hours) + ":" + singleDigitTransformer(activity.startDateTime.minutes) : 
                                    '-'}
                            </Typography>
                            <Typography variant="subtitle1">
                                {activity.endDateTime ? singleDigitTransformer(activity.endDateTime.hours) + ":" + singleDigitTransformer(activity.endDateTime.minutes) : '-'}
                            </Typography>
                        </Col>
                        <Col xs={8} md={9}>
                            <Typography variant="subtitle1">{activity.name? activity.name : '?'}</Typography>
                            <Typography gutterBottom variant="caption">
                                <LocationOnIcon/> 
                                    { handlePlaceName(activity.place.place) }
                            </Typography>
                        </Col>
                        <Typography>---</Typography>
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
    }


    return (
        <>
            {components[displayingComponent]}
        </>

    );

}

/*
const mapList = (activities) => {
    //let [_, ...activities] = activityList;
        activities?.map((activity) => {
            return (
            (
                <>
                <Row>
                    <Col xs={4} md={3}>
                        <Typography variant="subtitle1">{activity.startDateTime ? activity.startDateTime : 'Unfound time'}</Typography>
                        <Typography variant="subtitle1">{activity.endDateTime ? activity.endDateTime : 'Unfound time'}</Typography>
                    </Col>
                    <Col xs={8} md={9}>
                        <Typography variant="subtitle1">{activity.name? activity.name : 'Unfound Name'}</Typography>
                        <Typography gutterBottom variant="caption">
                            <placeOnIcon/> {activity.place? activity.place : ""}
                        </Typography>
                    </Col>
                </Row>
                </>
            )
        )
        }
        
    )

}
    */

export default Planner;