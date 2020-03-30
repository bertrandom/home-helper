const path = require('path');
const config = require('config');
const { aRequestHasBeenReceived } = require('../constants');

const { WebClient } = require('@slack/web-api');

const Knex = require('knex');
const knexConfig = require('../knexfile');

const { Model } = require('objection');
const { Request } = require('../models/Request');

var environment = process.env.NODE_ENV || 'dev';

const knex = Knex(knexConfig[environment]);

Model.knex(knex);

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

	console.log('Form Submission', requestData);

	await Request.query().insert({
		first_name: requestData.firstName,
		last_name: requestData.last_name,
		email: requestData.email,
		phone_number: requestData.phoneNumber,
		street_address: requestData.address,
		city: requestData.city,
		state: requestData.state,
		zipcode: requestData.zipcode,
		// requestData.selectedData 
		preferred_time_of_day: requestData.preferredTime,
		request_text: requestData.request,
		request_state: 'submitted'
	});

	let contactInformation;
	if (requestData.email && !requestData.phoneNumber) {
		contactInformation = `You can email me at: *${requestData.email}*`;
	} else if (requestData.phoneNumber && !requestData.email) {
		contactInformation = `You can call me at: *${requestData.phoneNumber}*`;
	} else if (requestData.email && requestData.phoneNumber) {
		contactInformation = `You can contact me at either: *${requestData.email}* or *${requestData.phoneNumber}*`;
	}

	const blocks = [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `${aRequestHasBeenReceived}${requestData.firstName} ${requestData.lastName} in ${requestData.city}, ${requestData.state}`,
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
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `In the ${requestData.preferredTime}. Preferably on ${requestData.selectedDate}`,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*My address is:*',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `${requestData.address}, ${requestData.city}, ${requestData.state} ${requestData.zipcode}`,
			}
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
					action_id: 'claim',
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

router.get('/fulfillment', async (req, res) => {
	const client = new WebClient(config.slack.bot_access_token);
	const channel = config.slack.fulfillment_channel;
	const requestData = JSON.parse(req.query['requestData']);
	const {
		vendorUrl,
		totalCost,
		nameTextBlock,
		requestTextBlock,
		addressTextBlock,
		whenTextBlock,
		contactTextBlock
	} = requestData;

	const blocks = [
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: `Request is ready for fullfillment`,
				emoji: true,
			},
        },
        {
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `Request from ${nameTextBlock}`,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*Request*',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: requestTextBlock,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*Address*',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: addressTextBlock,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*When*',
			},
		},
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: whenTextBlock,
				emoji: true,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*Contact*',
			},
		},
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: contactTextBlock,
				emoji: true,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*Supplier*',
			},
		},
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: `${vendorUrl}`,
				emoji: true,
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*How much*',
			},
		},
		{
			type: 'section',
			text: {
				type: 'plain_text',
				text: `${totalCost}`,
				emoji: true,
			},
		},
		{
			type: 'actions',
			elements: [
				{
					type: 'button',
					text: {
						type: 'plain_text',
						text: 'Mark as fulfilled',
						emoji: true,
					},
					value: 'fulfill',
					action_id: 'fulfill',
				},
			],
		},
	];

	try {
		client.chat.postMessage({ blocks, channel });
	} catch (error) {
		console.log(error);
		res.sendStatus(500);
	}
	res.sendStatus(200);
});

module.exports = router;
