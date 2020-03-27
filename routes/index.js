const home = require('./home');
const slack = require('./slack');

module.exports = (app) => {
    app.use('/', home);
    app.use('/slack', slack);
};