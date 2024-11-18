import { FormControl, Typography, InputLabel, Select, MenuItem } from '@material-ui/core';
import React from 'react';
import TextField from '@material-ui/core/TextField';

import useStyle from "./style"

const AddActivity = () => {
    const [type, setType] = React.useState('');

    const classes = useStyle();

    return (
        <>
        <Typography variant="h6" className={classes.title}>AddActivity</Typography>
        <FormControl className={classes.formControl}>
            <TextField required id="outlined-required" label="Name" variant="standard" />
        </FormControl>
            
        <FormControl fullwidth className={classes.formControl}>
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
        

        </>
    )


}

export default AddActivity;