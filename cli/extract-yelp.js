const inquirer = require('inquirer');
const yelp= require('../lib/yelp');

var questions = [
    {
        type: 'input',
        name: 'url',
        message: 'URL',
        default: "https://www.yelp.com/biz/shandong-restaurant-oakland",
    }
];

inquirer
.prompt(questions)
.then(answers => {

    yelp.extract(answers.url).then(function(address) {
        console.log(address);
    });

});