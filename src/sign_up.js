import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlined from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import sendRequest from './send_request';

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	formControl: {
		margin: theme.spacing(1, 1, 1, 0),
		minWidth: 120,
		width: '100%',
	},
	selectEmpty: {
		marginTop: theme.spacing(2),
	},
	typography: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(1),
	},
	textarea: {
		width: '100%',
		fontFamily: theme.typography.fontFamily,
		fontSize: theme.typography.fontSize,
		backgroundColor: theme.palette.backgroundColor,
	},
	muipicker: {
		paddingRight: theme.spacing(4),
	},
}));

export default function SignUp() {
	const classes = useStyles();

	const [selectedDate, setSelectedDate] = React.useState(new Date());
	const [preferredTime, setPreferredTime] = React.useState('morning');
	const handleDateChange = (date) => {
		setSelectedDate(date);
	};
	const handleChange = (event) => {
		setPreferredTime(event.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const data = new FormData(e.target);
		const firstName = data.get('firstname');
		const lastName = data.get('lastname');
		const email = data.get('email');
		const phoneNumber = data.get('phonenumber');
		const address = data.get('address');
		const zipcode = data.get('zipcode');
		const city = data.get('city');
		const state = data.get('state');
		const request = data.get('request');
		const requestData = {
			firstName,
			lastName,
			email,
			phoneNumber,
			address,
			zipcode,
			city,
			state,
			selectedDate,
			preferredTime,
			request,
		};

		sendRequest(requestData)
			.then((status) => {
				if (!status.ok) {
					console.error('Request error:', status);
					return;
				}
				console.log('Request compelted successfully:', status);
			})
			.catch((error) => {
				console.error('Network error: ', error);
			});
	};

	const [firstName, setFirstName] = React.useState('');
	const [lastName, setLastName] = React.useState('');
	const [email, setEmail] = React.useState('');
	const [phoneNumber, setPhoneNumber] = React.useState('');
	const [address, setAddress] = React.useState('');
	const [zipcode, setZipcode] = React.useState('');
	const [city, setCity] = React.useState('');
	const [state, setState] = React.useState('');
	const [request, setRequest] = React.useState('');

	function handleDummyData() {
		setFirstName(['Janice', 'Carol', 'Bob', 'Steve', 'Aristotle'][parseInt(Math.floor(Math.random() * 5))]);
		setLastName(
			['Smith', 'Smitherton', 'Simpson', 'Cantelever', 'Paulieston'][parseInt(Math.floor(Math.random() * 5))]
		);
		setEmail(
			[
				'hello@emailaddress.com',
				'example@example.org',
				'boberton@bigbobs.com',
				'steve@steverton.com',
				'aris@totle.com',
			][parseInt(Math.floor(Math.random() * 5))]
		);
		setPhoneNumber(
			['415-555-1212', '(510) 123-5678', '(480) 123-1234', '(602) 961-1234', '(909) 987-9999'][
				parseInt(Math.floor(Math.random() * 5))
			]
		);
		setAddress(
			[
				'123 W Any Street.',
				'742 Evergreen Terrace',
				'456 E Avenue Place',
				'18 West Peachtree Court',
				'123A Broadway Pl.',
			][parseInt(Math.floor(Math.random() * 5))]
		);
		setZipcode(['01001', '94103', '87654', '76549', '63895'][parseInt(Math.floor(Math.random() * 5))]);
		setCity(
			['San Francisco', 'Oakland', 'Phoenix', 'Springfield', 'Memphis'][parseInt(Math.floor(Math.random() * 5))]
		);
		setState(['CA', 'AZ', 'OR', 'WA', 'MA'][parseInt(Math.floor(Math.random() * 5))]);
		setRequest(
			[
				'Hello, please send me some groceries. I need: coffee, onions, gravy, strawberries, sandwiches, masking tape, drain cleaner, a bundle of thyme, and fruit leather.',
				'Hi there! I need some more toilet paper, any-ply is fine.',
				'I need to order dinner for this weekend for 2 people.',
				'I would like to order take out from my favorite restaurant.',
				'Greetings! I am running low on shaving cream.',
			][parseInt(Math.floor(Math.random() * 5))]
		);
		setPreferredTime(['morning', 'afternoon', 'night'][parseInt(Math.floor(Math.random() * 3))]);
	}

	return (
		<Container component="main" maxWidth="sm">
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlined />
				</Avatar>
				<Typography component="h1" variant="h4">
					Register
				</Typography>
				<form className={classes.form} method="post" onSubmit={handleSubmit}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<TextField
								autoComplete="fname"
								name="firstname"
								variant="outlined"
								required
								fullWidth
								id="firstname"
								label="First Name"
								autoFocus
								value={firstName}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								variant="outlined"
								fullWidth
								id="lastname"
								label="Last Name"
								name="lastname"
								autoComplete="lname"
								value={lastName}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								variant="outlined"
								fullWidth
								id="email"
								label="Email Address"
								name="email"
								autoComplete="email"
								value={email}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								variant="outlined"
								fullWidth
								id="phonenumber"
								label="Phone Number"
								name="phonenumber"
								autoComplete="phonenumber"
								value={phoneNumber}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								variant="outlined"
								fullWidth
								id="address"
								label="Street Address"
								name="address"
								autoComplete="address"
								value={address}
							/>
						</Grid>
						<Grid item xs={12} sm={3}>
							<TextField
								variant="outlined"
								fullWidth
								id="zipcode"
								label="Zipcode"
								name="zipcode"
								autoComplete="zipcode"
								value={zipcode}
							/>
						</Grid>
						<Grid item xs={12} sm={7}>
							<TextField
								variant="outlined"
								fullWidth
								id="city"
								label="City"
								name="city"
								autoComplete="city"
								value={city}
							/>
						</Grid>
						<Grid item xs={12} sm={2}>
							<TextField
								variant="outlined"
								fullWidth
								id="state"
								label="State"
								name="state"
								autoComplete="state"
								value={state}
							/>
						</Grid>
					</Grid>
					<Grid container>
						<Grid item xs={12}>
							<Typography component="h2" variant="h5" className={classes.typography}>
								Preferred date
							</Typography>
						</Grid>
					</Grid>
					<Grid container>
						<Grid item xs={12} sm={8} className={classes.muipicker}>
							<MuiPickersUtilsProvider utils={DateFnsUtils}>
								<KeyboardDatePicker
									variant="static"
									margin="normal"
									id="deliverywindow"
									value={selectedDate}
									onChange={handleDateChange}
									KeyboardButtonProps={{
										'aria-label': 'change delivery date',
									}}
								/>
							</MuiPickersUtilsProvider>
						</Grid>
						<Grid item xs={12} sm={4}>
							<FormControl className={classes.formControl}>
								<Select
									labelId="preferredtime"
									id="preferredtime"
									value={preferredTime}
									onChange={handleChange}
								>
									<MenuItem value="morning">Morning</MenuItem>
									<MenuItem value="afternoon">Afternoon</MenuItem>
									<MenuItem value="night">Night</MenuItem>
								</Select>
								<FormHelperText>Preferred time of day</FormHelperText>
							</FormControl>
						</Grid>
					</Grid>
					<Grid item xs={12}>
						<Typography component="h2" variant="h5" className={classes.typography}>
							What do you need assistance with?
						</Typography>
					</Grid>
					<Grid item xs={12}>
						<TextareaAutosize
							className={classes.textarea}
							rowsMin={5}
							id="request"
							name="request"
							value={request}
						/>
					</Grid>

					<Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
						Submit request
					</Button>
					<Button onClick={handleDummyData}>Fill In Dummy Data</Button>
				</form>
			</div>
		</Container>
	);
}
