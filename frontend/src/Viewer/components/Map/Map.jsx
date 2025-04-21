import React, { useRef, useContext, useEffect, useMemo, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery, Button, Tooltip } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import Rating from '@material-ui/lab/Rating';
import AddIcon from '@material-ui/icons/Add';

import useStyles from './styles';
import { MapPlacesContext } from '../../Viewer';

import { DisplayingTableContext } from '../../Viewer';
import { DisplayingComponentContext } from '../../Viewer';
import { LensOutlined } from '@material-ui/icons';
import AddActivity from '../AddActivity/AddActivity';

const Map = ({ setCoordinates, setBounds, coordinates, setChildClicked, directionColor }) => {
    const classes = useStyles();
    const isDesktop = useMediaQuery('(min-width:600px)');

    const {places, setPlaces} = useContext(MapPlacesContext);   // all places to have pins placed
    const {displayingTable, setDisplayingTable} = useContext(DisplayingTableContext);
    const {displayingComponent, setDisplayingComponent} = useContext(DisplayingComponentContext)

    // for directions and routes
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [mapCopy, setMapCopy] = useState(null)

    useMemo(() => {
        setDirectionsService(new window.google.maps.DirectionsService())
        setDirectionsRenderer(new window.google.maps.DirectionsRenderer({
            preserveViewport: true
        }))
    }, [])

    useEffect(() => {
        console.log("Current Screen: "+displayingTable)
        if (displayingTable === 'Planner') {
            directionsRenderer.setMap(null);
            drawPath(mapCopy)
        } else if (displayingTable === 'Discover') {
            setPlaces([])
            directionsRenderer.setMap(null);
        }
    }, [displayingTable])

    useEffect(() => {
        if (directionsRenderer) {
            directionsRenderer.setOptions({
                polylineOptions: {
                    strokeColor: directionColor, // Set the color of the direction line
                    strokeWeight: 5,
                },
            });
        }
    }, [directionColor, directionsRenderer]);

    // beginning, midpoints and end of the path
    let origin = { lat: 22.3134736, lng: 113.9137283 }, waypts = [], destination = { lat: 22.3474872, lng: 114.1023164 };
    useEffect(() => {
        if (displayingTable === "Planner") {
            if (places.length <= 1) {
                directionsRenderer.setMap(null);    // clear path on map
            }

            if (places.length >= 2) {
                origin = { lat: Number(places.slice(0, 1)[0].latitude), lng: Number(places.slice(0, 1)[0].longitude)}
                destination = { lat: Number(places.slice(-1)[0].latitude), lng: Number(places.slice(-1)[0].longitude)}
                directionsRenderer.setMap(null);
                drawPath(mapCopy)
            }

            if (places.length >= 3) {
                let tmp = places.slice(1, -1)

                for (let i = 0; i < tmp.length; i++) {
                    let lat = tmp[i].latitude, lng = tmp[i].longitude;
                    waypts.push({
                        location: new window.google.maps.LatLng(lat,lng)
                    })
                }
            }
        }
        if (places) console.log("Path Waypoints: ", {origin, destination, waypts});
    }, [places, directionColor]) 

    useEffect(() => {
        drawPath(mapCopy)
    }, [directionColor])

    const drawPath = (map) => {
        //const origin = { lat: 22.3134736, lng: 113.9137283 }
        //const destination = { lat: 22.3474872, lng: 114.1023164 }
        console.log("Path Drawn." + {map, origin, destination})

        //directionsRenderer.setMap(null);
        directionsService.route(
            {
            origin: origin,
            destination: destination,
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                console.log(result)
                directionsRenderer.setDirections(result);
                directionsRenderer.setOptions({
                    directions: result,
                    polylineOptions: {
                        strokeColor: directionColor, // Apply the selected color
                        strokeWeight: 5,
                    },
                });
                directionsRenderer.setMap(map);
            } else {
                console.error(`error fetching directions ${result}`);
            }
            }
        );
        
    }

    return (
        <div className={classes.mapContainer}>
            <GoogleMapReact
                key="map"
                bootstrapURLKeys={{key: process.env.REACT_API_GOOGLE_MAPS_API_KEY}}
                center={coordinates}
                defaultZoom={14}
                margin={[100, 50, 50, 50]}
                options={''}
                onChange={(event) => {
                    setCoordinates({lat: event.center.lat, lng: event.center.lng});
                    setBounds({ne: event.marginBounds.ne, sw: event.marginBounds.sw});
                }}
                onChildClick={(child) => {setChildClicked(child)}}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={displayingTable==="Planner"?({ map, maps }) => {
                    setMapCopy(map)
                }:''}
            >
                {places?.map((place, i) => {
                    if (typeof(place) === undefined || places == '') return;

                    if (displayingTable === "Planner") {
                        return (
                          <div
                            className={classes.markerContainer}
                            lat={Number(place.latitude)}
                            lng={Number(place.longitude)}
                            key={i}
                          >
                            <Tooltip title={place.description || place.name} arrow>
                            <Paper elevation={4} className={classes.paper}>
                              <div className={classes.markerContent}>
                                <Typography
                                  className={classes.index}
                                  variant="subtitle1"
                                  color="primary"
                                >
                                  {i + 1}
                                </Typography>
                                <Typography
                                  className={classes.placeName}
                                  variant="subtitle2"
                                  color="textPrimary"
                                >
                                  {place.name}
                                </Typography>
                              </div>
                            </Paper>
                            </Tooltip>
                          </div>
                        );
                    }
                    
                    if (displayingTable === "Discover") {
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
                                            src={place.photo ? place.photo.images.large.url : 'https://cdn-icons-png.flaticon.com/512/1147/1147856.png'}
                                            alt={place.name}
                                        />
                                        <Rating size="small" value={Number(place.rating)} readOnly/>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            size="small"
                                            sx={{ mt: 1 }} // Adds some margin-top for spacing
                                            onClick={() => {
                                                setDisplayingTable("Planner")
                                                setDisplayingComponent("AddActivity")
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </Paper>

                                )
                            }
                            </div>
                        )
                    }
                    
                })}

            </GoogleMapReact>
        </div>
    )
}



export default Map;