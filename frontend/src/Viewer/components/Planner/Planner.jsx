import React, { useState, useContext, useEffect, useMemo, createContext } from 'react';
import { Typography, Button, Container, CardContent, CardActions, Box, MenuItem, Menu, Card, CardMedia, Chip, Select, FormControl, InputLabel, Fade, Checkbox } from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Grid, Row, Col } from 'react-flexbox-grid';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import isEqual from 'lodash/isEqual';

import AddActivity from '../AddActivity/AddActivity';
import EditActivityDialog from '../EditActivity/EditActivityDialog';
import dayjs from 'dayjs';

import useStyles from './styles';
import { AppContext } from '../../Viewer';
import SelectPlan from '../SelectPlan/SelectPlan';
import { getPlan, getWeatherData, updateActivityInPlan, deleteActivityById, addActivityToPlan } from '../../../api';
import { singleDigitTransformer, stringToDateObj } from '../../../utils/DateUtils';
import { handlePlaceName } from '../../../utils/placeUtils';
import { sortActivities } from '../../../utils/ActivitiesUtils';

const customParseFormat = require("dayjs/plugin/customParseFormat");
var toObject = require("dayjs/plugin/toObject");
dayjs.extend(customParseFormat);
dayjs.extend(toObject)

const Planner = () => {
    const classes = useStyles();
    const {
        plan,
        setPlaces,
        toBeAddedActivity,
        displayingComponent,
        setDisplayingComponent,
        setSelectedActivityCardCoord,
        directionInformation,
        activityList,
        setActivityList,
        currentDay,
        setCurrentDay,
    } = useContext(AppContext);

    const [weatherData, setWeatherData] = useState(null);
    const [showAdditionalInfo, setShowAdditionalInfo] = useState({});
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuActivityIndex, setMenuActivityIndex] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const handleMenuOpen = (event, index, isSubActivity = false, parentIndex = null) => {
        setMenuAnchorEl(event.currentTarget);
        setMenuActivityIndex({ index, isSubActivity, parentIndex });
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuActivityIndex(null);
    };

    const handleMenuAction = (action) => {
        const { index, isSubActivity, parentIndex } = menuActivityIndex || {};
        console.log('Menu action triggered:', action, 'for activity:', { index, isSubActivity, parentIndex });
        if (action === "toggleInfo") {
            toggleAdditionalInfo(index, isSubActivity, parentIndex);
        } else if (action === "delete") {
            deleteActivity(index, isSubActivity, parentIndex);
        } else if (action === "edit") {
            const activity = isSubActivity
                ? activityList[parentIndex].subActivities[index]
                : activityList[index];
            setSelectedActivity({ ...activity, parentIndex: isSubActivity ? parentIndex : null });
            setEditDialogOpen(true);
            setDisplayingComponent("EditActivity");
        }
        handleMenuClose();
    };

    // --- Delete Activity ---
    const deleteActivity = async (delIndex, isSubActivity = false, parentIndex = null) => {
        let newActivityList = activityList;

        // backend first
        const activityId = isSubActivity ? newActivityList[parentIndex].subActivities[delIndex]._id : newActivityList[delIndex]._id;
        if (activityId) {
            const deleteResponse = await deleteActivityById(activityId);
            console.log('Activity deleted:', deleteResponse);
        }

        // then frontend
        if (isSubActivity && parentIndex !== null) {
            newActivityList[parentIndex].subActivities = newActivityList[parentIndex].subActivities.filter((_, i) => i !== delIndex);
        } else {
            newActivityList = newActivityList.filter((_, index) => index !== delIndex);
        }
        setActivityList(newActivityList);
        if (plan) {
            plan.dayList[currentDay].activities = newActivityList;
        }
        
        // backend 
    };

    // --- Toggle Visited Status ---
    const toggleVisited = async (index, isSubActivity = false, parentIndex = null) => {
        console.log("activityList before toggleVisited: ", activityList);
        const updatedActivityList = [...activityList];
        let targetedActivity;

        if (isSubActivity && parentIndex !== null) {
            targetedActivity = updatedActivityList[parentIndex].subActivities[index];
            targetedActivity.isVisited = !targetedActivity.isVisited;
        } else {
            targetedActivity = updatedActivityList[index];
            targetedActivity.isVisited = !targetedActivity.isVisited;
        }

        setActivityList(updatedActivityList);
        console.log("targetedActivity: ", targetedActivity);

        if (plan && targetedActivity._id) {
            const updatedPlan = await updateActivityInPlan(
                plan.planId,
                currentDay,
                targetedActivity._id,
                targetedActivity
            );
            console.log('Activity updated:', updatedPlan);
            plan.dayList[currentDay].activities = updatedActivityList;
        }

        console.log("activityList after toggleVisited: ", activityList);
    };

    // --- Toggle Additional Info ---
    const toggleAdditionalInfo = (index, isSubActivity = false, parentIndex = null) => {
        const key = isSubActivity ? `sub_${parentIndex}_${index}` : index;
        setShowAdditionalInfo(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }));
    };

    // --- Handle Card Click ---
    const handleCardClick = (place) => {
        if (place && place.latitude && place.longitude) {
            setSelectedActivityCardCoord({
                lat: Number(place.latitude),
                lng: Number(place.longitude)
            });
        }
    };

    // --- Compute Places ---
    const computedPlaces = useMemo(() => {
        if (!activityList || activityList.length === 0) return [];
        const newPlaces = activityList.map(activity => {
            const activityPlaceGroup = [activity.place]; // Add main activity place
            if (activity.subActivities && activity.subActivities.length > 0) {
                activity.subActivities.forEach(subactivity => {
                    if (subactivity.place) {
                        activityPlaceGroup.push(subactivity.place);
                    }
                });
            }
            return activityPlaceGroup;
        });
        console.log('Computed places:', JSON.stringify(newPlaces, null, 2));
        return newPlaces;
    }, [activityList]);

    // --- Update Places ---
    useEffect(() => {
        //console.log("Updating places in useEffect:", JSON.stringify(computedPlaces, null, 2));
        setPlaces(prevPlaces => {
            if (isEqual(prevPlaces, computedPlaces)) {
                console.log("Places unchanged, skipping setPlaces");
                return prevPlaces;
            }
            console.log("Places changed, updating setPlaces");
            return computedPlaces;
        });
    }, [computedPlaces, setPlaces]);

    // Initialize on mount
    useEffect(() => {

        if (!activityList[0]) activityList.pop();
        const sortedActivities = sortActivities(activityList);
        setActivityList(sortedActivities);
        setWeatherData(getWeatherData(22.314162085829565, 113.91225954047268));
    }, []);

    // Handle new activity addition
    useMemo(async () => {
        if (!toBeAddedActivity) return;
        try {
            const newActivity = {
                name: toBeAddedActivity.name,
                type: toBeAddedActivity.type,
                startDateTime: toBeAddedActivity.startDateTime,
                endDateTime: toBeAddedActivity.endDateTime,
                place: toBeAddedActivity.place,
                cost: toBeAddedActivity.cost,
                description: toBeAddedActivity.description,
                isVisited: false,
                subActivities: toBeAddedActivity.subActivities || []
            };
            // adding activity to backend
            const addActivityResponse = await addActivityToPlan(plan.planId, currentDay, newActivity);
            console.log('Activity added with the following returned JSON:', addActivityResponse);

            // frontend
            if (!toBeAddedActivity || !toBeAddedActivity.name) return;
            console.log('Adding new activity:', toBeAddedActivity);
            const newActivityWithId = {
                _id: addActivityResponse.activityId,    // backend id
                name: toBeAddedActivity.name,
                type: toBeAddedActivity.type,
                startDateTime: toBeAddedActivity.startDateTime,
                endDateTime: toBeAddedActivity.endDateTime,
                place: toBeAddedActivity.place,
                cost: toBeAddedActivity.cost,
                description: toBeAddedActivity.description,
                isVisited: false,
                subActivities: toBeAddedActivity.subActivities || []
            };
            const updatedActivityList = [...activityList, newActivityWithId];
            const sortedActivities = sortActivities(updatedActivityList);
            setActivityList(sortedActivities);
            if (plan) {
                plan.dayList[currentDay].activities = sortedActivities;
            }

        } catch (error) {
            console.error('Error adding activity:', error);
        }

    }, [toBeAddedActivity]);

    // Initialize activity list from plan
    useEffect(() => {
        console.log('Current Plan: ', plan);
        if (!plan?.dayList[currentDay]) return;
        const initialActivityList = plan.dayList[currentDay].activities.map(activity => ({
            ...activity,
            isVisited: activity.isVisited || false,
            subActivities: activity.subActivities || []
        }));
        const sortedActivities = sortActivities(initialActivityList);
        setActivityList(sortedActivities);
        setCurrentDay(0);
    }, [plan]);

    // Update activity list on day change
    useEffect(() => {
        const initialActivityList = plan?.dayList[currentDay]?.activities || [];
        const sortedActivities = sortActivities(initialActivityList);
        setActivityList(sortedActivities);
        console.log('Day changed; sorted activities:', sortedActivities);
    }, [currentDay]);

    // Change Day
    const switchToPreviousDay = () => {
        setCurrentDay(currentDay - 1 < 0 ? 0 : currentDay - 1);
    };

    const switchToNextDay = () => {
        setCurrentDay(currentDay + 1 >= plan.dayCount ? plan.dayCount - 1 : currentDay + 1);
    };

    // Calculate total cost
    const getCostSum = () => {
        const costList = activityList.flatMap(activity => [
            Number(activity.cost || 0),
            ...(activity.subActivities?.map(subActivity => Number(subActivity.cost || 0)) || [])
        ]);
        const totalCost = costList.reduce((acc, cost) => acc + cost, 0);
        return String(Number(totalCost).toFixed(2));
    };

    const handleBackButtonClick = () => {
        setDisplayingComponent("SelectPlan");
        setActivityList([]);
        setPlaces([]);
    };

    // Convert day of week index to name
    const toDayName = (dayOfWeekNum) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return daysOfWeek[dayOfWeekNum];
    };

    const activityTypeName = ["Restaurant", "Hotel", "Attraction", "Flight", "Others"];
    let startingDate = dayjs(plan?.startingDate), currentDayJS = dayjs(startingDate?.add(currentDay, 'day'));

    const components = {
        "Planner":
        <>
            <Grid fluid>
                <Button variant="text" onClick={() => switchToPreviousDay()}>
                    <ChevronLeftIcon style={{ position: "fixed", top: "50%", left: 0 }} />
                </Button>
                <Button variant="text" onClick={() => switchToNextDay()}>
                    <ChevronRightIcon style={{ position: "fixed", top: "50%", left: "30%" }} />
                </Button>
            </Grid>

            <Grid fluid>
                <Button variant="text" onClick={() => handleBackButtonClick()}>
                    <ArrowBackIcon />
                </Button>

                <Row className={classes.title}>
                    <Typography>{currentDayJS.format('DD/MM/YYYY')}</Typography>
                </Row>

                <Row>
                    <Col xs={4} className={classes.title}>
                        <Typography>{toDayName(currentDayJS.day())}</Typography>
                    </Col>
                    <Col xs={4} className={classes.title}>
                        <Typography>21°</Typography>
                        <WbSunnyIcon />
                    </Col>
                    <Col xs={4} className={classes.title}>
                        <Typography>Cost: ${getCostSum()}</Typography>
                    </Col>
                </Row>

                <Row className={classes.subtitle}>
                    <Col xs={3} md={3}>
                        <Typography>Time</Typography>
                    </Col>
                    <Col xs={9} md={9}>
                        <Typography>Activity</Typography>
                    </Col>
                </Row>

                {activityList?.map((activity, i) => (
                    <Row key={`activity-${i}`}>
                        <Col xs={4} md={3}>
                            <CardContent>
                                <Typography variant="subtitle1">
                                    {singleDigitTransformer(stringToDateObj(activity?.startDateTime)?.hours)}:
                                    {singleDigitTransformer(stringToDateObj(activity?.startDateTime)?.minutes)} -
                                    {singleDigitTransformer(stringToDateObj(activity?.endDateTime)?.hours)}:
                                    {singleDigitTransformer(stringToDateObj(activity?.endDateTime)?.minutes)}
                                </Typography>
                            </CardContent>
                        </Col>

                        <Col xs={7} md={8}>
                            <Card
                                elevation={2}
                                className={classes.styledCard}
                                onClick={() => handleCardClick(activity.place)}
                                style={{ cursor: 'pointer' }}
                            >
                                <CardContent className={classes.cardContent}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography className={classes.index}>{i + 1}</Typography>
                                            <Typography gutterBottom variant="h6">
                                                {activity.name || '?'}
                                            </Typography>
                                        </Box>
                                        <Checkbox
                                            checked={activity.isVisited || false}
                                            onChange={() => toggleVisited(i)}
                                            color="primary"
                                            inputProps={{ 'aria-label': 'Mark activity as visited' }}
                                        />
                                    </Box>
                                    <Box gutterBottom display="flex">
                                        <LocationOnIcon style={{ marginBottom: "0.5rem" }} />
                                        <Typography style={{ marginLeft: "0.5rem" }} variant="subtitle2">
                                            {activity.place ? handlePlaceName(activity.place) : ""}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" flexDirection="column">
                                        <Typography
                                            className={classes.valueTypography}
                                            style={{ lineHeight: 1.5, fontStyle: 'italic', fontSize: '0.9rem' }}
                                        >
                                            {activity.description || 'No description available'}
                                        </Typography>
                                    </Box>

                                    {/* Additional Info */}
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
                                    )}
                                </CardContent>
                            </Card>

                            {/* Subactivities */}
                            {activity.subActivities?.map((subActivity, j) => (
                                <Card
                                    key={`subactivity-${i}-${j}`}
                                    elevation={1}
                                    className={`${classes.styledCard} ${classes.subActivityCard}`}
                                    onClick={() => handleCardClick(subActivity.place)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CardContent className={classes.subActivityCardContent}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography className={classes.index}>{`${i + 1}.${j + 1}`}</Typography>
                                                <Typography variant="subtitle1" className={classes.subActivityTitle}>
                                                    {subActivity.name || '?'}
                                                </Typography>
                                            </Box>
                                            <Checkbox
                                                checked={subActivity.isVisited || false}
                                                onChange={() => toggleVisited(j, true, i)}
                                                color="primary"
                                                inputProps={{ 'aria-label': 'Mark sub-activity as visited' }}
                                            />
                                        </Box>
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <Typography variant="caption" className={classes.subActivityTime}>
                                                {singleDigitTransformer(stringToDateObj(subActivity?.startDateTime)?.hours)}:
                                                {singleDigitTransformer(stringToDateObj(subActivity?.startDateTime)?.minutes)}-
                                                {singleDigitTransformer(stringToDateObj(subActivity?.endDateTime)?.hours)}:
                                                {singleDigitTransformer(stringToDateObj(subActivity?.endDateTime)?.minutes)}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <LocationOnIcon fontSize="small" color="action" />
                                            <Typography variant="subtitle2" className={classes.subActivityPlace}>
                                                {subActivity.place ? handlePlaceName(subActivity.place) : ""}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            className={classes.subActivityDescription}
                                            style={{ lineHeight: 1.5 }}
                                        >
                                            {subActivity.description || 'No description available'}
                                        </Typography>
                                        {showAdditionalInfo[`sub_${i}_${j}`] && (
                                            <Fade in={showAdditionalInfo[`sub_${i}_${j}`]} timeout={500}>
                                                <Box mt={2} p={1} bgcolor="grey.100" borderRadius={4}>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography className={classes.labelTypography}>Type:</Typography>
                                                        <Typography className={classes.valueTypography}>
                                                            {activityTypeName[Number(subActivity.type) / 10 - 1] || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography className={classes.labelTypography}>Cost:</Typography>
                                                        <Typography className={classes.valueTypography}>
                                                            {subActivity.cost ? `$${subActivity.cost.toFixed(2)}` : 'Free'}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" flexDirection="column">
                                                        <Typography className={classes.labelTypography}>Summary:</Typography>
                                                        <Typography
                                                            className={classes.valueTypography}
                                                            style={{ lineHeight: 1.5 }}
                                                        >
                                                            {subActivity.place?.editorialSummary || 'No summary available'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Fade>
                                        )}
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" onClick={(e) => handleMenuOpen(e, j, true, i)}>
                                            <MoreVertIcon />
                                        </Button>
                                    </CardActions>
                                </Card>
                            ))}
                        </Col>

                        {/* Menu for main activity */}
                        <Col xs={1} md={1}>
                            <CardActions display="flex" justifyContent="space-between">
                                <Button size="small" onClick={(e) => handleMenuOpen(e, i)}>
                                    <MoreVertIcon />
                                </Button>
                                <Menu
                                    anchorEl={menuAnchorEl}
                                    open={Boolean(menuAnchorEl) && menuActivityIndex?.index === i && !menuActivityIndex?.isSubActivity}
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
                                {activity.subActivities?.map((_, j) => (
                                    <Menu
                                        key={`subactivity-menu-${i}-${j}`}
                                        anchorEl={menuAnchorEl}
                                        open={Boolean(menuAnchorEl) && menuActivityIndex?.index === j && menuActivityIndex?.isSubActivity && menuActivityIndex?.parentIndex === i}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem onClick={() => handleMenuAction("toggleInfo")}>
                                            {showAdditionalInfo[`sub_${i}_${j}`] ? "Hide Info" : "More Info"}
                                        </MenuItem>
                                        <MenuItem onClick={() => handleMenuAction("edit")}>
                                            Edit
                                        </MenuItem>
                                        <MenuItem onClick={() => handleMenuAction("delete")}>
                                            Delete
                                        </MenuItem>
                                    </Menu>
                                ))}
                            </CardActions>
                        </Col>

                        {/* Directions Information */}
                        {directionInformation[i] && (
                            <Row className={classes.directionInfo}>
                                <Col xs={12}>
                                <Card elevation={1} className={classes.directionCard}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Typography variant="subtitle1">From {activityList[i]?.place.name} to {activityList[i+1]?.place.name}</Typography>
                                        </Box>
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Typography variant="body2">
                                                <strong>Mode:</strong> {directionInformation[i].transportMethod}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Distance:</strong> {directionInformation[i].distance}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Duration:</strong> {directionInformation[i].duration}
                                            </Typography>
                                            {directionInformation[i].transitLines && directionInformation[i].transitLines[0] !== 'N/A' && (
                                                <Typography variant="body2">
                                                    <strong>Transit Lines:</strong> {directionInformation[i].transitLines.join(', ')}
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                                </Col>
                            </Row>
                        )}
                    </Row>
                ))}

                <Row className={classes.plusButton}>
                    <Button variant="outlined" onClick={() => setDisplayingComponent("AddActivity")}>
                        <AddCircleIcon />
                    </Button>
                </Row>
            </Grid>
        </>,
        "AddActivity":
            <AddActivity setDisplayingComponent={setDisplayingComponent} />,
        "EditActivity":
            <EditActivityDialog
                open={editDialogOpen}
                setOpen={setEditDialogOpen}
                setDisplayingComponent={setDisplayingComponent}
                activity={selectedActivity}
            />,
        "SelectPlan":
            <SelectPlan setDisplayingComponent={setDisplayingComponent} />
    };

    if (selectedActivity) console.log('Edit dialog open:', editDialogOpen, 'Selected activity:', selectedActivity);

    return (
        <>
            {components[displayingComponent]}
        </>
    );
}

export default Planner;