import React, { useState, useEffect, createRef } from 'react';
import { CircularProgress, Grid, Typography, InputLabel, MenuItem, FormControl, Select} from '@material-ui/core';

import PlaceDetails from '../PlaceDetails/PlaceDetails'
import MapSearch from '../MapSearch/MapSearch'

import useStyles from './styles';

const DiscoverList = ({places, childClicked, isLoading, type, setType, rating, setRating}) => {
    const classes = useStyles();

    // --- Refs
    const [elRefs, setElRefs] = useState([]);   //element refs for scrolling to the correct PlaceDetails item after clicking on the map pin

    useEffect(() => {
        setElRefs(Array(places?.length).fill().map((_, i) => elRefs[i] || createRef()));  //construct array to fill and map all the refs
    }, [places]);

    // --- Returns
    return (
        <div className={classes.container}>
            <Typography variant="h5">Search for Places</Typography>
            {
                isLoading ? (
                    <div className={classes.loading}>
                        <CircularProgress size="5rem"/>
                    </div>
                ) : (
                    <>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Type</InputLabel>
                        <Select value={type} onChange={(e) => setType(e.target.value)}>
                            <MenuItem value="restaurants">Restaurants</MenuItem>
                            <MenuItem value="hotels">Hotels</MenuItem>
                            <MenuItem value="attractions">Attractions</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl className={classes.formControl}>
                        <InputLabel>Rating</InputLabel>
                        <Select value={rating} onChange={(e) => setRating(e.target.value)}>
                            <MenuItem value={0}>All</MenuItem>
                            <MenuItem value={3}>Above 3.0</MenuItem>
                            <MenuItem value={4}>Above 4.0</MenuItem>
                            <MenuItem value={4.5}>Above 4.5</MenuItem>
                        </Select>
                    </FormControl>

                    <MapSearch />

                    <Grid container spacing={3} className={classes.list}>
                        {places?.map((place, i) => {
                            if (place === undefined) return;
                            //console.log(place);
                            return (
                            <Grid ref={elRefs[i]} item key={i} xs={12}> 
                                <PlaceDetails place={place} selected={Number(childClicked) === i} refProp={elRefs[i]}/>
                            </Grid>)
                        }
                            
                        )}


                    </Grid>
                    </>
                )
            }
        </div>
    )
}

export default DiscoverList;