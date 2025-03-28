import React, { createContext, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { saveJson } from '../../../api';

const PlanSuggestion = ({setGeneratedResponseData}) => {
    // --- For AI text query 
    const [query, setQuery] = useState('');
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [openDialog, setOpenDialog] = useState(false); // New state for dialog
    const [openErrorDialog, setOpenErrorDialog] = useState(false); // New state for error dialog
    const apiBase = 'http://localhost:3000';

    const handleSubmit = async () => {
        if (!query.trim()) {
            setOpenErrorDialog(true); // Open error dialog if query is empty
            return;
        }
        setIsLoadingAPI(true);
        try {
            const suggestionJson = JSON.stringify({ query: query });
            const response = await fetch(`${apiBase}/plan-suggestion/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: suggestionJson
            });
            const data = await response.json();
            //console.log(data)
            saveJson(data)
            setQuery('');
            setGeneratedResponseData(data);
            setOpenDialog(true); // Open dialog on success
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

    return (
        <>
        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
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
                        Generate
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
                        New suggested plan has successfully added into your plan list.
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
    )
}

export default PlanSuggestion