import React, { useState } from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import { Autocomplete } from '@react-google-maps/api';
import SearchIcon from '@material-ui/icons/Search';

import useStyles from './styles';

const MapSearch = ({setCoordinates}) => {
    const classes = useStyles();

    // --- Autocomplete
    const [autocomplete, setAutocomplete] = useState(null);

    const onLoad = (autoC) => setAutocomplete(autoC);
    const onPlaceChanged = () => {
        const lat = autocomplete.getPlace().geometry.location.lat();
        const lng = autocomplete.getPlace().geometry.location.lng();

        setCoordinates({lat, lng});
    }

    return (
        <>
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <TextField fullWidth
                id="input-location"
                ref={autocomplete}
                label="Location"
                slotProps={{
                input: {
                    startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                    ),
                },
                }}
                variant="standard"
            />

                {/*
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <SearchIcon />
                    </div>
                    <InputBase placeholder="Location" classes={{ root: classes.inputRoot, input: classes.inputInput}}/>
                </div>*/}
            </Autocomplete>
        </>
    )


}

export default MapSearch

