const config = require('config');
const { aRequestHasBeenReceived } = require('../constants');

const { WebClient } = require('@slack/web-api');
const client = new WebClient(config.slack.bot_access_token);

const channel = config.slack.channel;

const requestData = {
	firstname: 'Samantha',
	lastname: 'Slackington',
	email: 'info@slack.com',
	phonenumber: '(818) 555-1212',
	address: '125 14th St',
	city: 'Oakland',
	zipcode: 94602,
	state: 'Ca',
	selectedDate: 'March 20th, 2020',
	preferredTime: 'Morning',
	request: 'Hello, please send me some groceries. I need: coffee, onions, gravy, strawberries, sandwiches, masking tape, drain cleaner, a bundle of thyme, and fruit leather.',
};

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
			text: `${aRequestHasBeenReceived}${requestData.firstname} ${requestData.lastname} in ${requestData.city}, ${requestData.state}`,
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
		type: 'context',
		elements: [
			{
				type: 'mrkdwn',
				text: `${requestData.address}, ${requestData.city}, ${requestData.state} ${requestData.zipcode}`,
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
				action_id: 'claim',
			},
		],
	},
];

client.chat.postMessage({
    blocks: blocks,
    channel: channel
}).catch(console.error);