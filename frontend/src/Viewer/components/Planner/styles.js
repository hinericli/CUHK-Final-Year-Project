import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '120px',
    background: 'linear-gradient(145deg, #ffffff, #f0f4f8)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
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
    gap: theme.spacing(0.5),
  },
  index: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    background: theme.palette.primary.light,
    color: '#fff',
    borderRadius: '12px',
    padding: theme.spacing(0.75, 1.5),
    textAlign: 'center',
    width: 'fit-content',
    marginRight: theme.spacing(2),
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
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  mapContainer: {
    position: 'fixed',
    height: '85vh',
    width: '67%',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: '70vh',
    },
  },
  pointer: {
    cursor: 'pointer',
  },
  styledCard: {
    marginBottom: theme.spacing(2),
    borderRadius: '8px',
    background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  },
  cardContent: {
    padding: theme.spacing(2),
  },
  subActivityCard: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
    background: '#f5f5f5',
  },
  subActivityCardContent: {
    padding: theme.spacing(1.5),
  },
  subActivityTitle: {
    fontWeight: 500,
  },
  subActivityTime: {
    color: theme.palette.text.secondary,
  },
  subActivityPlace: {
    marginLeft: theme.spacing(0.5),
  },
  subActivityDescription: {
    color: theme.palette.text.secondary,
  },
  labelTypography: {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  valueTypography: {
    color: theme.palette.text.secondary,
  },
  title: {
    margin: theme.spacing(1, 0),
    textAlign: 'center',
  },
  subtitle: {
    margin: theme.spacing(2, 0, 1, 0),
    fontWeight: 'bold',
  },
  plusButton: {
    margin: theme.spacing(2, 0),
    justifyContent: 'center',
  },
  directionInfo: {
    margin: theme.spacing(2, 0),
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1, 0),
    },
  },
  directionCard: {
    width: '480px',
    maxWidth: '90%', 
    borderRadius: '8px',
    background: 'linear-gradient(145deg, #e6f0fa, #f0f8ff)',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 14px rgba(0, 0, 0, 0.15)',
    },
    padding: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      width: '100%', 
      maxWidth: '100%',
    },
  },
  directionTitle: {
    fontWeight: 600,
    fontSize: '1rem',
    color: theme.palette.primary.dark,
    marginBottom: theme.spacing(1),
  },
  directionText: {
    fontSize: '0.85rem',
    color: theme.palette.text.primary,
    lineHeight: 1.6,
    '& strong': {
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
  },
}));