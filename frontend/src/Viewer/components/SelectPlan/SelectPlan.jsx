import React, { useContext, useMemo, useState } from 'react';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Card, CardContent } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EventNoteIcon from '@material-ui/icons/EventNote';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers'; // Change from DateTimePicker to DatePicker
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import useStyles from './styles';

import { getPlan } from '../../../api';
import { PlanContext } from '../Planner/Planner';
import Plan from '../Planner/Plan';

const SelectPlan = ({ setDisplayingComponent }) => {
    const classes = useStyles();

    const {plan, setPlan} = useContext(PlanContext);

    const [plans, setPlans] = useState([]); // list of plans
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newPlanName, setNewPlanName] = useState('');
    const [startingDate, setStartDateTime] = useState(null);
    const [endingDate, setEndDateTime] = useState(null);
    const [createdPlans, setCreatedPlans] = useState([]);   // all plans are stored in here

    const handleAddPlan = () => {
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewPlanName('');
        setStartDateTime(null);
        setEndDateTime(null);
    };

    const handleSaveNewPlan = () => {
        const plan = new Plan(
            newPlanName,
            startingDate,
            endingDate,
            dayjs(endingDate).diff(dayjs(startingDate), 'day') + 1,
            0
        )

        setCreatedPlans([...createdPlans, plan]);

        handleCloseAddDialog();
    };

    const handleDeletePlan = (index) => {
        const updatedPlans = [...createdPlans];
        updatedPlans.splice(index, 1);
        setCreatedPlans(updatedPlans);
    };

    const handleViewPlan = (plan) => {
        setPlan(plan)
        //console.log(createdPlans)
        setDisplayingComponent("Planner");
    };

    useMemo(() => {
        let dbPlans = plans.push(getPlan(1));
        setPlans(dbPlans);
    }, [])

    return (
        <div>
            <Typography variant="h5" className={classes.title}>Select Plan</Typography>
            {plans && plans.length > 0 && (
                <div>
                    {plans.map((plan, index) => (
                        <Card key={index} className={classes.card}>
                            <CardContent onClick={() => handleViewPlan(plan.name)}>
                                <Typography variant="h6">{plan.name}</Typography>
                                <Typography variant="body2">{plan.description}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <Button className={classes.button} variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddPlan}>
                Add Plan
            </Button>

            <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
                <DialogTitle>Add New Plan</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="newPlanName"
                        label="Plan Name"
                        type="text"
                        fullWidth
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            renderInput={(props) => <TextField {...props} />}
                            label="Start Date"
                            value={startingDate}
                            onChange={(newValue) => setStartDateTime(newValue)}
                            format="DD-MM-YYYY"
                        />
                        <DatePicker
                            renderInput={(props) => <TextField {...props} />}
                            label="End Date"
                            value={endingDate}
                            onChange={(newValue) => setEndDateTime(newValue)}
                            format="DD-MM-YYYY"
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveNewPlan} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {createdPlans.length > 0 && (
                <div>
                    <Typography variant="h6">Created Plans:</Typography>
                    {createdPlans.map((plan, index) => (
                        <Card key={index} className={classes.card}>
                            <CardContent>
                                <Typography variant="h6">{plan.name}</Typography>
                                <Typography>Start: {dayjs(plan.startingDate).format('DD-MM-YYYY')}</Typography>
                                <Typography>End: {dayjs(plan.endingDate).format('DD-MM-YYYY')}</Typography>
                                <Typography># of Days: {plan.dayCount}</Typography>
                                <Button onClick={() => handleViewPlan(plan)}><EventNoteIcon /> View</Button>
                                <Button onClick={() => handleDeletePlan(index)}><DeleteIcon /> Delete</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectPlan;