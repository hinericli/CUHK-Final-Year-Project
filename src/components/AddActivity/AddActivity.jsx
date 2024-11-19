import { FormControl, Typography, InputLabel, Select, MenuItem, Input, InputAdornment, Button } from '@material-ui/core';
import React, { useContext } from 'react';
import TextField from '@material-ui/core/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import MapSearch from '../MapSearch/MapSearch';

import useStyle from "./style"


const AddActivity = ({setCoordinates, setDisplayingTable}) => {
    const classes = useStyle();

    const [type, setType] = React.useState('');
    const [startDateTime, setStartDateTime] = React.useState(null);
    const [endDateTime, setEndDateTime] = React.useState(null);
    

    return (
        <>
        <Typography variant="h6" className={classes.title}>Add Activity</Typography>
        <FormControl fullWidth className={classes.formControl}>
            <TextField required id="outlined-required" label="Name" variant="standard" />
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
                format='DD/MM/YY HH:mm'
                ampm={false}
                closeOnSelect={false}
                value={startDateTime}
                onChange={(newStartDateTime) => {setStartDateTime(newStartDateTime)}}
            />
        </FormControl>
        <FormControl fullWidth className={classes.formControl}>
            <DateTimePicker
                label="End Date Time"
                format='DD/MM/YY HH:mm'
                ampm={false}
                closeOnSelect={false}
                value={endDateTime}
                onChange={(newEndDateTime) => {setEndDateTime(newEndDateTime)}}
            />
        </FormControl>
        </LocalizationProvider>
        
        <FormControl fullWidth className={classes.formControl}>
            <MapSearch setCoordinates={setCoordinates}/>
        </FormControl>
        
        <FormControl fullWidth className={classes.formControl} variant="standard">
          <InputLabel htmlFor="input-cost">Cost</InputLabel>
          <Input
            id="input-cost"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
          />
        </FormControl>

        <FormControl fullWidth className={classes.formControl}>
            <TextField 
                placeholder="Description"
                multiline
                variant="outlined"
                />
        </FormControl>

        <Button className={classes.finishButton} variant="outlined" onClick={() => {setDisplayingTable('Planner')}}> Finish </Button>
        </>
    )


}

export default AddActivity;