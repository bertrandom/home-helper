const rp = require('request-promise-native');
const cheerio = require('cheerio');
const config = require('config');

function extract(url) {

    return rp({
        uri:url,
        resolveWithFullResponse: true,
    }).then(function(resp) {

        const $ = cheerio.load(resp.body);

        let script = $('script[type=\'application/ld+json\']').last().html();
        let data = (JSON.parse(script)).address;

        return data.streetAddress.replace("\n", ", ") + ", " + data.addressLocality + ", " + data.addressRegion + " " + data.postalCode;

    });

}

module.exports = {
    extract: extract
}