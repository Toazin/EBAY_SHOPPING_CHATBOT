var weather = require('./weatherAPI');
var location = require('./location.js');
var argv = require('yargs')
    .option('location', {
        alias: 'l',
        demand: false,
        describe: 'Location to fetch weather for',
        type: 'string'
    })
    .help('help')
    .argv;
/*
weather(function (currentWeather) {
    console.log(currentWeather);
});

location(function (location) {
    console.log('city: ' + location.city);
    console.log('log/lat: ' + location.loc);
})
*/

if (typeof argv.l === 'string' && argv.l.length > 0) {
    weather(argv.l, function (currentWeather) {
        console.log(currentWeather);
    });
} else {
    console.log("No location provided. Guessing...");
    location(function (location) {
        if (location) {
            weather(location.city, function (currentWeather) {
                console.log(currentWeather);
            });
        } else {
            console.log("Unable to guess the location");
        }
    })
}