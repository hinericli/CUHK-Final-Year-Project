import React, { useContext, useState } from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import { Autocomplete } from '@react-google-maps/api';
import SearchIcon from '@material-ui/icons/Search';

import useStyles from './styles';

import { CoordinatesContext } from '../../Viewer';

const MapSearch = ({setActivityPlace}) => {
    const classes = useStyles();

    const {coordinates, setCoordinates} = useContext(CoordinatesContext);

    // --- Autocomplete
    const [autocomplete, setAutocomplete] = useState(null);

    const onLoad = (autoC) => setAutocomplete(autoC);
    const onPlaceChanged = () => {
        const place = autocomplete.getPlace()
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setCoordinates({lat, lng});
        console.log(coordinates)
        typeof(setActivityPlace) === 'function' ? setActivityPlace({place}) : console.error("No Set Activity Place Found");
    }

    return (
        <>
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <TextField fullWidth
                id="input-Place"
                ref={autocomplete}
                label="Place"
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
                onChange={(event) => {
                    typeof(setActivityPlace) === 'function' ? setActivityPlace(event.target.value) : console.error("No Set Activity Place Found");
                }}
            />


            </Autocomplete>
        </>
    )


}

export default MapSearch;

