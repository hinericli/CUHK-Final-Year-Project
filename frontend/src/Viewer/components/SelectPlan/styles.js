import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    margin: theme.spacing(2, 0),
    fontWeight: 600,
    color: theme.palette.primary.dark,
    textAlign: 'center',
  },
  button: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(1.5, 3),
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: theme.shadows[2],
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)',
    },
  },
  card: {
    margin: theme.spacing(2, 0),
    borderRadius: '12px',
    boxShadow: theme.shadows[3],
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[6],
    },
    backgroundColor: '#ffffff',
    minWidth: '350px', // Increased from default to make cards wider
    minHeight: '200px', // Added to ensure taller cards
  },
  cardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1),
    minHeight: '140px', // Ensure content area is taller
  },
  planDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1), // Added spacing between text elements
  },
  planActions: {
    display: 'flex',
    flexDirection: 'column', // Stack buttons vertically for better fit
    gap: theme.spacing(1),
    alignItems: 'flex-end',
  },
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: '12px',
      padding: theme.spacing(2),
      backgroundColor: '#ffffff',
    },
  },
  dialogTitle: {
    fontWeight: 600,
    color: theme.palette.primary.dark,
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  loading: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    margin: theme.spacing(4, 0),
  },
  noPlans: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    margin: theme.spacing(4, 0),
    fontStyle: 'italic',
  },
}));