var request = require('request');


module.exports = function (location, callback) {
    if(!location){
        return callback("No location provided");
    }
        
    var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(location) + '&appid=868c2b2cd22614f55f3977972b9b3df7';
    //console.log("Searching location in: " + url)
;    request({
        url: url,
        json: true
    }, function (err, res, body) {
        if (err) {
            callback("unable to fetch weather");
        } else {
            //console.log(JSON.stringify(body,null,4));
            //console.log("The temp in " + body.name + " is " + body.main.temp);
            callback("The temp in " + body.name + " is " + body.main.temp)
        }
    });
    //console.log("Got weather!");
}