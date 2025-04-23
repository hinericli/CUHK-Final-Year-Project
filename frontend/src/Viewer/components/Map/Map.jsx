import React, { useContext, useEffect, useMemo, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { Paper, Typography, useMediaQuery, Button, Tooltip } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import Rating from '@material-ui/lab/Rating';
import AddIcon from '@material-ui/icons/Add';

import useStyles from './styles';
import { AppContext } from '../../Viewer';

const Map = ({ setCoordinates, setBounds, coordinates, setChildClicked }) => {
    const classes = useStyles();
    const isDesktop = useMediaQuery('(min-width:600px)');

    const {
        places,
        setPlaces,
        displayingTable,
        setDisplayingTable,
        setDisplayingComponent,
        selectedActivityCardCoord,
        directionInformation,
        setDirectionInformation,
        directionColor,
        setSelectedPlaceFromDiscover,
    } = useContext(AppContext);

    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [mapCopy, setMapCopy] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(14);
    const [segmentRenderers, setSegmentRenderers] = useState([]);

    useEffect(() => {
        console.log('Direction Information:', directionInformation);
    }, [directionInformation]);

    // Initialize DirectionsService and DirectionsRenderer
    useMemo(() => {
        setDirectionsService(new window.google.maps.DirectionsService());
        setDirectionsRenderer(
            new window.google.maps.DirectionsRenderer({
                preserveViewport: true,
            })
        );
    }, []);

    // Handle displayingTable changes
    useEffect(() => {
        if (displayingTable === 'Planner') {
            clearAllRenderers();
            drawPath(mapCopy);
        } else if (displayingTable === 'Discover') {
            setPlaces([]);
            clearAllRenderers();
            setDirectionInformation([]);
        }
    }, [displayingTable, mapCopy]);

    // Update polyline options when directionColor changes
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

    // Draw path when places or directionColor changes in Planner mode
    useEffect(() => {
        if (displayingTable === 'Planner') {
            clearAllRenderers();
            drawPath(mapCopy);
        }
    }, [places, directionColor, mapCopy]);

    // Function to clear all DirectionsRenderer instances
    const clearAllRenderers = () => {
        if (directionsRenderer) {
            directionsRenderer.setMap(null);
            directionsRenderer.setDirections({ routes: [] });
        }
        segmentRenderers.forEach((renderer) => {
            renderer.setMap(null);
            renderer.setDirections({ routes: [] });
        });
        setSegmentRenderers([]);
    };

    const drawPath = (map) => {
        if (!map || !directionsService || !directionsRenderer || !places || places.length < 2) {
            console.log('Not enough places or resources to draw a path.');
            setDirectionInformation([]);
            return;
        }

        // Compute origin, waypoints, and destination from places
        const firstPlace = Array.isArray(places[0]) ? places[0][0] : places[0];
        const lastPlace = Array.isArray(places[places.length - 1]) ? places[places.length - 1][0] : places[places.length - 1];

        if (!firstPlace.latitude || !firstPlace.longitude || !lastPlace.latitude || !lastPlace.longitude) {
            console.error('Invalid place data:', firstPlace, lastPlace);
            setDirectionInformation([]);
            return;
        }

        // Combine origin, waypoints, and destination into a single array of points
        const allPoints = [];
        places?.map(placeGroup => {
            const place = Array.isArray(placeGroup) ? placeGroup[0] : placeGroup
            if (place.latitude && place.longitude) {
                allPoints.push(new window.google.maps.LatLng({ lat: Number(place.latitude), lng: Number(place.longitude)}));
            }
        })

        console.log('All Points for Routing:', allPoints);

        if (allPoints.length < 2) {
            console.log('Not enough points to draw a path.');
            setDirectionInformation([]);
            return;
        }

        // Draw a single segment
        const drawSegment = (start, end, travelMode = window.google.maps.TravelMode.TRANSIT, callback, index) => {
            console.log(`Attempting segment from ${JSON.stringify(start)} to ${JSON.stringify(end)} at index: ${index}`);

            // Determine travel mode based on distance
            let selectedMode = travelMode;
            if (window.google.maps.geometry) {
                const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                    new window.google.maps.LatLng(start.lat, start.lng),
                    new window.google.maps.LatLng(end.lat, end.lng)
                );
                console.log(`Distance for segment ${index}: ${distance} meters`);
                if (distance < 1000 && travelMode === window.google.maps.TravelMode.TRANSIT) {
                    console.log('Distance < 1km, using WALKING mode');
                    selectedMode = window.google.maps.TravelMode.WALKING;
                }
            } else {
                console.warn('Google Maps Geometry library not loaded, cannot compute distance. Using default mode:', travelMode);
            }

            directionsService.route(
                {
                    origin: start,
                    destination: end,
                    travelMode: selectedMode,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        console.log(`Segment successful with ${selectedMode} mode at index: ${index}`, result);
                        const segmentRenderer = new window.google.maps.DirectionsRenderer({
                            suppressMarkers: true,
                            preserveViewport: true,
                            polylineOptions: {
                                strokeColor: directionColor,
                                strokeWeight: 5,
                            },
                        });
                        segmentRenderer.setDirections(result);
                        segmentRenderer.setMap(map);
                        setSegmentRenderers((prev) => [...prev, segmentRenderer]);

                        // Extract direction information
                        const leg = result.routes[0].legs[0];
                        console.log('Selected Mode:', selectedMode, 'Leg:', leg);
                        const directionInfo = {
                            transportMethod: selectedMode,
                            distance: leg.distance.text,
                            duration: leg.duration.text,
                            startLocation: leg.start_address,
                            endLocation: leg.end_address,
                        };

                        // Add transit line information if TRANSIT mode
                        if (selectedMode === window.google.maps.TravelMode.TRANSIT) {
                            const transitSteps = leg.steps.filter((step) => step.travel_mode === 'TRANSIT');
                            const transitLines = transitSteps
                                .map((step) => {
                                    const line = step.transit?.line;
                                    if (line) {
                                        return line.short_name || line.name || 'Unknown Line';
                                    }
                                    return null;
                                })
                                .filter((line) => line !== null);
                            directionInfo.transitLines = transitLines.length > 0 ? transitLines : ['N/A'];
                        } else {
                            directionInfo.transitLines = ['N/A'];
                        }

                        callback(true, directionInfo, index);
                    } else if (
                        selectedMode === window.google.maps.TravelMode.TRANSIT &&
                        ['ZERO_RESULTS', 'NOT_FOUND', 'UNKNOWN_ERROR'].includes(status)
                    ) {
                        console.warn(`TRANSIT mode failed for segment with status: ${status}. Retrying with WALKING mode.`);
                        drawSegment(start, end, window.google.maps.TravelMode.WALKING, callback, index);
                    } else if (
                        selectedMode === window.google.maps.TravelMode.WALKING &&
                        ['ZERO_RESULTS', 'NOT_FOUND', 'UNKNOWN_ERROR'].includes(status)
                    ) {
                        console.warn(`WALKING mode failed for segment with status: ${status}. Retrying with DRIVING mode.`);
                        drawSegment(start, end, window.google.maps.TravelMode.DRIVING, callback, index);
                    } else {
                        console.error(`Error fetching segment with ${selectedMode} mode: ${status}`, result);
                        callback(false, null, index);
                    }
                }
            );
        };

        // Clear previous direction info
        setDirectionInformation([]);

        // Initialize an array to store direction info in order
        const tempDirectionInfo = new Array(allPoints.length - 1).fill(null);

        // Iterate through consecutive pairs of points
        let completedSegments = 0;
        for (let i = 0; i < allPoints.length - 1; i++) {
            const start = allPoints[i];
            const end = allPoints[i + 1];

            drawSegment(start, end, window.google.maps.TravelMode.TRANSIT, (success, directionInfo, index) => {
                if (success && directionInfo) {
                    tempDirectionInfo[index] = directionInfo;
                    completedSegments++;
                    console.log(`Segment ${index + 1}/${allPoints.length - 1} completed.`);
                } else {
                    console.error(`Failed to draw segment ${index + 1}/${allPoints.length - 1}.`);
                    tempDirectionInfo[index] = null;
                    completedSegments++;
                }

                if (completedSegments === allPoints.length - 1) {
                    console.log('All segments processed. Updating directionInformation:', tempDirectionInfo);
                    setDirectionInformation(tempDirectionInfo.filter((info) => info !== null));
                    const bounds = new window.google.maps.LatLngBounds();
                    allPoints.forEach((point) => bounds.extend(point));
                    map.fitBounds(bounds);
                }
            }, i);
        }
    };

    const is2DArray = places?.length > 0 && Array.isArray(places[0]);

    const renderMarkers = () => {
        if (!places || places.length === 0) return null;

        if (is2DArray) {
            return places.map((placeGroup, i) => {
                if (!placeGroup || placeGroup.length === 0) return null;

                const markers = [];

                if (zoomLevel < 16) {
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
                    // zoomLevel >= 16
                    if (placeGroup.length > 1) {
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
        if (tableType === 'Planner') {
            return (
                <Tooltip title={place.description || place.name} arrow>
                    <Paper elevation={4} className={classes.paper}>
                        <div className={classes.markerContent}>
                            <Typography className={classes.index} variant="subtitle1" color="primary">
                                {subIndex === 0 ? `${groupIndex + 1}` : `${groupIndex + 1}.${subIndex}`}
                            </Typography>
                            <Typography className={classes.placeName} variant="subtitle2" color="textPrimary">
                                {place.name}
                            </Typography>
                        </div>
                    </Paper>
                </Tooltip>
            );
        }

        if (tableType === 'Discover') {
            return !isDesktop ? (
                <LocationOnOutlinedIcon color="primary" fontSize="large" />
            ) : (
                <Paper elevation={3} className={classes.paper}>
                    <Typography className={classes.typography} variant="subtitle2" gutterBottom>
                        {place.name}
                    </Typography>
                    <img
                        className={classes.pointer}
                        src={
                            place.photo
                                ? place.photo.images.large.url
                                : 'https://cdn-icons-png.flaticon.com/512/1147/1147856.png'
                        }
                        alt={place.name}
                    />
                    <Rating size="small" value={Number(place.rating)} readOnly />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => {
                            setDisplayingTable('Planner');
                            setDisplayingComponent('AddActivity');
                            console.log('Adding place:', place);
                            setSelectedPlaceFromDiscover(place);
                        }}
                    >
                        Add
                    </Button>
                </Paper>
            );
        }
    };

    // Update map center when selectedCoordinates changes
    useEffect(() => {
        if (selectedActivityCardCoord) {
            setCoordinates(selectedActivityCardCoord);
        }
    }, [selectedActivityCardCoord, setCoordinates]);

    return (
        <div className={classes.mapContainer}>
            <GoogleMapReact
                key="map"
                bootstrapURLKeys={{ key: process.env.REACT_API_GOOGLE_MAPS_API_KEY, libraries: ['geometry'] }}
                center={coordinates}
                defaultZoom={14}
                margin={[100, 50, 50, 50]}
                options={{ gestureHandling: 'greedy' }}
                onChange={(event) => {
                    setCoordinates({ lat: event.center.lat, lng: event.center.lng });
                    setBounds({ ne: event.marginBounds.ne, sw: event.marginBounds.sw });
                    setZoomLevel(event.zoom);
                }}
                onChildClick={(child) => {
                    setChildClicked(child);
                }}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={
                    displayingTable === 'Planner'
                        ? ({ map, maps }) => {
                              setMapCopy(map);
                              if (!window.google.maps.geometry) {
                                  console.error('Google Maps geometry library not loaded');
                              } else {
                                  console.log('Geometry library loaded successfully');
                              }
                          }
                        : ''
                }
            >
                {renderMarkers()}
            </GoogleMapReact>
        </div>
    );
};

export default Map;