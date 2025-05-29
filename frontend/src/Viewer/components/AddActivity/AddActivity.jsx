import React, { useContext, useEffect, useState } from 'react';
import { FormControl, Typography, InputLabel, Select, MenuItem, Input, InputAdornment, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import MapSearch from '../MapSearch/MapSearch';
import { CurrentDayContext } from '../Planner/Planner';
import { AppContext } from '../../Viewer';

import useStyle from './style';
import { dayJSObjtoString } from '../../../utils/DateUtils';
import { addActivityToPlan } from '../../../api';

const customParseFormat = require('dayjs/plugin/customParseFormat');
const toObject = require('dayjs/plugin/toObject');
dayjs.extend(customParseFormat);
dayjs.extend(toObject);
dayjs.extend(utc);

function changeStartDateTime(newStartDateTimeDayJS, setStartDateTimeDayJS, setStartDateTime) {
    if (newStartDateTimeDayJS && newStartDateTimeDayJS.isValid()) {
        setStartDateTimeDayJS(newStartDateTimeDayJS);
        setStartDateTime(newStartDateTimeDayJS.toObject());
    }
}

function changeEndDateTime(newEndDateTimeDayJS, setEndDateTimeDayJS, setEndDateTime) {
    if (newEndDateTimeDayJS && newEndDateTimeDayJS.isValid()) {
        setEndDateTimeDayJS(newEndDateTimeDayJS);
        setEndDateTime(newEndDateTimeDayJS.toObject());
    }
}

const AddActivity = ({ setDisplayingComponent }) => {
    const { plan, setToBeAddedActivity, currentDay } = useContext(AppContext);
    const classes = useStyle();

    const [name, setName] = useState('');
    const [type, setType] = useState('');

    // For showing the date/time picker
    const [startDateTimeDayJS, setStartDateTimeDayJS] = useState(null);
    const [endDateTimeDayJS, setEndDateTimeDayJS] = useState(null);
    // For storing the date/time values in object/JSON format
    const [startDateTime, setStartDateTime] = useState({});
    const [endDateTime, setEndDateTime] = useState({});

    const [place, setPlace] = useState('');
    const [cost, setCost] = useState(0);
    const [description, setDescription] = useState('');

    // Error states for validation
    const [nameError, setNameError] = useState(false);
    const [typeError, setTypeError] = useState(false);
    const [startDateTimeError, setStartDateTimeError] = useState(false);
    const [endDateTimeError, setEndDateTimeError] = useState(false);
    const [placeError, setPlaceError] = useState(false);

    useEffect(() => {
        // Initialization of the add activity component: showing the date correctly
        const dayDate = plan.dayList[currentDay].date;
        console.log('dayDate:', dayDate);
        const parsedDate = dayDate ? dayjs.utc(dayDate) : null;
        console.log('Parsed date:', parsedDate.format('DD/MM/YYYY HH:mm'));

        if (parsedDate.isValid()) {
            // Set default start time and end time
            const startDateTime = parsedDate.set('hour', 9).set('minute', 0);
            const endDateTime = parsedDate.set('hour', 10).set('minute', 0);
            setStartDateTimeDayJS(startDateTime);
            setEndDateTimeDayJS(endDateTime);
        } else {
            console.warn('Invalid day date:', dayDate);
            // Fallback to current date with default times
            const fallbackDate = dayjs.utc().startOf('day');
            setStartDateTimeDayJS(fallbackDate.set('hour', 9).set('minute', 0));
            setEndDateTimeDayJS(fallbackDate.set('hour', 10).set('minute', 0));
        }
    }, []);

    useEffect(() => {
        console.log('startDateTimeDayJS:', startDateTimeDayJS?.format('DD/MM/YYYY HH:mm'));
        console.log('endDateTimeDayJS:', endDateTimeDayJS?.format('DD/MM/YYYY HH:mm'));
    }, [startDateTimeDayJS, endDateTimeDayJS]);

    // Validate the form attributes like name, type, startDateTime and so on
    const validateForm = () => {
        let isValid = true;

        if (!name.trim()) {
            setNameError(true);
            isValid = false;
        } else {
            setNameError(false);
        }

        if (!type) {
            setTypeError(true);
            isValid = false;
        } else {
            setTypeError(false);
        }

        if (!startDateTimeDayJS || !startDateTimeDayJS.isValid()) {
            setStartDateTimeError(true);
            isValid = false;
        } else {
            setStartDateTimeError(false);
        }

        if (!endDateTimeDayJS || !endDateTimeDayJS.isValid() || endDateTimeDayJS.isBefore(startDateTimeDayJS) || endDateTimeDayJS.isSame(startDateTimeDayJS)) {
            setEndDateTimeError(true);
            isValid = false;
        } else {
            setEndDateTimeError(false);
        }

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

            {/* Name */}
            <FormControl fullWidth className={classes.formControl}>
                <TextField
                    required
                    id="outlined-required"
                    label="Name"
                    variant="standard"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        if (event.target.value.trim()) setNameError(false);
                    }}
                    error={nameError}
                    helperText={nameError ? 'Name is required' : ''}
                />
            </FormControl>

            {/* Type */}
            <FormControl fullWidth className={classes.formControl}>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                    labelId="type-label"
                    id="type"
                    value={type}
                    label="Type"
                    onChange={(event) => {
                        setType(event.target.value);
                        if (event.target.value) setTypeError(false);
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

            {/* Start Date Time & End Date Time */}
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
                            if (newValue && newValue.isValid() && (!endDateTimeDayJS || newValue.isBefore(endDateTimeDayJS))) {
                                setStartDateTimeError(false);
                                setEndDateTimeError(false);
                            }
                        }}
                        slotProps={{
                            textField: {
                                onBlur: (event) => {
                                    const dayObj = dayjs(event.target.value, 'DD/MM/YYYY HH:mm');
                                    changeStartDateTime(dayObj, setStartDateTimeDayJS, setStartDateTime);
                                    if (dayObj.isValid() && (!endDateTimeDayJS || dayObj.isBefore(endDateTimeDayJS))) {
                                        setStartDateTimeError(false);
                                        setEndDateTimeError(false);
                                    } else {
                                        setStartDateTimeError(true);
                                    }
                                },
                                error: startDateTimeError,
                                helperText: startDateTimeError ? 'Invalid start date/time' : '',
                            },
                        }}
                    />
                </FormControl>
                <FormControl fullWidth className={classes.formWeight}>
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
                        slotProps={{
                            textField: {
                                onBlur: (event) => {
                                    const dayObj = dayjs(event.target.value, 'DD/MM/YYYY HH:mm');
                                    changeEndDateTime(dayObj, setEndDateTimeDayJS, setEndDateTime);
                                    if (dayObj.isValid() && dayObj.isAfter(startDateTimeDayJS)) {
                                        setEndDateTimeError(false);
                                    } else {
                                        setEndDateTimeError(true);
                                    }
                                },
                                error: endDateTimeError,
                                helperText: endDateTimeError ? 'End must be after start and valid' : '',
                            },
                        }}
                    />
                </FormControl>
            </LocalizationProvider>

            {/* Place */}
            <FormControl fullWidth className={classes.formControl}>
                <MapSearch setActivityPlace={setPlace} />
                {placeError && (
                    <Typography color="error" variant="caption">
                        Please select a place
                    </Typography>
                )}
            </FormControl>

            {/* Cost */}
            <FormControl fullWidth className={classes.formControl} variant="standard">
                <InputLabel htmlFor="input-cost">Cost</InputLabel>
                <Input
                    id="input-cost"
                    startAdornment={<InputAdornment position="start">$</InputAdornment>}
                    value={cost}
                    onChange={(event) => setCost(event.target.value)}
                />
            </FormControl>

            {/* Description */}
            <FormControl fullWidth className={classes.formControl}>
                <TextField
                    placeholder="Description"
                    multiline
                    variant="outlined"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </FormControl>

            {/* Submit */}
            <Button
                className={classes.finishButton}
                variant="outlined"
                onClick={async () => {
                    if (!validateForm()) {
                        return;
                    }

                    const startDateTime = startDateTimeDayJS.toObject() 
                    const endDateTime = endDateTimeDayJS.toObject() 
                    console.log('Start DateTime DayJS:', startDateTime);
                    console.log('End DateTime DayJS:', endDateTime);
                    
                    const newActivity = {
                        name,
                        type,
                        startDateTime: dayJSObjtoString(startDateTime),
                        endDateTime: dayJSObjtoString(endDateTime),
                        place: {
                            name: place.place.name,
                            latitude: Number(place.place.geometry.location.lat()),
                            longitude: Number(place.place.geometry.location.lng()),
                            description: place.place.description,
                        },
                        cost: Number(cost),
                        description,
                    };
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