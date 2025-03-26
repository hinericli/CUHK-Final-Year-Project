import React, { createContext, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { saveJson } from '../../../api';

export const PlanResponseDataContext = createContext();

const PlanSuggestion = () => {
    // --- For AI text query 
    const [query, setQuery] = useState('');
    const [isLoadingAPI, setIsLoadingAPI] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [openDialog, setOpenDialog] = useState(false); // New state for dialog
    const apiBase = 'http://localhost:3000';

    const handleSubmit = async () => {
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
            setResponseData(data);
            setQuery('');
            saveJson(data)
            setOpenDialog(true); // Open dialog on success
        } catch (error) {
            console.error('Error:', error);
            setResponseData({ error: error.message });
        } finally {
            setIsLoadingAPI(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <>
        <PlanResponseDataContext.Provider value={{responseData, setResponseData}}>
        <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                <TextField 
                    variant="outlined"
                    placeholder="Enter your query"
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
                        Submit
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
        </PlanResponseDataContext.Provider>
        </>
    )
}

export default PlanSuggestion