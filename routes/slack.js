const config = require('config');
const { aRequestHasBeenReceived } = require('../constants');

const Router = require('express-promise-router');
const router = new Router();

const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(config.slack.signing_secret);

const { createMessageAdapter } = require('@slack/interactive-messages');
const slackInteractions = createMessageAdapter(config.slack.signing_secret);

const { WebClient } = require('@slack/web-api');
const client = new WebClient(config.slack.bot_access_token);

const Knex = require('knex');
const knexConfig = require('../knexfile');

const { Model } = require('objection');
const { Request } = require('../models/Request');

var environment = process.env.NODE_ENV || 'dev';

const knex = Knex(knexConfig[environment]);

const gofundme = require('../lib/gofundme');

Model.knex(knex);

router.use('/events', slackEvents.expressMiddleware());
router.use('/interactions', slackInteractions.expressMiddleware());

router.get('/oauth', async (req, res) => {

    return client.oauth.access({
        client_id: config.slack.client_id,
        client_secret: config.slack.client_secret,
        code: req.query.code,
    }).then((results) => {

        console.log(results);
        res.redirect(`https://slack.com/app_redirect?app=${config.slack.app_id}&team=${results.team_id}`);

    });

});

slackEvents.on('message', (event) => {
    console.log('event', event);
});

slackInteractions.action({actionId: 'claim'}, async (payload, respond) => {

    var requestId = payload.actions[0].value;

    const request = await Request.query().findById(requestId);

    const { message, container, user } = payload;
    const subjectTextBlock = message.blocks[0] && message.blocks[0].text;
    const requestTextBlock = message.blocks[2] && message.blocks[2].text ? message.blocks[2].text.text : '-';
    const addressTextBlock = message.blocks[5] && message.blocks[5].elements[0] ? message.blocks[5].elements[0].text : '-';
    const whenTextBlock = message.blocks[4] && message.blocks[4].elements[0] ? message.blocks[4].elements[0].text : '-';
    const contactTextBlock = request.contactInfo();

    const claimedMessage = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*${user.name}* claimed a request from ${request.first_name} ${request.last_name} in ${request.city}, ${request.state} 👏👏👏`
            }
        }
    ];

    const thankYouMessage = [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: `Thanks for claiming ${request.first_name} ${request.last_name}'s request!`,
                emoji: true
            }
        },
        {
            type: "divider"
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*Request*"
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: requestTextBlock
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*Address*"
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `<https://duckduckgo.com/?q=${addressTextBlock}&t=hy&ia=maps&iaxm=maps|${addressTextBlock}>`
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*When*"
            }
        },
        {
            type: "section",
            text: {
                type: "plain_text",
                text: whenTextBlock,
                emoji: true
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*Contact*"
            }
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: contactTextBlock
            }
        },
        {
            type: "divider"
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "Please find a vendor and get an invoice for the cost of this request."
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Add vendor",
                    emoji: true
                },
                value: request.id.toString(),
                action_id: "add-details"
            }
        }
    ];

    client.chat.update({
        channel: container.channel_id,
        ts: container.message_ts,
        blocks: claimedMessage
    });

    client.chat.postMessage({
        channel: user.id,
        blocks: thankYouMessage
    }).catch(console.error);

});

slackInteractions.action({actionId: 'add-details'}, async (payload, respond) => {

    var requestId = payload.actions[0].value;

    const request = await Request.query().findById(requestId);

    const { message, channel } = payload;

    const detailsModalView = {
        type: "modal",
        title: {
            type: "plain_text",
            text: "Enter vendor information",
            emoji: true
        },
        submit: {
            type: "plain_text",
            text: "Submit",
            emoji: true,
        },
        close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true
        },
        blocks: [
            {
                type: "input",
                block_id: "vendor_url",
                element: {
                    type: "plain_text_input",
                    action_id: "vendor_url_value",
                    placeholder: {
                        type: "plain_text",
                        text: "https://www.yelp.com/biz/vendor-name"
                    }
                },
                label: {
                    type: "plain_text",
                    text: "URL for vendor on Yelp, Google Places, or Foursquare",
                    emoji: true
                }
            },
            {
                type: "input",
                block_id: "invoice_url",
                element: {
                    type: "plain_text_input",
                    action_id: "invoice_url_value",
                    placeholder: {
                        type: "plain_text",
                        text: "https://squareup.com/pay-invoice/test-invoice/a1b2c3_defg/"
                    }
                },
                label: {
                    type: "plain_text",
                    text: "URL for invoice",
                    emoji: true
                }
            },
            {
                type: "input",
                block_id: "total_cost",
                element: {
                    type: "plain_text_input",
                    action_id: "total_cost_value",
                    placeholder: {
                        type: "plain_text",
                        text: "25"
                    }
                },
                label: {
                    type: "plain_text",
                    text: "Total cost excluding delivery fees",
                    emoji: true
                }
            },
            {
                type: "section",
                text: {
                    type: "plain_text",
                    text: `Please review these details. After submission, a GoFundMe campaign will be created on behalf of ${request.first_name}. Thank you for your help.`,
                    emoji: true
                }
            }
        ],
        callback_id: "details-modal",
        private_metadata: JSON.stringify({ message, channel, requestId })
    };

    client.views.open({
        trigger_id: payload.trigger_id,
        view: detailsModalView,
    });

});

slackInteractions.viewSubmission("details-modal", async (payload, respond) => {
    const { view } = payload;
    const { channel, message, requestId } = JSON.parse(view.private_metadata);

    const request = await Request.query().findById(requestId);

    // Beware the house of cards that lies beyond...
    const vendorUrl = view.state.values.vendor_url.vendor_url_value.value;
    const totalCost = view.state.values.total_cost.total_cost_value.value;
    const invoiceUrl = view.state.values.invoice_url.invoice_url_value.value;

    const requestTextBlock = message.blocks[3].text.text;
    const addressTextBlock = message.blocks[5].text.text;
    const whenTextBlock = message.blocks[7].text.text;
    const contactTextBlock = request.contactInfo();

    // submit to gofund me w/ data pulled from the message above about the request
    // gofund me calls /fulfillment which creates a fulfillment request

    /** Stubbing out fulfillment request */
    const fulfillmentChannel = config.slack.fulfillment_channel;
    const fulfillmentBlocks = [
        {
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `A request from ${request.first_name} ${request.last_name}  is ready for fullfillment`,
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
				text: '*Their address*',
			},
		},
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `<https://duckduckgo.com/?q=${addressTextBlock}&t=hy&ia=maps&iaxm=maps|${addressTextBlock}>`,
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
				type: 'mrkdwn',
				text: contactTextBlock
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

    client.chat.postMessage({
        blocks: fulfillmentBlocks,
        channel: fulfillmentChannel
    });

    const doneMessage = [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: `✅ You are done. Your help is appreciated.`,
                emoji: true
            },
        }
    ];

    /** end stub */

    client.chat.update({
        channel: channel.id,
        ts: message.ts,
        blocks: doneMessage
    });

    gofundme.create("Help " + request.first_name + " at Home", totalCost, request.request_text).then(function(url) {

        const doneUpdateMessage = [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "✅ You are done. Your help is appreciated.",
                    "emoji": true
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Gofundme",
                        "emoji": true
                    },
                    "url": url
                }
            }
        ];   

        /** end stub */
    
        client.chat.update({
            channel: channel.id,
            ts: message.ts,
            blocks: doneUpdateMessage
        });

    });

});

slackInteractions.action({actionId: 'fulfill'}, (payload, respond) => {

    console.log('fulfill interaction', payload);

    const { message, container } = payload;
    const nameTextBlock = message.blocks[0].text.text.match(/A request from (.*) is ready for fullfillment/)[1];

    const fulfilledMessage = [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: `:white_check_mark: Request from ${nameTextBlock} fulfilled!`,
                emoji: true
            }
        }
    ];

    client.chat.update({
        channel: container.channel_id,
        ts: container.message_ts,
        blocks: fulfilledMessage
    });

});

slackEvents.on('error', console.error);

module.exports = router;