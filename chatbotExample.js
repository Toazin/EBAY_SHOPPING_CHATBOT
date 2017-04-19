//import {Bot, Elements} from 'facebook-messenger-bot';
require('dotenv').config();
const {
    Bot, Elements, Buttons, QuickReplies
} = require("facebook-messenger-bot");
//var FBMessenger = require('fb-messenger');
const messenger = new FBMessenger(process.env.PAGE_ACCESS_TOKEN);
const express = require("express");
const weather = require('./js/weatherAPI');
const ebay = require('ebay-api');

var params = {
  // add additional fields
  //outputSelector: ['AspectHistogram'],

  paginationInput: {
    entriesPerPage: 10
  },

  itemFilter: [
    {name: 'FreeShippingOnly', value: true}
  ],
    /*
  domainFilter: [
    {name: 'domainName', value: 'Digital_Cameras'}
  ]
    */
};

const bot = new Bot(process.env.PAGE_ACCESS_TOKEN, process.env.VERIFICATION);

bot.on('message', async message => {
    //console.log(message);
    const {
        sender
    } = message; //object destructor
    

    /*
    await weather(message.text, function (currentWeather) {
                console.log(currentWeather);
            });
    */

    await sender.fetch(`first_name,last_name,profile_pic`, true);
    console.log(`Received a message from ${sender.first_name} with id: ${sender.id}`);
    const {
        text, images, videos, location, audio
    } = message;
    
    //Wit ai process identify

    if (text) {
        console.log(text); // 'hey'
        //Metodo(texto) --> regresa out (Ya con boton, texto e imagenes.)
        params.keywords = text.split(" ");
        //Text
        let out = new Elements();
        out.add({
            text: `hey ${sender.first_name}, how are you!`
        });
        await bot.send(sender.id, out);
        ebay.xmlRequest({
                serviceName: 'Finding',
                opType: 'findItemsByKeywords',
                appId: process.env.EBAYAPPID, // FILL IN YOUR OWN APP KEY, GET ONE HERE: https://publisher.ebaypartnernetwork.com/PublisherToolsAPI
                params: params,
                parser: ebay.parseResponseJson // (default)
            },
            // gets all the items together in a merged array
            function itemsCallback(error, itemsResponse) {
                if (error) throw error;

                var items = itemsResponse.searchResult.item;

                console.log('Found', items.length, 'items');
                out = new Elements();
                for (var i = 0; i < items.length; i++) {
                    
                    buttons = new Buttons();
                    buttons.add({
                        text: 'Ebay',
                        url: items[i].viewItemURL
                    });
                    out.add({
                        image: items[i].galleryURL,
                        text: items[i].title,
                        buttons
                    });    
                    console.log('- ' + items[i].title);
                    
                    //console.log(JSON.stringify(items[i],null,2));
                }
            bot.send(sender.id, out);
            }
        );
    }

    if (images) {
        console.log(images); // ['http://...', 'http://...']
        //await messenger.sendImageMessage(sender.id, images);
    }

    if (videos) {
        console.log(videos); // ['http://...', 'http://...']
    }

    if (location) {
        console.log(location); // {title, long, lat, url}
    }

    if (audio) {
        console.log(audio); // url
    }



    //await Bot.wait(1000);
/*
    out = new Elements();
    out.add({
        image: sender.profile_pic
    });
    await bot.send(sender.id, out);

    //await Bot.wait(1000);

    let buttons = new Buttons();
    buttons.add({
        text: 'Google',
        url: 'http://google.com'
    });
    buttons.add({
        text: 'Yahoo',
        url: 'http://yahoo.com'
    });
    buttons.add({
        text: 'Bing',
        url: 'http://bing.com'
    });
    out = new Elements();
    out.add({
        text: 'search engines',
        subtext: 'click to get redirected',
        buttons
    }); // add a card
    await bot.send(sender.id, out);

    buttons = new Buttons();
    buttons.add({
        text: 'Call us',
        phone: '3315397492'
    });
    buttons.add({
        share: true
    });
    out = new Elements();
    out.add({
        text: 'ABC Flower shop',
        subtext: 'Office hours 10am - 6pm',
        buttons
    }); // add a card
    await bot.send(sender.id, out);

    out = new Elements();
    out.setListStyle('compact'); // or 'large'
    out.add({
        text: 'Item 1',
        subtext: 'Subtitle'
    }); // add list item
    out.add({
        text: 'Item 2',
        subtext: 'Subtitle'
    }); // add list item
    await bot.send(sender.id, out);

    buttons = new Buttons();
    buttons.add({
        text: 'Google',
        url: 'http://google.com'
    });
    buttons.add({
        text: 'Yahoo',
        url: 'http://yahoo.com'
    });
    out = new Elements();
    out.add({
        image: 'http://google.com/logo.png',
        text: 'hey',
        buttons
    }); // first card
    out.add({
        image: 'http://yahoo.com/logo.png',
        text: 'hey',
        buttons
    }); // second card
    await bot.send(sender.id, out);

    let replies = new QuickReplies();
    replies.add({
        text: 'location',
        isLocation: true
    });
    out = new Elements();
    out.add({
        text: 'Send us your location'
    });
    out.setQuickReplies(replies);
    await bot.send(sender.id, out);

    //await messenger.sendTextMessage(sender.id, message.text);
    //await messenger.sendHScrollMessage(sender.id, elems);
    //await messenger.sendButtonsMessage(sender.id, message.text,  buttons);
    //await messenger.sendImageMessage(sender.id, "https://pbs.twimg.com/profile_images/789099010749505537/vNRHXVoY_400x400.jpg");





    //await messenger.sendImageMessage(sender.id, sender.profile_pic);
    */
});


const app = express();
app.use('/facebook', bot.router());

app.listen(3000);
console.log("Listo bro");