import React from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Chip} from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PhoneIcon from '@material-ui/icons/Phone';
import Rating from '@material-ui/lab/Rating';

import useStyles from './styles';

const PlaceDetail = ({place, selected, refProp}) => {
    const classes = useStyles();

    console.log({place, selected, refProp});

    if (selected) refProp?.current?.scrollIntoView({behavior: "smooth", block: "start"});
    return (
        <Card elevation={2}>
            <CardMedia
                style={{height: 150}}
                image={place.photo?place.photo.images.large.url:'https://cdn-icons-png.flaticon.com/512/1147/1147856.png'}
                title={place.name}
            />
            <CardContent>
                <Typography gutterBottom variant="h5">{place.name}</Typography>    
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1">Price</Typography>
                    <Typography gutterBottom varient="subtitle1">{place.price_level?place.price_level:'-'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Rating value={Number(place.rating)} readOnly/>
                    <Typography gutterBottom varient="subtitle1">out of {place.num_reviews} reviews</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1">Ranking</Typography>
                    <Typography gutterBottom varient="subtitle1">{place.ranking}</Typography>
                </Box>
                {place?.cuisine?.map(({name}) => (
                    <Chip key={name} size="small" label={name} className={classes.chip}/>

                ))}
                {place?.address && (
                    <Typography gutterBottom variant="body2" color="textSecondary" className={classes.subtitle}>
                        <LocationOnIcon/> {place.address}
                    </Typography>
                )}
                {place?.phone && (
                    <Typography gutterBottom variant="body2" color="textSecondary" className={classes.subtitle}>
                        <PhoneIcon/> {place.phone}
                    </Typography>
                )}
                <CardActions>
                    <Button size="small" color="primary" onClick={() => window.open(place.website, '_blank')}>
                        Website
                    </Button>
                </CardActions>

            </CardContent>
        </Card>
    )
}

export default PlaceDetail;