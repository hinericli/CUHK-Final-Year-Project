import React from 'react';
import { Typography, Button } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import { Grid, Row, Col } from 'react-flexbox-grid';
import AddCircleIcon from '@material-ui/icons/AddCircle';

import useStyles from './styles';

class Activity {
    constructor(name, type, time, locationName, locationCoord, cost, description) {
        this.name = name;
        this.type = type;
        this.time = time;
        this.locationName = locationName;
        this.locationCoord = locationCoord;
        this.cost = cost;
        this.description = description;
    };
}

class Day {
    constructor(date, activities) {
        this.date=date;
    }


}

const Planner = ({setDisplayingTable}) => {
    //let day1 = new Day("5 Nov 2003");
    const classes = useStyles();

    const activities = [
        new Activity(
            "Arrive at Airport",
            "Flight",
            "09:00-10:00",
            "HKG Hong Kong International Airport",
            (22.313713700870554, 113.91504060256236),
            200,
            " "
        ),
        new Activity(
            "Arrive at Airport",
            "Flight",
            "12:30",
            "Taiwan Taoyuan International Airport",
            (25.080411539260467, 121.2311525767259),
            0,
            " "
        ),
    ];

    return (
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
                    activities?.map((activity) => {
                        return (
                            <>
                            <Row>
                                <Col xs={4} md={3}>
                                    <Typography variant="subtitle1">{activity.time? activity.time : 'Unfound time'}</Typography>
                                </Col>
                                <Col xs={8} md={9}>
                                    <Typography variant="subtitle1">{activity.name? activity.name : 'Unfound Name'}</Typography>
                                    <Typography gutterBottom variant="caption" className={classes.subtitles}>
                                        <LocationOnIcon/> {activity.locationName? activity.locationName : ""}
                                    </Typography>
                                </Col>
                            </Row>
                            </>
                            )
                        }
                    )   
                }
                
                <Row className={classes.plusButton}>
                    <Button variant="outlined" onClick={() => {setDisplayingTable('AddActivity')}}> <AddCircleIcon/> </Button>
                </Row>
            </Grid>

            
        </>
    );

}




export default Planner;