import React, { useContext, useEffect, useState } from 'react';
import { FormControl, Typography, InputLabel, Select, MenuItem, Input, InputAdornment, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import MapSearch from '../MapSearch/MapSearch';
import { CurrentDayContext, PlanContext } from '../Planner/Planner';
import { toBeAddedActivityContext } from '../../Viewer';

import useStyle from "./style";
import { dayJSObjtoString } from '../../../utils/DateUtils';
import { addActivityToPlan } from '../../../api';

const customParseFormat = require("dayjs/plugin/customParseFormat");
const toObject = require("dayjs/plugin/toObject");
dayjs.extend(customParseFormat);
dayjs.extend(toObject);

function changeStartDateTime(newStartDateTimeDayJS, setStartDateTimeDayJS, setStartDateTime) {
    setStartDateTimeDayJS(newStartDateTimeDayJS);
    setStartDateTime(newStartDateTimeDayJS.toObject());
}

function changeEndDateTime(newEndDateTimeDayJS, setEndDateTimeDayJS, setEndDateTime) {
    setEndDateTimeDayJS(newEndDateTimeDayJS);
    setEndDateTime(newEndDateTimeDayJS.toObject());
}

const AddActivity = ({ setDisplayingComponent }) => {
    const { plan, setPlan } = useContext(PlanContext);
    const { currentDay, setCurrentDay } = useContext(CurrentDayContext);
    const { toBeAddedActivity, setToBeAddedActivity } = useContext(toBeAddedActivityContext);

    const classes = useStyle();

    const [name, setName] = useState('');
    const [type, setType] = useState('');

    // For showing time on the screen
    const [startDateTimeDayJS, setStartDateTimeDayJS] = useState(dayjs(plan.dayList[currentDay].date, 'DD/MM/YYYY HH:mm'));
    const [endDateTimeDayJS, setEndDateTimeDayJS] = useState(dayjs(plan.dayList[currentDay].date, 'DD/MM/YYYY HH:mm'));
    // For representation of date in itinerary
    let todayDateTime = dayjs();
    const [startDateTime, setStartDateTime] = useState(dayjs(todayDateTime, 'DD/MM/YYYY HH:mm').toObject());
    const [endDateTime, setEndDateTime] = useState(dayjs(todayDateTime, 'DD/MM/YYYY HH:mm').toObject());
    //console.log(dayjs(todayDateTime, 'DD/MM/YYYY HH:mm').toObject())

    const [place, setPlace] = useState('');
    const [cost, setCost] = useState(0);
    const [description, setDescription] = useState('');

    // Error states for validation
    const [nameError, setNameError] = useState(false);
    const [typeError, setTypeError] = useState(false);
    const [startDateTimeError, setStartDateTimeError] = useState(false);
    const [endDateTimeError, setEndDateTimeError] = useState(false);
    const [placeError, setPlaceError] = useState(false);

    // Validation function
    const validateForm = () => {
        let isValid = true;

        // Validate name
        if (!name.trim()) {
            setNameError(true);
            isValid = false;
        } else {
            setNameError(false);
        }

        // Validate type
        if (!type) {
            setTypeError(true);
            isValid = false;
        } else {
            setTypeError(false);
        }

        // Validate startDateTime
        if (!startDateTimeDayJS.isValid()) {
            setStartDateTimeError(true);
            isValid = false;
        } else {
            setStartDateTimeError(false);
        }

        // Validate endDateTime and ensure it's after startDateTime
        if (!endDateTimeDayJS.isValid()) {
            setEndDateTimeError(true);
            isValid = false;
        } else if (endDateTimeDayJS.isBefore(startDateTimeDayJS) || endDateTimeDayJS.isSame(startDateTimeDayJS)) {
            setEndDateTimeError(true);
            isValid = false;
        } else {
            setEndDateTimeError(false);
        }

        // Validate place
        if (!place || !place.place || !place.place.name) {
            setPlaceError(true);
            isValid = false;
        } else {
            setPlaceError(false);
        }

        return isValid;
    };

    return (
        <>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setDisplayingComponent('Planner')}>
                Back
            </Button>
            <Typography variant="h6" className={classes.title}>Add Activity</Typography>

            <FormControl fullWidth className={classes.formControl}>
                <TextField
                    required
                    id="outlined-required"
                    label="Name"
                    variant="standard"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        if (event.target.value.trim()) setNameError(false); // Clear error on valid input
                    }}
                    error={nameError}
                    helperText={nameError ? "Name is required" : ""}
                />
            </FormControl>

            <FormControl fullWidth className={classes.formControl}>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                    labelId="type-label"
                    id="type"
                    value={type}
                    label="Type"
                    onChange={(event) => {
                        setType(event.target.value);
                        if (event.target.value) setTypeError(false); // Clear error on valid selection
                    }}
                    error={typeError}
                >
                    <MenuItem value={10}>Restaurant</MenuItem>
                    <MenuItem value={20}>Hotel</MenuItem>
                    <MenuItem value={30}>Attraction</MenuItem>
                    <MenuItem value={40}>Flight</MenuItem>
                    <MenuItem value={50}>Others</MenuItem>
                </Select>
                {typeError && (
                    <Typography color="error" variant="caption">
                        Please select a type
                    </Typography>
                )}
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FormControl fullWidth className={classes.formControl}>
                    <DateTimePicker
                        label="Start Date Time"
                        format="DD/MM/YYYY HH:mm"
                        ampm={false}
                        closeOnSelect={false}
                        value={startDateTimeDayJS}
                        onChange={(newValue) => {
                            changeStartDateTime(newValue, setStartDateTimeDayJS, setStartDateTime);
                            if (newValue && newValue.isValid() && (!endDateTimeDayJS.isValid() || newValue.isBefore(endDateTimeDayJS))) {
                                setStartDateTimeError(false);
                                setEndDateTimeError(false);
                            }
                        }}
                        onError={''}
                        slotProps={{
                            textField: {
                                onBlur: (event) => {
                                    //console.log(event.target.value)
                                    let dayObj = dayjs(event.target.value, 'DD/MM/YYYY HH:mm');
                                    changeStartDateTime(dayObj, setStartDateTimeDayJS, setStartDateTime);
                                    if (dayObj.isValid() && (!endDateTimeDayJS.isValid() || dayObj.isBefore(endDateTimeDayJS))) {
                                        setStartDateTimeError(false);
                                        setEndDateTimeError(false);
                                    } else {
                                        setStartDateTimeError(true);
                                    }
                                },
                                error: startDateTimeError,
                                helperText: startDateTimeError ? "Invalid start date/time" : ""
                            }
                        }}
                    />
                </FormControl>
                <FormControl fullWidth className={classes.formControl}>
                    <DateTimePicker
                        label="End Date Time"
                        format="DD/MM/YYYY HH:mm"
                        ampm={false}
                        closeOnSelect={false}
                        value={endDateTimeDayJS}
                        onChange={(newValue) => {
                            changeEndDateTime(newValue, setEndDateTimeDayJS, setEndDateTime);
                            if (newValue && newValue.isValid() && newValue.isAfter(startDateTimeDayJS)) {
                                setEndDateTimeError(false);
                                setStartDateTimeError(false);
                            }
                        }}
                        onError={''}
                        slotProps={{
                            textField: {
                                onBlur: (event) => {
                                    console.log(event.target.value);
                                    let dayObj = dayjs(event.target.value, 'DD/MM/YYYY HH:mm');
                                    changeEndDateTime(dayObj, setEndDateTimeDayJS, setEndDateTime);
                                    if (dayObj.isValid() && dayObj.isAfter(startDateTimeDayJS)) {
                                        setEndDateTimeError(false);
                                    } else {
                                        setEndDateTimeError(true);
                                    }
                                },
                                error: endDateTimeError,
                                helperText: endDateTimeError ? "End must be after start and valid" : ""
                            }
                        }}
                    />
                </FormControl>
            </LocalizationProvider>

            <FormControl fullWidth className={classes.formControl}>
                <MapSearch setActivityPlace={setPlace} />
                {placeError && (
                    <Typography color="error" variant="caption">
                        Please select a place
                    </Typography>
                )}
            </FormControl>

            <FormControl fullWidth className={classes.formControl} variant="standard">
                <InputLabel htmlFor="input-cost">Cost</InputLabel>
                <Input
                    id="input-cost"
                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                    onChange={(event) => setCost(event.target.value)}
                />
            </FormControl>

            <FormControl fullWidth className={classes.formControl}>
                <TextField
                    placeholder="Description"
                    multiline
                    variant="outlined"
                    onChange={(event) => setDescription(event.target.value)}
                />
            </FormControl>

            <Button
                className={classes.finishButton}
                variant="outlined"
                onClick={async () => {
                    if (!validateForm()) {
                        return; // Stop submission if validation fails
                    }

                    console.log(startDateTime);
                    const newActivity = {
                        name: name,
                        type: type,
                        startDateTime: dayJSObjtoString(startDateTime),
                        endDateTime: dayJSObjtoString(endDateTime),
                        place: {
                            name: place.place.name,
                            latitude: Number(place.place.geometry.location.lat()),
                            longitude: Number(place.place.geometry.location.lng()),
                            description: place.place.description
                        },
                        cost: cost,
                        description: description
                    };
                    const updatedPlan = await addActivityToPlan(plan.planId, currentDay, newActivity);
                    console.log('Activity added:', updatedPlan);
                    setToBeAddedActivity(newActivity);
                    setDisplayingComponent('Planner');
                }}
            >
                <Typography>Finish</Typography>
            </Button>
        </>
    );
};

export default AddActivity;