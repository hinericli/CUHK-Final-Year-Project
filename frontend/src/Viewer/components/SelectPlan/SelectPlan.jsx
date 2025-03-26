import React, { useContext, useEffect, useState } from 'react';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Card, CardContent } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EventNoteIcon from '@material-ui/icons/EventNote';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import useStyles from './styles';
import { deletePlanById, getMaxPlanId, getPlan } from '../../../api';
import { PlanContext } from '../Planner/Planner';
import { GeneratedResponseDataContext } from '../../Viewer';

const SelectPlan = ({ setDisplayingComponent }) => {
  const classes = useStyles();

  const { plan, setPlan } = useContext(PlanContext);
  const { generatedResponseData, setGeneratedResponseData } = useContext(GeneratedResponseDataContext);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [startingDate, setStartDateTime] = useState(null);
  const [endingDate, setEndDateTime] = useState(null);
  const [createdPlans, setCreatedPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state for better UX

  // Fetch all plans from the backend
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const maxId = await getMaxPlanId();
      console.log('Max Plan ID:', maxId); // Debug: Check maxId
      const dbPlans = [];
      for (let i = 1; i <= maxId; i++) {
        try {
          const plan = await getPlan(i);
          if (plan && JSON.stringify(plan, null, 2) !== '[]') {
            dbPlans.push(plan[0]);
          }
        } catch (err) {
          console.error(`Error fetching plan ${i}:`, err);
        }
      }
      console.log('Fetched Plans:', dbPlans); // Debug: Check fetched data
      setCreatedPlans(dbPlans); // Update state with fetched plans
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlan = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewPlanName('');
    setStartDateTime(null);
    setEndDateTime(null);
  };

  const handleSaveNewPlan = async () => {
    try {
      const response = await fetch('http://localhost:3000/new-plan/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlanName,
          startingDate: startingDate,
          endingDate: endingDate,
          dayList: [],
          dayCount: dayjs(endingDate).diff(dayjs(startingDate), 'day') + 1,
          cost: 0,
        }),
      });

      if (response.ok) {
        const emptyPlan = await response.json();
        console.log('New Plan Saved:', emptyPlan); // Debug: Confirm plan creation
        await fetchPlans(); // Refresh the list after saving
      }
    } catch (error) {
      console.error('Error creating empty Plan object:', error);
    }
    handleCloseAddDialog();
  };

  const handleDeletePlan = (planId, index) => {
    const updatedPlans = [...createdPlans];
    updatedPlans.splice(index, 1);
    setCreatedPlans(updatedPlans);
    // sync with backend and call fetchPlans()
    deletePlanById(planId)
  };

  const handleViewPlan = (plan) => {
    setPlan(plan);
    console.log('Viewing Plan:', plan); // Debug: Check selected plan
    setDisplayingComponent('Planner');
  };

  // Fetch plans on mount and when generatedResponseData changes
  useEffect(() => {
    console.log('useEffect triggered with generatedResponseData:', generatedResponseData); // Debug: Check dependency
    fetchPlans();
  }, [generatedResponseData]);

  return (
    <div>
      <Typography variant="h5" className={classes.title}>Select Plan</Typography>
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
              label="Start Date"
              value={startingDate}
              onChange={(newValue) => setStartDateTime(newValue)}
              format="DD-MM-YYYY"
            />
            <DatePicker
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

      {isLoading ? (
        <Typography>Loading plans...</Typography>
      ) : createdPlans.length > 0 ? (
        <div>
          <Typography variant="h6">Created Plans:</Typography>
          {createdPlans.map((plan, index) => (
            <Card key={index} className={classes.card}>
              <CardContent>
                <Typography variant="h6">{plan.name}</Typography>
                <Typography>Start: {dayjs(plan.startingDate).format('DD-MM-YYYY')}</Typography>
                <Typography>End: {dayjs(plan.endingDate).format('DD-MM-YYYY')}</Typography>
                <Typography># of Days: {plan.dayCount}</Typography>
                <Button onClick={() => handleViewPlan(plan)}>
                  <EventNoteIcon /> View
                </Button>
                <Button onClick={() => handleDeletePlan(plan.planId, index)}>
                  <DeleteIcon /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Typography>No plans available.</Typography>
      )}
    </div>
  );
};

export default SelectPlan;