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

slackInteractions.action({actionId: 'claim'}, (payload, respond) => {

    const { message, container, user } = payload;
    const subjectTextBlock = message.blocks[0] && message.blocks[0].text;
    const subject = subjectTextBlock ? subjectTextBlock.text.replace(aRequestHasBeenReceived, 'a request from ') : 'a new request.';
    const requesterName = subjectTextBlock.text.match(/ by (.*) in /)[1];
    const requestTextBlock = message.blocks[2] && message.blocks[2].text ? message.blocks[2].text.text : '-';
    const addressTextBlock = message.blocks[5] && message.blocks[5].elements[0] ? message.blocks[5].elements[0].text : '-';
    const whenTextBlock = message.blocks[4] && message.blocks[4].elements[0] ? message.blocks[4].elements[0].text : '-';
    const contactTextBlock = message.blocks[3] && message.blocks[3].text ? message.blocks[3].text.text : '-';

    const claimedMessage = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*${user.name}* claimed ${subject} 👏👏👏`
            }
        }
    ];
    
    const thankYouMessage = [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: `Thanks for claiming ${requesterName}'s request`,
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
                text: addressTextBlock
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
                type: "plain_text",
                text: contactTextBlock,
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
                text: "Details still needed: Vendor and Total Cost."
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Add details",
                    emoji: true
                },
                value: "add-details",
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

slackInteractions.action({actionId: 'add-details'}, (payload, respond) => {

    const { message, channel } = payload;

    const detailsModalView = {
        type: "modal",
        title: {
            type: "plain_text",
            text: "Enter request details",
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
                element: {
                    type: "plain_text_input"
                },
                label: {
                    type: "plain_text",
                    text: "URL for vendor on Yelp, Google Places, or Foursquare",
                    emoji: true
                }
            },
            {
                type: "input",
                element: {
                    type: "plain_text_input"
                },
                label: {
                    type: "plain_text",
                    text: "Total cost with delivery",
                    emoji: true
                }
            },
            {
                type: "section",
                text: {
                    type: "plain_text",
                    text: "Please review these details. After submission a GoFundMe campaign will be created on behalf of Samantha Slackington. Thank you for your help.",
                    emoji: true
                }
            }
        ],
        callback_id: "details-modal",
        private_metadata: { message, channel }
    };

    client.views.open({
        trigger_id: payload.trigger_id,
        title: "Enter order details",
        view: detailsModalView,
    });

});

slackInteractions.viewSubmission("details-modal", (payload, respond) => {
    const { view } = payload;

    const doneMessage = [
        {
            type: "section",
            text: {
                type: "plain_text",
                text: `✅ You are done. Your help is appreciated.`,
                emoji: true
            }
        }
    ];

    const { channel, message } = JSON.parse(view.private_metadata);

    client.chat.update({
        channel: channel.id,
        ts: message.ts,
        blocks: doneMessage
    });
});

slackEvents.on('error', console.error);

module.exports = router;