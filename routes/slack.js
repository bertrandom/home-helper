const config = require('config');

const Router = require('express-promise-router');
const router = new Router();

const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(config.slack.signing_secret);

const { WebClient } = require('@slack/client');
const client = new WebClient();

router.use('/events', slackEvents.expressMiddleware());

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
    console.log(event);
});

slackEvents.on('error', console.error);

module.exports = router;