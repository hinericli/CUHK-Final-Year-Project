import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { saveJson } from '../../../api';
import { useContext } from 'react';

import { AppContext } from '../../Viewer';

const PlanSuggestion = ({ setGeneratedResponseData, displayingComponent }) => {
    const { plan, directionInformation } = useContext(AppContext); // use PlanContext to get the current plan

    // --- For AI text query 
    const [query, setQuery] = useState('');  // string inputted by the user in the text field
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [openDialog, setOpenDialog] = useState(false); // new state for dialog
    const [openErrorDialog, setOpenErrorDialog] = useState(false); // new state for error dialog
    const apiBase = 'http://localhost:3000';

    const handleSubmit = async () => {
        if (!query.trim()) {
            setOpenErrorDialog(true); // open error dialog if query is empty
            return;
        }
        setIsLoadingAPI(true);
        try {
            if (displayingComponent === 'SelectPlan') {
                const userPromptJson = JSON.stringify({ query: query });
                const generateEndpoint = `${apiBase}/plan-suggestion/`;
                const response = await fetch(generateEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: userPromptJson,
                });
                const data = await response.json();
                saveJson(data);
                setQuery('');
                setGeneratedResponseData(data);
                setOpenDialog(true); // Open dialog on success
            } else if (displayingComponent === 'Planner') {
                // combine plan, query and directionInformation into a single object, then it will send it to the backend as a JSON
                const requestBody = {
                    plan: plan || {}, // empty obj for empty plan
                    query: query,
                    directionInformation: directionInformation
                };
                const modifyEndpoint = `${apiBase}/modify-plan-suggestion/`;
                const response = await fetch(modifyEndpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody), 
                });
                const data = await response.json();
                console.log('Response from server:', data);
                //saveJson(data);
                setQuery('');
                setGeneratedResponseData(data);
                setOpenDialog(true); // open dialog
            }
        } catch (error) {
            console.error('Error:', error);
            setGeneratedResponseData({ error: error.message });
        } finally {
            setIsLoadingAPI(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleCloseErrorDialog = () => {
        setOpenErrorDialog(false);
    };

    // Determine button text based on displayingComponent (Generate/Modify)
    const buttonText = displayingComponent === 'SelectPlan' ? 'Generate' : 'Modify';

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <TextField 
                    variant="outlined"
                    placeholder="Enter your travel plan request"
                    size="small"
                    sx={{ width: '100%' }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSubmit();
                        }
                    }}
                    disabled={isLoadingAPI}
                />
                {isLoadingAPI ? (
                    <CircularProgress 
                        size={24} 
                        style={{ marginLeft: '10px' }} 
                    />
                ) : (
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        style={{ marginLeft: '10px' }}
                        disabled={isLoadingAPI}
                    >
                        {buttonText}
                    </Button>
                )}
            </div>

            {/* Dialog for success message */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="success-dialog-title"
            >
                <DialogContent>
                    <DialogContentText style={{ color: 'green' }}>
                        {buttonText === 'Generate' 
                            ? 'New suggested plan has successfully added into your plan list. Please reload the page to see the changes.' 
                            : 'Your plan has been successfully modified. Please reload the page to see the changes.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for empty input error */}
            <Dialog
                open={openErrorDialog}
                onClose={handleCloseErrorDialog}
                aria-labelledby="error-dialog-title"
            >
                <DialogContent>
                    <DialogContentText style={{ color: 'red' }}>
                        Please enter your plan request.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseErrorDialog} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PlanSuggestion;