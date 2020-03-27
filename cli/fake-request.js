const config = require('config');

const { WebClient } = require('@slack/web-api');
const client = new WebClient(config.slack.bot_access_token);

const channel = config.slack.channel;

const blocks = [
	{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "A request has been recieved by a Samantha Slackington in Oakland, Ca"
		}
	},
	{
		"type": "divider"
	},
	{
		"type": "section",
		"text": {
			"type": "plain_text",
			"text": "Hello, please send me some groceries. I need: coffee, onions, gravy, strawberries, sandwiches, masking tape, drain cleaner, a bundle of thyme, and fruit leather.",
			"emoji": true
		}
	},
	{
		"type": "context",
		"elements": [
			{
				"type": "mrkdwn",
				"text": "In the morning. Preferably on Monday"
			}
		]
	},
	{
		"type": "actions",
		"elements": [
			{
				"type": "button",
				"text": {
					"type": "plain_text",
					"text": "Claim this request",
					"emoji": true
				},
                "value": "claim",
                "action_id": "claim",
			}
		]
	}
];

client.chat.postMessage({
    blocks: blocks,
    channel: channel
});