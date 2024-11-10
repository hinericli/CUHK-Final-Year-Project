import React from 'react';

const PlaceDetail = ({place}) => {
    console.log(place)
    return (
        <h1>{place.name}</h1>
    )
}

export default PlaceDetail;