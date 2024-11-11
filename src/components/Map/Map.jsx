import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import Rating from '@material-ui/lab/Rating';

import useStyles from './styles';

const Map = ({setCoordinates, setBounds, coordinates, places}) => {
    const classes = useStyles();
    const isDesktop = useMediaQuery('(min-width:600px)');

    return (
        <div className={classes.mapContainer}>
            <GoogleMapReact
                bootstrapURLKeys={{key: "AIzaSyBcPLMrIoWkJeh7Lh_0n87tqpBhOKgErIo"}}
                defaultCenter={coordinates}
                center={coordinates}
                defaultZoom={14}
                margin={[50, 50, 50, 50]}
                options={''}
                onChange={(event) => {
                    setCoordinates({lat: event.center.lat, lng: event.center.lng});
                    setBounds({ne: event.marginBounds.ne, sw: event.marginBounds.sw});
                }}
                onChildClick={''}
            >
                {places?.map((place, i) => {
                    if (place.latitude === undefined || place.longitude === undefined) return;

                    console.log(Number(place.latitude), Number(place.longitude));

                    return (
                        <div 
                            className={classes.markerContainer}
                            lat={Number(place.latitude)}
                            lng={Number(place.longitude)}
                            key={i}
                        >   
                        {   
                            !isDesktop ? (
                                <LocationOnOutlinedIcon color='primary' fontSize="large" />
                            ) : (
                                <Paper elevation={3} className={classes.paper}>
                                    <Typography className={classes.typography} variant="subtitle2" gutterBottom>
                                        {place.name}
                                    </Typography>
                                    <img
                                        className={classes.pointer}
                                        src={place.photo?place.photo.images.large.url:'https://cdn-icons-png.flaticon.com/512/1147/1147856.png'}
                                        alt={place.name}
                                    />
                                    <Rating size="small" value={Number(place.rating)} readOnly/>
                                </Paper>

                            )

                        }
                        

                        </div>
                    )
                })} 

            </GoogleMapReact>
        </div>
    )
}



export default Map;