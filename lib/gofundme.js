const rp = require('request-promise-native');
const cheerio = require('cheerio');
const moment = require('moment');
const inquirer = require('inquirer');
const ora = require('ora');
const DataURI = require('datauri').promise;
const config = require('config');

var cookieJar = rp.jar();
const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36';

function create(name, goal, description) {

    return rp({
        uri:'https://charitysandbox.gofundme.com/signin/form/o/en/account-manager/campaigns',
        headers: {
            'User-Agent': ua,
        },
        resolveWithFullResponse: true,
        jar: cookieJar,
    }).then(function(resp) {
    
        const $ = cheerio.load(resp.body);
        const nonce = $('#form_nonce_sign_up').attr('value');
    
        return rp({
            uri:'https://charitysandbox.gofundme.com/ajaxer/authenticate',
            method:'POST',
            form: {
                "user": config.gofundme.username,
                "password": config.gofundme.password,
                "now": moment().valueOf(),
                "form_nonce": nonce
            },
            headers: {
                'User-Agent': ua,
            },
            resolveWithFullResponse: true,
            jar: cookieJar
        }).then(function(resp) {
    
            return rp({
                uri: 'https://charitysandbox.gofundme.com/fundraise-and-volunteer/signup/campaign-create',
                headers: {
                    'User-Agent': ua,
                },
                resolveWithFullResponse: true,
                jar: cookieJar
            }).then(function(resp) {
    
                const $ = cheerio.load(resp.body);
                const nonce = $('#create_project_form input[name=\'form_nonce\']').attr('value');
    
                return rp({
                    uri: 'https://charitysandbox.gofundme.com/ajaxer/create_project',
                    method: 'POST',
                    form: {
                        "is_ffa": 0,
                        "fundraiser_type": "",
                        "campaign": "",
                        "name": name,
                        "username": "",
                        "goal": goal,
                        "country_code": "", 
                        "rule_set": "create_project",
                        "form_nonce": nonce,
                        "about": "<p>" + description + "</p>"
                    },
                    headers: {
                        'User-Agent': ua,
                    },
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    json: true
                }).then(function(resp) {
    
                    const fundraiserUsername = resp.body.fundraiser_username;
    
                    return rp({
                        uri: 'https://charitysandbox.gofundme.com/o/en/campaign/' + fundraiserUsername,
                        headers: {
                            'User-Agent': ua,
                        },
                        jar: cookieJar,
                    }).then(function(html) {
    
                        const $ = cheerio.load(html);
                        const teamId = $('#join-team-form input[name=\'team_id\']').attr('value');
                        const projectId = $('#join-team-form input[name=\'organizer_project_id\']').attr('value');
    
                        return DataURI(__dirname + '/../data/todd-cravens-ZPynRLKjp9I-unsplash.jpg')
                        .then(content => {

                            return rp({
                                uri: "https://charitysandbox.gofundme.com/v2/project/" + projectId + "/uploadphoto",
                                method: 'POST',
                                headers: {
                                    'User-Agent': ua,
                                    'referer': 'https://charitysandbox.gofundme.com/fundraise-and-volunteer/photoUpload/' + fundraiserUsername + '/campaignCreate?isPrimary=true&oneCampaign=true',
                                },
                                resolveWithFullResponse: true,
                                jar: cookieJar,
                                form: {
                                    base64_image: content,
                                },
                                json: true,
    
                            }).then(function(resp) {

                                return rp({
                                    uri: 'https://charitysandbox.gofundme.com/v2/team/' + teamId + '?include=beneficiary,organizer,event',
                                    method: 'PATCH',
                                    body: {
                                        published: true,
                                    },
                                    json: true,
                                    headers: {
                                        'User-Agent': ua,
                                        'authority': 'charitysandbox.gofundme.com',
                                        'origin': 'https://charitysandbox.gofundme.com',
                                        'referer': 'https://charitysandbox.gofundme.com/o/en/campaign/' + fundraiserUsername,
                                    },
                                    resolveWithFullResponse: true,
                                    jar: cookieJar
                                }).then(function(resp) {
            
                                    return rp({
                                        uri: 'https://charitysandbox.gofundme.com/o/en/campaign-preview/' + fundraiserUsername + '?__live_preview=true&modified=1',
                                        headers: {
                                            'User-Agent': ua,
                                            'authority': 'charitysandbox.gofundme.com',
                                            'origin': 'https://charitysandbox.gofundme.com',
                                            'referer': 'https://charitysandbox.gofundme.com/o/en/campaign/' + fundraiserUsername,
                                        },
                                        resolveWithFullResponse: true,
                                        jar: cookieJar
                                    }).then(function(resp) {
                                        return 'https://charitysandbox.gofundme.com/o/en/campaign/' + fundraiserUsername;
                                    });
            
                                });

                            });

                        })
                        .catch(err => { throw err; });
    
                    });
    
                });
    
            });
    
        })
    
    });

}

module.exports = {
    create: create
}