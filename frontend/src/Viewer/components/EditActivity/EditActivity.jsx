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
import { CurrentDayContext, PlanContext } from '../Planner/Planner';
import { toBeAddedActivityContext } from '../../Viewer';

import useStyle from './style';
import { dayJSObjtoString } from '../../../utils/DateUtils';
import { updateActivityInPlan } from '../../../api';

const customParseFormat = require('dayjs/plugin/customParseFormat');
const toObject = require('dayjs/plugin/toObject');
dayjs.extend(customParseFormat);
dayjs.extend(toObject);
dayjs.extend(utc)

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

const EditActivity = ({ setDisplayingComponent, activity, onSave, setUpdatedActivity }) => {
    const { plan, setPlan } = useContext(PlanContext);
    const { currentDay, setCurrentDay } = useContext(CurrentDayContext);
    const { toBeAddedActivity, setToBeAddedActivity } = useContext(toBeAddedActivityContext);

    const classes = useStyle();

    const [name, setName] = useState(activity?.name || '');
    const [type, setType] = useState(activity?.type || '');
    const [startDateTimeDayJS, setStartDateTimeDayJS] = useState(null);
    const [endDateTimeDayJS, setEndDateTimeDayJS] = useState(null);
    const [startDateTime, setStartDateTime] = useState(activity?.startDateTime ? dayjs(activity.startDateTime).toObject() : {});
    const [endDateTime, setEndDateTime] = useState(activity?.endDateTime ? dayjs(activity.endDateTime).toObject() : {});
    const [place, setPlace] = useState(activity?.place || '');
    const [cost, setCost] = useState(activity?.cost || 0);
    const [description, setDescription] = useState(activity?.description || '');

    // Error states for validation
    const [nameError, setNameError] = useState(false);
    const [typeError, setTypeError] = useState(false);
    const [startDateTimeError, setStartDateTimeError] = useState(false);
    const [endDateTimeError, setEndDateTimeError] = useState(false);
    const [placeError, setPlaceError] = useState(false);

    useEffect(() => {
        console.log('Activity:', activity);
        if (activity) {
            // Parse startDateTime as UTC
            const parsedStartDate = activity.startDateTime ? dayjs.utc(activity.startDateTime) : null;
            if (parsedStartDate && parsedStartDate.isValid()) {
                setStartDateTimeDayJS(parsedStartDate);
                setStartDateTime(parsedStartDate.toObject());
            } else {
                setStartDateTimeDayJS(null);
                setStartDateTime({});
                console.warn('Invalid startDateTime:', activity.startDateTime);
            }
    
            // Parse endDateTime as UTC
            const parsedEndDate = activity.endDateTime ? dayjs.utc(activity.endDateTime) : null;
            if (parsedEndDate && parsedEndDate.isValid()) {
                setEndDateTimeDayJS(parsedEndDate);
                setEndDateTime(parsedEndDate.toObject());
            } else {
                setEndDateTimeDayJS(null);
                setEndDateTime({});
                console.warn('Invalid endDateTime:', activity.endDateTime);
            }
        }
    }, [activity]);

    // Log state changes for debugging
    useEffect(() => {
        console.log('startDateTimeDayJS:', startDateTimeDayJS?.format('DD/MM/YYYY HH:mm'));
        console.log('endDateTimeDayJS:', endDateTimeDayJS?.format('DD/MM/YYYY HH:mm'));
    }, [startDateTimeDayJS, endDateTimeDayJS]);

    // Validation function
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
            <Typography variant="h6" className={classes.title}>Edit Activity</Typography>

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
                <FormControl fullWidth className={classes.formControl}>
                    <DateTimePicker
                        label="End Date Time"
                        format="DD/MM/YYYY HH:mm"
                        ampm={false}
                        closeOnSelect={false}
                        value={endDateTimeDayJS}
                        onChange={(newValue) => {
                            changeEndDateTime(newValue, setEndDateTimeDayJS, setEndDateTime);
                            const dayObj = dayjs(newValue, 'DD/MM/YYYY HH:mm');
                                changeEndDateTime(dayObj, setEndDateTimeDayJS, setEndDateTime);
                                if (dayObj.isValid() && dayObj.isAfter(startDateTimeDayJS)) {
                                    setEndDateTimeError(false);
                                } else {
                                    setEndDateTimeError(true);
                                }
                        }}
                        error={endDateTimeError}
                        helperText={endDateTimeError ? 'End must be after start and valid' : ''}
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
                    value={cost}
                    onChange={(event) => setCost(event.target.value)}
                />
            </FormControl>

            <FormControl fullWidth className={classes.formControl}>
                <TextField
                    placeholder="Description"
                    multiline
                    variant="outlined"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </FormControl>

            <Button
                className={classes.finishButton}
                variant="outlined"
                onClick={async () => {
                    if (!validateForm()) {
                        return;
                    }

                    const updatedActivity = {
                        _id: activity._id,
                        name: name,
                        type: type,
                        startDateTime: dayJSObjtoString(startDateTime),
                        endDateTime: dayJSObjtoString(endDateTime),
                        place: {
                            name: place.place.name,
                            latitude: Number(place.place.geometry.location.lat()),
                            longitude: Number(place.place.geometry.location.lng()),
                            description: place.place.description,
                        },
                        cost: Number(cost),
                        description: description,
                        isVisited: activity.isVisited,
                    };

                    try {
                        const updatedPlan = await updateActivityInPlan(plan.planId, currentDay, activity._id, updatedActivity);
                        console.log('Activity updated:', updatedPlan);
                        setUpdatedActivity(updatedActivity);

                        if (onSave) {
                            onSave();
                        }
                    } catch (error) {
                        console.error('Error updating activity:', error);
                    }
                }}
            >
                <Typography>Save Changes</Typography>
            </Button>
        </>
    );
};

export default EditActivity;