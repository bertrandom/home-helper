const config = require('config');

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

    const claimedMessage = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Eric Gelinas* claimed a request from Samantha Slackington in Oakland, Ca 👏👏👏"
            }
        }
    ];
    
    const thankYouMessage = [
        {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": "Thanks for claiming Samantha Slackington's request",
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Request*"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Hello, please send me some groceries. I need: coffee, onions, gravy, strawberries, sandwiches, masking tape, drain cleaner, a bundle of thyme, and fruit leather."
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Address*"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "<https://duckduckgo.com/?q=125+14th+St%2C+Oakland%2C+CA+94612&ia=web&iaxm=maps|125 14th St Oakland, CA 94612>"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*When*"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": "In the morning. Preferably on Monday",
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "This request details: Vendor and Total Cost."
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Add details",
                    "emoji": true
                },
                "value": "add-details",
                "action_id": "add-details"
            }
        }
    ];
    
    console.log('payload', payload);

    client.chat.update({
        channel: payload.container.channel_id,
        ts: payload.container.message_ts,
        blocks: claimedMessage
    });

    client.chat.postMessage({
        channel: payload.user.id,
        blocks: thankYouMessage
    });

});

slackInteractions.action({actionId: 'add-details'}, (payload, respond) => {

    const detailsModalBlocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Request from Samantha Slackington:"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Hello, please send me some groceries. I need: coffee, onions, gravy, strawberries, sandwiches, masking tape, drain cleaner, a bundle of thyme, and fruit leather."
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "<https://duckduckgo.com/?q=125+14th+St%2C+Oakland%2C+CA+94612&ia=web&iaxm=maps|125 14th St Oakland, CA 94612>"
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
            "type": "divider"
        },
        {
            "type": "input",
            "element": {
                "type": "plain_text_input"
            },
            "label": {
                "type": "plain_text",
                "text": "URL for vendor on Yelp, Google Places, or Foursquare",
                "emoji": true
            }
        },
        {
            "type": "input",
            "element": {
                "type": "plain_text_input"
            },
            "label": {
                "type": "plain_text",
                "text": "Total cost with shipping",
                "emoji": true
            }
        },
        {
            "type": "section",
            "text": {
                "type": "plain_text",
                "text": "Please review these details. After submition a GoFundMe campaign will be created on behalf of Samantha Slackington. Thank you for your help.",
                "emoji": true
            }
        }
    ];
    
    const detailsModalView = {
        "type": "modal",
        "title": {
            "type": "plain_text",
            "text": "Enter request details",
            "emoji": true
        },
        "submit": {
            "type": "plain_text",
            "text": "Submit",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Request from Samantha Slackington:"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Hello, please send me some groceries. I need: coffee, onions, gravy, strawberries, sandwiches, masking tape, drain cleaner, a bundle of thyme, and fruit leather."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "<https://duckduckgo.com/?q=125+14th+St%2C+Oakland%2C+CA+94612&ia=web&iaxm=maps|125 14th St Oakland, CA 94612>"
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
                "type": "divider"
            },
            {
                "type": "input",
                "element": {
                    "type": "plain_text_input"
                },
                "label": {
                    "type": "plain_text",
                    "text": "URL for vendor on Yelp, Google Places, or Foursquare",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "element": {
                    "type": "plain_text_input"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Total cost with shipping",
                    "emoji": true
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Please review these details. After submition a GoFundMe campaign will be created on behalf of Samantha Slackington. Thank you for your help.",
                    "emoji": true
                }
            }
        ]
    };

    console.log(payload);

    // Not working just yet :(

    client.views.open({
        trigger_id: payload.trigger_id,
        title: "Hello, world!",
        view: detailsModalView
    });

});

slackEvents.on('error', console.error);

module.exports = router;