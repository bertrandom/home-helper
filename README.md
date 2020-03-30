# home-helper

A community of helpers ready to arrange payment and delivery of essential items to those who need it most.

[Entry for COVID-19 Global Hackathon](https://covid-global-hackathon.devpost.com/)

## Installation

Clone the repo into a directory of your choice.

```
npm install
npm install -g knex
npm install -g pm2
```

Create a database to store requests:

```
knex migrate:latest --env dev
```

Build the React app:

```
npm run build
```

Configure the Slack app, GoFundMe credentials, and ngrok:

Copy the `config/default.json5` to `config/local.json5` and fill in your credentials.

**Slack App Configuration**

### OAuth & Permissions

Point the Redirect URL to https://{DOMAIN}/slack/oauth.

Add a permission scopes `chat:write` and `im:history`.

### Interactivity & Shortcuts

Request URL: https://domain/slack/interactions

### Event Subscriptions

Request URL: https://domain/slack/events

Subscribe to bot events: `message.im`

Install the app on a workspace, copy the Bot User OAuth Access Token to `config/local.json5`.

**GoFundMe**

Create an account at https://charitysandbox.gofundme.com/ and store the credentials in `config/local.json5`.

**ngrok**

Run ngrok pointing to port 8080 and put the subdomain in `config/local.json5`.

## Usage

The app can be run by typing:

```
node app
```

or under `pm2` which will watch for changes and restart automatically:

```
npm run pm2
```