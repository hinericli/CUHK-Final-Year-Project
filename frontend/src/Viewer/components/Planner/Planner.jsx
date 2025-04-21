import React, { useState, useContext, useEffect, useMemo, createContext } from 'react';
import { Typography, Button, Container, CardContent, CardActions, Box, MenuItem, Menu, Card, CardMedia, Chip, Select, FormControl, InputLabel, Fade } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Grid, Row, Col } from 'react-flexbox-grid';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import AddActivity from '../AddActivity/AddActivity';
import EditActivityDialog from '../EditActivity/EditActivityDialog';
import dayjs from 'dayjs';

import useStyles from './styles';
import { MapPlacesContext } from '../../Viewer';
import SelectPlan from '../SelectPlan/SelectPlan';
import { getPlan, getWeatherData } from '../../../api';
import { singleDigitTransformer, stringToDateObj } from '../../../utils/DateUtils';
import { handlePlaceName } from '../../../utils/placeUtils';

import { toBeAddedActivityContext } from '../../Viewer';
import { DisplayingComponentContext } from '../../Viewer';
import { sortActivities } from '../../../utils/ActivitiesUtils';

export const PlanContext = createContext();
export const ActivitiesListContext = createContext();
export const CurrentDayContext = createContext();

const customParseFormat = require("dayjs/plugin/customParseFormat");
var toObject = require("dayjs/plugin/toObject");
dayjs.extend(customParseFormat);
dayjs.extend(toObject)

const Planner = () => {
    const classes = useStyles();
    const {places, setPlaces} = useContext(MapPlacesContext);   // places to be displayed on map
    const {toBeAddedActivity, setToBeActivity} = useContext(toBeAddedActivityContext);
    const {displayingComponent, setDisplayingComponent} = useContext(DisplayingComponentContext)

    const [plan, setPlan] = useState(null);
    const [currentDay, setCurrentDay] = useState(0); // Index of the current viewing day
    const [weatherData, setWeatherData] = useState(null);
    const [activityList, setActivityList] = useState([]);
    const [showAdditionalInfo, setShowAdditionalInfo] = useState({});
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuActivityIndex, setMenuActivityIndex] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const handleMenuOpen = (event, index) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuActivityIndex(index);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuActivityIndex(null);
    };

    const handleMenuAction = (action) => {
        console.log('Menu action triggered:', action, 'for activity index:', menuActivityIndex);
        if (action === "toggleInfo") {
            toggleAdditionalInfo(menuActivityIndex);
        } else if (action === "delete") {
            deleteActivity(menuActivityIndex);
        } else if (action === "edit") {
            console.log('Edit action: setting selected activity and opening dialog');
            setSelectedActivity(activityList[menuActivityIndex]);
            setEditDialogOpen(true);
            setDisplayingComponent("EditActivity");
        }
        handleMenuClose();
    };

    // --- Delete Activity ---
    const deleteActivity = (delIndex) => {
        let newActivityList = activityList.filter((_, index) => index !== delIndex)
        setActivityList(newActivityList);
        if (plan === null) return
        plan.dayList[currentDay].activities = newActivityList
    };

    // ensure that the places updates after the activity list updates (for showing map pins and routes correctly)
    useEffect(() => {
        setPlaces(activityList.map(activity => activity.place))
    }, [activityList])

    // pop out the empty object first when start
    useEffect(() => {
        activityList.pop()
        const sortedActivities = sortActivities(activityList)
        setActivityList(sortedActivities)
        setWeatherData(getWeatherData(22.314162085829565, 113.91225954047268))
    }, [])

    // Push new Activity when there's a new Activity to be added (clicked the FINISH button)
    useMemo(() => {
        if (!toBeAddedActivity || !toBeAddedActivity.name) return; // Prevent adding empty activities
        console.log('Adding new activity:', toBeAddedActivity);
        activityList.push(
            {
                name: toBeAddedActivity.name,
                type: toBeAddedActivity.type,
                startDateTime: toBeAddedActivity.startDateTime,
                endDateTime: toBeAddedActivity.endDateTime,
                place: toBeAddedActivity.place,
                cost: toBeAddedActivity.cost,
                description: toBeAddedActivity.description
            }
        )
        const sortedActivities = sortActivities(activityList)
        setActivityList(sortedActivities)
        setPlaces(activityList.map(activity => activity.place))
        if (plan === null) return
        plan.dayList[currentDay].activities = activityList
    }, [toBeAddedActivity])

    useEffect(() => {
        console.log('Current Plan: ', plan);
        let initialActivityList = [], i = 0;
        if (plan?.dayList[currentDay] === null) return;

        while (plan?.dayList[currentDay].activities[i] != null) {
            initialActivityList.push(plan.dayList[currentDay].activities[i]);
            i++;
        }
        setPlaces(initialActivityList.map(activity => activity.place));
        const sortedActivities = sortActivities(initialActivityList)
        setActivityList(sortedActivities)
        setCurrentDay(0)
    }, [plan])

    // Change Day
    const switchToPreviousDay = () => {
        setCurrentDay(currentDay - 1 < 0 ? 0 : currentDay - 1);
    };

    const switchToNextDay = () => {
        setCurrentDay(currentDay + 1 >= plan.dayCount ? plan.dayCount - 1 : currentDay + 1);
    };

    const getCostSum = () => {
        let costList = plan?.dayList[currentDay]?.activities.map(activity => Number(activity.cost?activity.cost:0)) || [];
        let totalCost = costList.reduce((acc, cost) => acc + cost, 0);  // sum up all the cost

        return String(Number(totalCost).toFixed(2));
    }

    const toggleAdditionalInfo = (index) => {
        setShowAdditionalInfo(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleBackButtonClick = () => {
        setDisplayingComponent("SelectPlan")
        setPlaces([])
    }

    useEffect(() => {
        setActivityList(plan ? plan.dayList[currentDay].activities : [])
    }, [currentDay])

    // Convert day of week index/number stored by dayjs to day word
    const toDayName = (dayOfWeekNum) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return daysOfWeek[dayOfWeekNum];
    }

    const activityTypeName = ["Restaurant", "Hotel", "Attraction", "Flight", "Others"]
    let startingDate = dayjs(plan?.startingDate), currentDayJS = dayjs(startingDate?.add(currentDay, 'day'));
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
        <Button variant="text" onClick={() => handleBackButtonClick()}>
            <ArrowBackIcon/>
        </Button>

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
                                    {singleDigitTransformer(stringToDateObj(plan?.dayList[currentDay]?.activities[i]?.startDateTime)?.hours) + ":"
                                    + singleDigitTransformer(stringToDateObj(plan?.dayList[currentDay]?.activities[i]?.startDateTime)?.minutes)}
                                    -
                                    {singleDigitTransformer(stringToDateObj(plan?.dayList[currentDay]?.activities[i]?.endDateTime)?.hours) + ":"
                                    + singleDigitTransformer(stringToDateObj(plan?.dayList[currentDay]?.activities[i]?.endDateTime)?.minutes)}
                                </Typography>
                            </CardContent>
                        </Col>

                        <Col xs={7} md={8}>
                        <Card elevation={2} className={classes.styledCard}>
                            <CardContent className={classes.cardContent}>
                                <Typography gutterBottom variant="h6">{activity.name ? activity.name : '?'}</Typography>
                                <Box gutterBottom display="flex">
                                    <LocationOnIcon />
                                    <Typography variant="subtitle2">{activity.place ? handlePlaceName(activity.place) : ""}</Typography>
                                </Box>
                                <Box display="flex" flexDirection="column">
                                    <Typography
                                    className={classes.valueTypography}
                                    style={{ lineHeight: 1.5 }}
                                    >
                                    {activity.description || 'No description available'}
                                    </Typography>
                                </Box>

                                {showAdditionalInfo[i] && (
                                    <Fade in={showAdditionalInfo[i]} timeout={500}>
                                        <Card className={classes.styledCard}>
                                        <CardContent>
                                            <Box display="flex" flexDirection="column" gap={1}>
                                            <Box display="flex" alignItems="center">
                                                <Typography className={classes.labelTypography}>Type:</Typography>
                                                <Typography className={classes.valueTypography}>
                                                {activityTypeName[Number(activity.type) / 10 - 1] || 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center">
                                                <Typography className={classes.labelTypography}>Cost:</Typography>
                                                <Typography className={classes.valueTypography}>
                                                {activity.cost ? `$${activity.cost.toFixed(2)}` : 'Free'}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" flexDirection="column">
                                                <Typography className={classes.labelTypography}>Summary:</Typography>
                                                <Typography
                                                className={classes.valueTypography}
                                                style={{ lineHeight: 1.5 }}
                                                >
                                                {activity.place?.editorialSummary || 'No summary available'}
                                                </Typography>
                                            </Box>
                                            </Box>
                                        </CardContent>
                                        </Card>
                                    </Fade>
                                    )
                                }
                            </CardContent>
                        </Card>
                        </Col>

                        <Col xs={1} md={1}>
                            <CardActions display="flex" justifyContent="space-between">
                                <Button size="small" onClick={(e) => handleMenuOpen(e, i)}>
                                    <MoreVertIcon />
                                </Button>
                                <Menu
                                    anchorEl={menuAnchorEl}
                                    open={Boolean(menuAnchorEl) && menuActivityIndex === i}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={() => handleMenuAction("toggleInfo")}>
                                        {showAdditionalInfo[i] ? "Hide Info" : "More Info"}
                                    </MenuItem>
                                    <MenuItem onClick={() => handleMenuAction("edit")}>
                                        Edit
                                    </MenuItem>
                                    <MenuItem onClick={() => handleMenuAction("delete")}>
                                        Delete
                                    </MenuItem>
                                </Menu>
                            </CardActions>
                        </Col>
                    </Row>
                    </>
                )
            })
        }

        <Row className={classes.plusButton}>
            <Button variant="outlined" onClick={() => {setDisplayingComponent("AddActivity")}}> <AddCircleIcon/> </Button>
        </Row>
        </Grid>
        </>
        ,
        "AddActivity":
            <AddActivity
                setDisplayingComponent={setDisplayingComponent}/>
        ,
        "EditActivity":
            <EditActivityDialog
                open={editDialogOpen}
                setOpen={setEditDialogOpen}
                setDisplayingComponent={setDisplayingComponent}
                activity={selectedActivity}
            />
        ,
        "SelectPlan":
            <SelectPlan
                setDisplayingComponent={setDisplayingComponent}
            />
    }

    console.log('Current displayingComponent:', displayingComponent);
    if (selectedActivity) console.log('Edit dialog open:', editDialogOpen, 'Selected activity:', selectedActivity);

    return (
        <>
        <CurrentDayContext.Provider value={{currentDay, setCurrentDay}}>
        <PlanContext.Provider value={{plan, setPlan}}>
        <ActivitiesListContext.Provider value={{activityList, setActivityList}}>
            {components[displayingComponent]}
        </ActivitiesListContext.Provider>
        </PlanContext.Provider>
        </CurrentDayContext.Provider>
        </>
    );
}

export default Planner;