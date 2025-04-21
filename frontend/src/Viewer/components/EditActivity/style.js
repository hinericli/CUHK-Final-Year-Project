import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  chip: {
    margin: '5px 5px 5px 0',
  },
  title: {
    display: "flex", justifyContent: "center", marginTop: '10px',
  },
  subtitle: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px',
  },
  spacing: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  formControl: {
    margin: theme.spacing(1), minWidth: 120,  marginBottom: '20px'
  },
  finishButton: {
    position: "sticky", justifyContent: "flex-end"
  }

}));