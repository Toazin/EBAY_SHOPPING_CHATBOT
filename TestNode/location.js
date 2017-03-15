var request = require('request');
var url = 'http://ipinfo.io';


module.exports = function (callback) {
    request({
        url: url,
        json: true
    }, function (err, res, body) {
        if (err) {
            callback("unable to location");
        } else {
            //console.log(JSON.stringify(body,null,4));
            //console.log("The temp in " + body.name + " is " + body.main.temp);
            callback(body);
        }
    });
    //console.log("Got weather!");
}