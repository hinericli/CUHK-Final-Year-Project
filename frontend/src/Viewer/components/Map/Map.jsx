import React, { useContext, useEffect, useMemo, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery, Button, Tooltip } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import Rating from '@material-ui/lab/Rating';
import AddIcon from '@material-ui/icons/Add';

import useStyles from './styles';
import { MapPlacesContext } from '../../Viewer';
import { DisplayingTableContext } from '../../Viewer';
import { DisplayingComponentContext } from '../../Viewer';

const Map = ({ setCoordinates, setBounds, coordinates, setChildClicked, directionColor }) => {
    const classes = useStyles();
    const isDesktop = useMediaQuery('(min-width:600px)');

    const { places, setPlaces } = useContext(MapPlacesContext);
    const { displayingTable, setDisplayingTable } = useContext(DisplayingTableContext);
    const { displayingComponent, setDisplayingComponent } = useContext(DisplayingComponentContext);

    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [mapCopy, setMapCopy] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(14);

    useMemo(() => {
        setDirectionsService(new window.google.maps.DirectionsService());
        setDirectionsRenderer(new window.google.maps.DirectionsRenderer({
            preserveViewport: true
        }));
    }, []);

    useEffect(() => {
        console.log("Current Screen: " + displayingTable);
        if (displayingTable === 'Planner') {
            directionsRenderer.setMap(null);
            drawPath(mapCopy);
        } else if (displayingTable === 'Discover') {
            setPlaces([]);
            directionsRenderer.setMap(null);
        }
    }, [displayingTable]);

    useEffect(() => {
        if (directionsRenderer) {
            directionsRenderer.setOptions({
                polylineOptions: {
                    strokeColor: directionColor,
                    strokeWeight: 5,
                },
            });
        }
    }, [directionColor, directionsRenderer]);

    let origin = { lat: 22.3134736, lng: 113.9137283 }, waypts = [], destination = { lat: 22.3474872, lng: 114.1023164 };
    useEffect(() => {
        if (displayingTable === "Planner") {
            if (places.length <= 1) {
                directionsRenderer.setMap(null);
            }

            if (places.length >= 2) {
                const firstPlace = Array.isArray(places[0]) ? places[0][0] : places[0];
                const lastPlace = Array.isArray(places[places.length - 1]) 
                    ? places[places.length - 1][0] 
                    : places[places.length - 1];
                
                origin = { lat: Number(firstPlace.latitude), lng: Number(firstPlace.longitude) };
                destination = { lat: Number(lastPlace.latitude), lng: Number(lastPlace.longitude) };
                directionsRenderer.setMap(null);
                drawPath(mapCopy);
            }

            if (places.length >= 3) {
                let tmp = places.slice(1, -1);
                waypts = [];
                
                tmp.forEach(item => {
                    const place = Array.isArray(item) ? item[0] : item;
                    waypts.push({
                        location: new window.google.maps.LatLng(place.latitude, place.longitude)
                    });
                });
            }
        }
        if (places) console.log("Path Waypoints: ", { origin, destination, waypts });
    }, [places, directionColor]);

    useEffect(() => {
        drawPath(mapCopy);
    }, [directionColor]);

    const drawPath = (map) => {
        console.log("Path Drawn.", { map, origin, destination });
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
                    console.log(result);
                    directionsRenderer.setDirections(result);
                    directionsRenderer.setOptions({
                        directions: result,
                        polylineOptions: {
                            strokeColor: directionColor,
                            strokeWeight: 5,
                        },
                    });
                    directionsRenderer.setMap(map);
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            }
        );
    };

    const is2DArray = places?.length > 0 && Array.isArray(places[0]);

    const renderMarkers = () => {
        if (!places || places.length === 0) return null;

        console.log("Rendering markers, zoomLevel:", zoomLevel);
        console.log("Places:", JSON.stringify(places, null, 2));

        if (is2DArray) {
            return places.map((placeGroup, i) => {
                if (!placeGroup || placeGroup.length === 0) return null;

                const markers = [];

                if (zoomLevel < 16) {
                    // Show main activity for all groups when zoom < 16
                    markers.push(
                        <div
                            className={classes.markerContainer}
                            lat={Number(placeGroup[0].latitude)}
                            lng={Number(placeGroup[0].longitude)}
                            key={`group-${i}-0`}
                        >
                            {renderMarkerContent(placeGroup[0], displayingTable, i, isDesktop, 0)}
                        </div>
                    );
                } else {
                    // When zoom >= 16:
                    // - Show subactivities for groups with subactivities
                    // - Show main activity for groups with no subactivities
                    if (placeGroup.length > 1) {
                        console.log(`Rendering subactivities for group ${i}, zoom: ${zoomLevel}`);
                        placeGroup.slice(1).forEach((place, j) => {
                            if (place && place.latitude && place.longitude) {
                                markers.push(
                                    <div
                                        className={classes.markerContainer}
                                        lat={Number(place.latitude)}
                                        lng={Number(place.longitude)}
                                        key={`group-${i}-${j + 1}`}
                                    >
                                        {renderMarkerContent(place, displayingTable, i, isDesktop, j + 1)}
                                    </div>
                                );
                            } else {
                                console.warn(`Invalid place data in group ${i}, index ${j + 1}:`, place);
                            }
                        });
                    } else {
                        console.log(`Rendering main activity for group ${i} (no subactivities), zoom: ${zoomLevel}`);
                        markers.push(
                            <div
                                className={classes.markerContainer}
                                lat={Number(placeGroup[0].latitude)}
                                lng={Number(placeGroup[0].longitude)}
                                key={`group-${i}-0`}
                            >
                                {renderMarkerContent(placeGroup[0], displayingTable, i, isDesktop, 0)}
                            </div>
                        );
                    }
                }

                return markers;
            });
        } else {
            // For 1D array: render all places normally
            return places.map((place, i) => {
                if (!place) return null;
                return (
                    <div
                        className={classes.markerContainer}
                        lat={Number(place.latitude)}
                        lng={Number(place.longitude)}
                        key={i}
                    >
                        {renderMarkerContent(place, displayingTable, i, isDesktop, 0)}
                    </div>
                );
            });
        }
    };

    const renderMarkerContent = (place, tableType, groupIndex, isDesktop, subIndex) => {
        if (tableType === "Planner") {
            return (
                <Tooltip title={place.description || place.name} arrow>
                    <Paper elevation={4} className={classes.paper}>
                        <div className={classes.markerContent}>
                            <Typography
                                className={classes.index}
                                variant="subtitle1"
                                color="primary"
                            >
                                {subIndex === 0 ? `${groupIndex + 1}` : `${groupIndex + 1}.${subIndex}`}
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
            );
        }

        if (tableType === "Discover") {
            return !isDesktop ? (
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
                    <Rating size="small" value={Number(place.rating)} readOnly />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => {
                            setDisplayingTable("Planner");
                            setDisplayingComponent("AddActivity");
                        }}
                    >
                        Add
                    </Button>
                </Paper>
            );
        }
    };

    return (
        <div className={classes.mapContainer}>
            <GoogleMapReact
                key="map"
                bootstrapURLKeys={{ key: process.env.REACT_API_GOOGLE_MAPS_API_KEY }}
                center={coordinates}
                defaultZoom={14}
                margin={[100, 50, 50, 50]}
                options={''}
                onChange={(event) => {
                    console.log("Map changed, new zoom:", event.zoom);
                    setCoordinates({ lat: event.center.lat, lng: event.center.lng });
                    setBounds({ ne: event.marginBounds.ne, sw: event.marginBounds.sw });
                    setZoomLevel(event.zoom);
                }}
                onChildClick={(child) => { setChildClicked(child) }}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={displayingTable === "Planner" ? ({ map, maps }) => {
                    setMapCopy(map);
                } : ''}
            >
                {renderMarkers()}
            </GoogleMapReact>
        </div>
    );
};

export default Map;