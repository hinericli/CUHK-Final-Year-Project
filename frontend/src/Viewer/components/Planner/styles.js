import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  chip: {
    margin: '5px 5px 5px 0',
  },
  title: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px',
  },
  subtitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  spacing: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plusButton: {
    position: 'sticky',
    justifyContent: 'center',
  },
  styledCard: {
    maxWidth: 600,
    margin: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.background.paper,
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
  subActivityCard: {
    marginLeft: theme.spacing(4), // Indent sub-activities
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    borderLeft: `3px solid ${theme.palette.primary.light}`, // Subtle border for hierarchy
    backgroundColor: theme.palette.grey[50], // Lighter background
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)', // Softer shadow
  },
  subActivityCardContent: {
    padding: theme.spacing(1.5),
    '&:last-child': {
      paddingBottom: theme.spacing(1.5),
    },
  },
  subActivityTitle: {
    fontWeight: 500,
    fontSize: '0.95rem',
    color: theme.palette.text.primary,
  },
  subActivityTime: {
    fontWeight: 400,
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
  },
  subActivityPlace: {
    marginLeft: theme.spacing(1),
    fontSize: '0.85rem',
    color: theme.palette.text .secondary,
    fontStyle: 'italic',
  },
  subActivityPlace: {
    fontWeight: 400,
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
  },
  subActivityDescription: {
    fontWeight: 400,
    fontSize: '0.85rem',
    color: theme.palette.text.primary,
    marginTop: theme.spacing(1),
  },
  labelTypography: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    fontSize: '0.9rem',
    marginRight: theme.spacing(1),
  },
  valueTypography: {
    fontWeight: 400,
    color: theme.palette.text.primary,
    fontSize: '0.85rem',
    fontStyle: 'italic',
  },
  cardContent: {
    padding: theme.spacing(1),
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
    '&:last-child': {
      paddingBottom: theme.spacing(1.5),
    },
  },
}));