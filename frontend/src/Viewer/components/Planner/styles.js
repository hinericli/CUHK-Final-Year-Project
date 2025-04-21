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
    // Alternative: theme.palette.primary.light or theme.palette.background.paper
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
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
    fontStyle: 'italic', // Added to make text italic
  },
  cardContent: {
    padding: theme.spacing(1),
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
    '&:last-child': {
      paddingBottom: theme.spacing(1.5), // Ensure consistent padding
    },
  },
}));