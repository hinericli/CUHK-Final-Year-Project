import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '120px', // Slightly wider for better text wrapping
    background: 'linear-gradient(145deg, #ffffff, #f0f4f8)', // Subtle gradient
    borderRadius: '8px', // Rounded corners
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Softer, modern shadow
    transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Smooth hover animation
    '&:hover': {
      transform: 'scale(1.05)', // Slight scale-up on hover
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)', // Enhanced shadow on hover
    },
  },
  markerContainer: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
    '&:hover': { zIndex: 2 },
  },
  markerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5), // Space between elements
  },
  index: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    background: theme.palette.primary.light, // Light primary color background
    color: '#fff', // White text for contrast
    borderRadius: '12px',
    padding: theme.spacing(0.5, 1),
    textAlign: 'center',
    width: 'fit-content',
  },
  placeName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    textAlign: 'center',
    lineHeight: 1.3,
    color: theme.palette.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2, // Limit to 2 lines
    WebkitBoxOrient: 'vertical',
  },
  mapContainer: {
    position: 'fixed',
    height: '85vh',
    width: '67%',
    borderRadius: '12px', // Rounded map container
    overflow: 'hidden', // Ensure content stays within bounds
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    [theme.breakpoints.down('sm')]: {
      width: '100%', // Responsive full-width on mobile
      height: '70vh', // Slightly shorter on smaller screens
    },
  },
  pointer: {
    cursor: 'pointer',
  },
}));