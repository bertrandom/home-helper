const path = require('path');
const config = require('config');

const { WebClient } = require('@slack/web-api');

const Router = require('express-promise-router');
const router = new Router();

router.get('/', async (req, res) => {
	res.sendFile(path.join(__dirname, '../build/index.html'));
});

router.get('/install', async (req, res) => {
	res.render('install');
});

router.get('/request', async (req, res) => {
	const client = new WebClient(config.slack.bot_access_token);
	const channel = config.slack.channel;

	let requestData;
	try {
		requestData = JSON.parse(req.query['requestData']);
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}

	let contactInformation;
	if (requestData.email && !requestData.phoneNumber) {
		contactInformation = `You can email me at: *${requestData.email}*`;
	} else if (requestData.phoneNumber && !requestData.email) {
		contactInformation = `You can call me at: *${requestData.phoneNumber}*`;
	} else if (requestData.email && requestData.phoneNumber) {
		contactInformation = `You can contact me at either *${requestData.email}* or *${requestData.phoneNumber}*`;
	}

	const blocks = [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `A request has been recieved by a ${requestData.firstName} ${requestData.lastName} in ${requestData.city}, ${requestData.state}`,
			},
		},
		{
			type: 'divider',
		},
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: requestData.request,
				emoji: true,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: contactInformation,
			},
		},
		{
			type: 'context',
			elements: [
				{
					type: 'mrkdwn',
					text: `In the ${requestData.preferredTime}. Preferably on ${requestData.selectedDate}`,
				},
			],
		},
		{
			type: 'actions',
			elements: [
				{
					type: 'button',
					text: {
						type: 'plain_text',
						text: 'Claim this request',
						emoji: true,
					},
					value: 'claim',
					actionId: 'claim',
				},
			],
		},
	];

	try {
		client.chat.postMessage({
			blocks: blocks,
			channel: channel,
		});
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
	res.sendStatus(200);
});

module.exports = router;
