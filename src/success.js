import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.success.main,
		width: '180px',
		height: '180px',
	},
	icon: {
		fontSize: '10rem',
	},
}));

export default function Success() {
	const classes = useStyles();

	return (
		<Container component="main" maxWidth="sm">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<CheckCircleOutlineIcon className={classes.icon} />
				</Avatar>
			</div>
			<Grid container>
				<Grid item xs={12}>
					<Typography component="h1" variant="h2" align="center">
						Success!
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography component="p" variant="body1" align="center">
						We will be in touch with you shortly regarding your request.
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography component="p" variant="body2" align="center">
						Thank you &lt;3
					</Typography>
				</Grid>
			</Grid>
		</Container>
	);
}
