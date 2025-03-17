import React, { useContext, useEffect } from 'react';
import { FormControl, Typography, InputLabel, Select, MenuItem, Input, InputAdornment, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import MapSearch from '../MapSearch/MapSearch';
import { CurrentDayContext, PlanContext } from '../Planner/Planner';

import useStyle from "./style"
import { dayJSObjtoString } from '../../../utils/DateUtils';
import { addActivityToPlan } from '../../../api';

const customParseFormat = require("dayjs/plugin/customParseFormat");
const toObject = require("dayjs/plugin/toObject");
dayjs.extend(customParseFormat);
dayjs.extend(toObject)


function changeStartDateTime(newStartDateTimeDayJS, setStartDateTimeDayJS, setStartDateTime) {
    setStartDateTimeDayJS(newStartDateTimeDayJS)
    setStartDateTime(newStartDateTimeDayJS.toObject())
}

function changeEndDateTime(newEndDateTimeDayJS, setEndDateTimeDayJS, setEndDateTime) {
    setEndDateTimeDayJS(newEndDateTimeDayJS) 
    setEndDateTime(newEndDateTimeDayJS.toObject())
}

const AddActivity = ({
    setDisplayingComponent, 
}) => {
    const { plan, setPlan } = useContext(PlanContext);
    const { currentDay, setCurrentDay } = useContext(CurrentDayContext);

    const classes = useStyle();

    const [name, setName] = React.useState('');
    const [type, setType] = React.useState('');

    // For showing time on the screen
    const [startDateTimeDayJS, setStartDateTimeDayJS] = React.useState(dayjs(), 'DD/MM/YYYY HH:mm');
    const [endDateTimeDayJS, setEndDateTimeDayJS] = React.useState(dayjs(), 'DD/MM/YYYY HH:mm');
    // For representation of date in itinerary
    let todayDateTime = dayjs()
    const [startDateTime, setStartDateTime] = React.useState(dayjs(todayDateTime, 'DD/MM/YYYY HH:mm').toObject());
    const [endDateTime, setEndDateTime] = React.useState(dayjs(todayDateTime, 'DD/MM/YYYY HH:mm').toObject());
    //console.log(dayjs(todayDateTime, 'DD/MM/YYYY HH:mm').toObject())

    const [place, setPlace] = React.useState('');
    const [cost, setCost] = React.useState(0);
    const [description, setDescription] = React.useState('');

    return (
        <>
        <Typography variant="h6" className={classes.title}>Add Activity</Typography>

        <FormControl fullWidth className={classes.formControl}>
            <TextField 
                required 
                id="outlined-required" 
                label="Name" 
                variant="standard" 
                value={name}
                onChange={(event) => {setName(event.target.value)}
                }
                />
        </FormControl>
            
        <FormControl fullWidth className={classes.formControl}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
                labelId="type-label"
                id="type"
                value={type}
                label="Type"
                onChange={(event) => setType(event.target.value)
                }
            >
                <MenuItem value={10}>Restaurant</MenuItem>
                <MenuItem value={20}>Hotel</MenuItem>
                <MenuItem value={30}>Attraction</MenuItem>
                <MenuItem value={40}>Flight</MenuItem>
                <MenuItem value={50}>Others</MenuItem>
            </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormControl fullWidth className={classes.formControl}>
            <DateTimePicker
                label="Start Date Time"
                format='DD/MM/YYYY HH:mm'
                ampm={false}
                closeOnSelect={false}
                value={startDateTimeDayJS}
                onError={''}
                slotProps={{
                    textField: {
                        onBlur: (event) => {
                            //console.log(event.target.value)
                            let dayObj = dayjs(event.target.value, 'DD/MM/YYYY HH:mm')
                            changeStartDateTime(dayObj, setStartDateTimeDayJS, setStartDateTime)
                        }
                    }
                }}
            />
        </FormControl>
        <FormControl fullWidth className={classes.formControl}>
            <DateTimePicker
                label="End Date Time"
                format='DD/MM/YYYY HH:mm'
                ampm={false}
                closeOnSelect={false}
                value={endDateTimeDayJS}
                onError={''}
                slotProps={{
                    textField: {
                        onBlur: (event) => {
                            console.log(event.target.value)
                            let dayObj = dayjs(event.target.value, 'DD/MM/YYYY HH:mm')
                            changeEndDateTime(dayObj, setEndDateTimeDayJS, setEndDateTime)
                        }
                    }
                }}
            />
        </FormControl>
        </LocalizationProvider>
        
        <FormControl fullWidth className={classes.formControl}>
            <MapSearch setActivityPlace={setPlace}/>
        </FormControl>
        
        <FormControl fullWidth className={classes.formControl} variant="standard">
          <InputLabel htmlFor="input-cost">Cost</InputLabel>
          <Input
            id="input-cost"
            startAdornment={<InputAdornment position="start">$</InputAdornment>
            }
            onChange={(event) => {setCost(event.target.value)}}
          />
        </FormControl>

        <FormControl fullWidth className={classes.formControl}>
            <TextField 
                placeholder="Description"
                multiline
                variant="outlined"
                onChange={(event) => {setDescription(event.target.value)}}
                />
        </FormControl>

        <Button 
            className={classes.finishButton} 
            variant="outlined" 
            onClick={async () => {
                const updatedPlan = await addActivityToPlan(plan.planId, currentDay, 
                    {
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
                    });
                // Update local state or trigger refresh
                console.log('Activity added:', updatedPlan);
                setDisplayingComponent('Planner')
            }}> <Typography>Finish</Typography>
        </Button>
        </>
    )
}

export default AddActivity;