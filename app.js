const path = require('path');
const config = require('config');
const express = require('express');
const exphbs = require('express-handlebars');

const mountRoutes = require('./routes');

const app = express();

app.engine('hb', exphbs({
	defaultLayout: 'main',
	extname: 'hb'
}));

app.set('view engine', 'hb');
app.enable('view cache');

app.use(express.static('static'));
app.use(express.static(path.join(__dirname, 'build')));

app.locals.config = config;

mountRoutes(app);

app.use(function (err, req, res, next) {
	console.error(err);
	res.status(500);
	next();
});

app.listen(config.port, () => {
	console.log(`Server started on port ${config.port}.`);
});