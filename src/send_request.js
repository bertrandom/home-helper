export default function sendRequest(requestData) {
	// API request here to store date and send it over to Slack
	const SLACK_ACCESS_TOKEN = 'xoxb-678573163620-1032265700039-gyEhl8juWexypPlK10CQO2LK';
	const CHANNEL = 'C010VMXR91A';

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
				},
			],
		},
	];

	const request = `https://slack.com/api/chat.postMessage?token=${SLACK_ACCESS_TOKEN}&channel=${CHANNEL}&blocks=${encodeURIComponent(
		JSON.stringify(blocks)
	)}`;

	return fetch(request);
}
