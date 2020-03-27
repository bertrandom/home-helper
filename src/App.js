import React from 'react';
import SignUp from './sign_up';
import Success from './success';

export default function App() {
	const [success, setSuccess] = React.useState(false);
	const handleSuccess = () => {
		setSuccess(true);
	};
	if (success) {
		return <Success />;
	} else {
		return <SignUp onSuccess={handleSuccess} />;
	}
}
