import React from 'react';
import { AppBar, Toolbar, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';

import useStyles from './styles';

const Header = ({ setDirectionColor, directionColor }) => {
    const classes = useStyles();
    
    return (
        <AppBar position='static'>
            <Toolbar className={classes.toolbar}>
                <Typography variant="h5" className={classes.title}>
                    Travel Planner
                </Typography>
                <Box display="flex" alignItems="center" gap="1rem">
                    <FormControl style={{ minWidth: 120 }}>
                        <InputLabel id="color-select-label">Direction Color</InputLabel>
                        <Select
                            labelId="color-select-label"
                            id="color-select"
                            value={directionColor}
                            onChange={(e) => setDirectionColor(e.target.value)} // Update directionColor via prop
                        >
                            <MenuItem value="#0000FF">Blue</MenuItem>
                            <MenuItem value="#FF0000">Red</MenuItem>
                            <MenuItem value="#00FF00">Green</MenuItem>
                            <MenuItem value="#FFA500">Orange</MenuItem>
                            <MenuItem value="#800080">Purple</MenuItem>
                        </Select>
                    </FormControl>

                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default Header;