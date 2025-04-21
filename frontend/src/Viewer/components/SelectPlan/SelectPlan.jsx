import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EventNoteIcon from '@material-ui/icons/EventNote';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import useStyles from './styles';
import { deletePlanById, getMaxPlanId, getPlan } from '../../../api';
import { PlanContext } from '../../Viewer';
import { GeneratedResponseDataContext } from '../../Viewer';

const SelectPlan = ({ setDisplayingComponent }) => {
  const classes = useStyles();

  const { plan, setPlan } = useContext(PlanContext);
  const { generatedResponseData } = useContext(GeneratedResponseDataContext);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [startingDate, setStartDateTime] = useState(null);
  const [endingDate, setEndDateTime] = useState(null);
  const [createdPlans, setCreatedPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize fetchPlans to prevent unnecessary re-creations
  const fetchPlans = useCallback(async (retryCount = 3, delay = 1000) => {
    setIsLoading(true);
    try {
      for (let attempt = 1; attempt <= retryCount; attempt++) {
        const maxId = await getMaxPlanId();
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
        console.log(`Fetched plans (attempt ${attempt}):`, dbPlans); // Debug log
        // Check if the new plan from generatedResponseData is included
        if (
          !generatedResponseData ||
          !generatedResponseData.planId ||
          dbPlans.some((plan) => plan.planId === generatedResponseData.planId)
        ) {
          // Merge with existing createdPlans to preserve new plans not yet in API
          setCreatedPlans((prevPlans) => {
            const mergedPlans = [...dbPlans];
            prevPlans.forEach((prevPlan) => {
              if (!mergedPlans.some((p) => p.planId === prevPlan.planId)) {
                mergedPlans.push(prevPlan);
              }
            });
            console.log('Merged createdPlans:', mergedPlans); // Debug log
            return mergedPlans;
          });
          break;
        }
        if (attempt < retryCount) {
          console.log(`Retrying fetchPlans after ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since fetchPlans doesn't depend on props/state

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
        await fetchPlans(); // Fetch plans immediately after saving
      }
    } catch (error) {
      console.error('Error creating empty Plan object:', error);
    }
    handleCloseAddDialog();
  };

  const handleDeletePlan = async (planId, index) => {
    try {
      await deletePlanById(planId);
      const updatedPlans = [...createdPlans];
      updatedPlans.splice(index, 1);
      setCreatedPlans(updatedPlans);
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleViewPlan = (plan) => {
    setPlan(plan);
    setDisplayingComponent('Planner');
  };

  // Update createdPlans when generatedResponseData changes
  useEffect(() => {
    console.log('generatedResponseData changed:', generatedResponseData);
    if (generatedResponseData && generatedResponseData.planId) {
      // Check if the plan is already in createdPlans
      const planExists = createdPlans.some(
        (plan) => plan.planId === generatedResponseData.planId
      );
      if (!planExists) {
        console.log('Adding new plan from generatedResponseData:', generatedResponseData);
        // Add the new plan to createdPlans
        setCreatedPlans((prevPlans) => {
          const updatedPlans = [...prevPlans, generatedResponseData];
          console.log('Updated createdPlans:', updatedPlans); // Debug log
          return updatedPlans;
        });
      }
    }
    // Fetch plans to sync with backend, with retries
    fetchPlans();
  }, [fetchPlans, generatedResponseData]);

  // Debug rendering
  useEffect(() => {
    console.log('Rendering with createdPlans:', createdPlans);
  }, [createdPlans]);

  return (
    <div className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Select Your Plan
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddPlan}
      >
        Add New Plan
      </Button>

      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} className={classes.dialog}>
        <DialogTitle className={classes.dialogTitle}>Create a New Plan</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            autoFocus
            label="Plan Name"
            type="text"
            fullWidth
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            variant="outlined"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startingDate}
              onChange={(newValue) => setStartDateTime(newValue)}
              format="DD-MM-YYYY"
              slotProps={{ textField: { variant: 'outlined' } }}
            />
            <DatePicker
              label="End Date"
              value={endingDate}
              onChange={(newValue) => setEndDateTime(newValue)}
              format="DD-MM-YYYY"
              slotProps={{ textField: { variant: 'outlined' } }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveNewPlan} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
          <Typography variant="body1">Loading plans...</Typography>
        </div>
      ) : createdPlans.length > 0 ? (
        <Grid container spacing={2} justifyContent="center">
          {createdPlans.map((plan, index) => (
            <Grid item key={index}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <div className={classes.planDetails}>
                    <Typography variant="h5">{plan.name}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      Start: {dayjs(plan.startingDate).format('DD-MM-YYYY')}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      End: {dayjs(plan.endingDate).format('DD-MM-YYYY')}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Days: {plan.dayCount}
                    </Typography>
                  </div>
                  <div className={classes.planActions}>
                    <Button
                      color="primary"
                      startIcon={<EventNoteIcon />}
                      onClick={() => handleViewPlan(plan)}
                      variant="outlined"
                    >
                      View
                    </Button>
                    <Button
                      color="secondary"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeletePlan(plan.planId, index)}
                      variant="outlined"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" className={classes.noPlans}>
          No plans available. Create a new one to get started!
        </Typography>
      )}
    </div>
  );
};

export default SelectPlan;