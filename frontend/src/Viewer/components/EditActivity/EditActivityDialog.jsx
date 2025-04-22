import React, { useContext, useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import EditActivity from '../EditActivity/EditActivity';
import { AppContext } from '../../Viewer';
import { getPlan } from '../../../api';
import { sortActivities } from '../../../utils/ActivitiesUtils';

const EditActivityDialog = ({ open, setOpen, setDisplayingComponent, activity }) => {
    const { activityList, setActivityList } = useContext(AppContext);

    const [updatedActivity, setUpdatedActivity] = useState(null);

    const handleClose = async () => {
        setOpen(false);
        setDisplayingComponent('Planner');
    };

    useEffect(() => {
        console.log('Activity List Before Update: ', activityList);
        console.log('Updated Activity: ', updatedActivity);
        if (updatedActivity) {
            setActivityList((prevActivities) => {
                const updatedActivities = prevActivities.map((act) => {
                    if (act._id === updatedActivity._id) {
                        return { ...act, ...updatedActivity };
                    }
                    return act;
                });
                const sortedActivities = sortActivities(updatedActivities);
                return sortedActivities;
            }
            );
        }
        console.log('Activity List After Update: ', activityList);

    }, [updatedActivity]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="edit-activity-dialog"
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <IconButton 
                    edge="start" 
                    color="inherit" 
                    onClick={handleClose} 
                    aria-label="back"
                >
                    <ArrowBackIcon />
                </IconButton>
                Back
            </DialogTitle>
            <DialogContent>
                <EditActivity 
                    activity={activity}
                    onSave={handleClose} // Pass handleClose to trigger plan fetch after save
                    setUpdatedActivity={setUpdatedActivity} // Pass the setter function
                />
            </DialogContent>
        </Dialog>
    );
};

export default EditActivityDialog;