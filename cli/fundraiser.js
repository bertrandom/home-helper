const moment = require('moment');
const inquirer = require('inquirer');
const ora = require('ora');
const gofundme = require('../lib/gofundme');

var questions = [
    {
        type: 'input',
        name: 'name',
        message: 'Campaign Name',
        default: "Test " + moment().unix(),
    },
    {
        type: 'input',
        name: 'description',
        message: 'Description',
        default: "Letterpress street art vexillologist echo park non aliquip cold-pressed ullamco aesthetic authentic.",
    },
    {
        type: 'input',
        name: 'goal',
        message: 'How much $$?',
        default: 100,
    }
];

inquirer
.prompt(questions)
.then(answers => {

    gofundme.create(answers.name, answers.goal, answers.description).then(function(url) {
        console.log(url);
    });

});
