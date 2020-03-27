const path = require('path');

const Router = require('express-promise-router');
const router = new Router();

router.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

router.get('/install', async (req, res) => {
    res.render('install');
});

module.exports = router;