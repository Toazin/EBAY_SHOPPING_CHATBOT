require('dotenv').config();
require('./userData.js');
require('./responses.js');
var moment = require('moment');

const {
    Bot, Elements, Buttons, QuickReplies
} = require("facebook-messenger-bot");
const express = require("express");
const weather = require('./js/weatherAPI');
const ebay = require('ebay-api');
const Resp = new Responses;
const itemFilter = ["AuthorizedSellerOnly",
        "AvailableTo",
        "BestOfferOnly",
        "Currency",
        "FeaturedOnly",
        "FreeShippingOnly",
        "GetItFastOnly",
        "LocatedIn",
        "MaxPrice",
        "MinPrice",
        "OutletSellerOnly",
        "TopRatedSellerOnly"];

var users = {};
// var params = {
//   // add additional fields
//   //outputSelector: ['AspectHistogram'] //Bring data to the responses
//
//   paginationInput: {
//     entriesPerPage: 10 //Quantity
//   },
//
//   itemFilter: [
//     {name: 'FreeShippingOnly', value: true}
//   ],
//     /*
//   domainFilter: [
//     {name: 'domainName', value: 'Digital_Cameras'}
//   ]
//     */
// };

const bot = new Bot(process.env.PAGE_ACCESS_TOKEN, process.env.VERIFICATION);

bot.on('postback', async (event, message, data) => {
    if(!message) return;
    if(!data) return;
    let out;
    let replies;
    let user = users[message.sender.id];
    console.log("message: ", message);
    console.log("data: ", data);
    //Check for change criteria
    if(data == "1" || data == "2" || data == "5" || data == "10"){
      user.queryOptions.paginationInput.entriesPerPage = data;
      return
    }
    if(event){
      if(event == "addFilter"){
        user.queryOptions.itemFilter.push({name:data, value:true});
        console.log("Agreuge: ", user.queryOptions.itemFilter);
      }else if(event == "removeFilter"){
        //REMOVER! D:
      }

      return
    }
    function addFilter(){

    }
    switch (data) {
      case "Quantity":
      console.log("Quantity Entre");
        msg = "How many items per query?";
        out = new Elements();
        replies = new QuickReplies();
        replies.add({text: '1', data:'1', isLocation:false});
        replies.add({text: '2', data:'2', isLocation:false});
        replies.add({text: '5', data:'5', isLocation:false});
        replies.add({text: '10', data:'10', isLocation:false});
        out.add({text: msg});
        out.setQuickReplies(replies);
        await bot.send(message.sender.id, out);
        break;
      case "Avanced Fiters":
        var mySelection = "";
        var userItemFilter = user.getFilters();
        for (var i = 0; i < userItemFilter.length; i++) {
          mySelection = mySelection + " - " + userItemFilter[i].name;
        }

        msg = "Add or Remove from your Selection: " + mySelection;
        out = new Elements();
        replies = new QuickReplies();
        replies.add({text: 'Add Filter', data:'Add Filter', isLocation:false});
        replies.add({text: 'Remove Filter', data:'Remove Filter', isLocation:false});
        out.add({text: msg});
        out.setQuickReplies(replies);
        await bot.send(message.sender.id, out);
      break;
      case "Add Filter":
        var userItemFilter = user.getFilters();
        msg = "What parameter you want to add?";
        out = new Elements();
        replies = new QuickReplies();
        for (var i = 0; i < itemFilter.length; i++) {
          if(!userItemFilter.find(x=> x.name == itemFilter[i])){
            replies.add({text: itemFilter[i], data:itemFilter[i],event:"addFilter", isLocation:false});
          }
        }
        console.log(replies);
        out.add({text: msg});
        out.setQuickReplies(replies);
        await bot.send(message.sender.id, out);

      break;
      case "Remove Filter":
      var userItemFilter = user.getFilters();
      msg = "What parameter you want to Remove?";
      out = new Elements();
      replies = new QuickReplies();
      for (var i = 0; i < userItemFilter.length; i++) {
          replies.add({text: userItemFilter[i].name, data:userItemFilter[i].name,event:"removeFilter", isLocation:false});
      }
      console.log(replies);
      out.add({text: msg});
      out.setQuickReplies(replies);
      await bot.send(message.sender.id, out);
      break;
    }
});

function itemFilterContains(attr)
{


}

bot.on('message', async message => {
    const {
        sender
    } = message; //object destructor
    await sender.fetch(`first_name,last_name,profile_pic`,true);//profile_pic`, true);

    //Check User:
    if(users[sender.id] == undefined){
        users[sender.id] = new User(sender.id,sender.first_name);
    }else{
        users[sender.id].notNew();
    }
    let user = users[sender.id];
    console.log("user: ", user);
    console.log(`Received a message from ${sender.first_name} with id: ${sender.id}`);
    const {
        text, images, videos, location, audio
    } = message;

    //Wit ai process identify
    //testout = new Elements();

    if (text) {



      var intent = 1;
      let out = new Elements();
      let msg;
      switch (text) {
        case "greeting":
          let difTime = moment.utc(moment(moment(new Date),"DD/MM/YYYY HH:mm:ss").diff(moment(user.getLastLogin(),"DD/MM/YYYY HH:mm:ss"))).format("m");
          if(user.isNew()){
            msg = `Hi ${sender.first_name}, how are you!, I'm your personal assistant for buying in eBay! how about that! cool isn't it?. Look you can write whatever you want and i'll search it on eBay for you.`;
          }else{
            if(difTime > 60){
              msg = `Hi Again! ${sender.first_name}, what can in what i can help you with.`;
            }else{
              msg = Resp.getGreeting();
            }
          }
          out.add({text: msg});
          await bot.send(sender.id, out);

          break;
        case "change parameters":
          out = new Elements();
          replies = new QuickReplies();
          replies.add({text: 'Quantity', data:'Quantity', isLocation:false});
          replies.add({text: 'Advanced Fiters', data:'Avanced Fiters', isLocation:false});
          out.add({text: 'Which parameter you want to change?'});
          out.setQuickReplies(replies);
          await bot.send(sender.id, out);
          break;
        case "execute query":
          let product = "Camara Sony";
          user.addQuery(product);
          user.queryOptions.keywords = product.split(" ");
          let qty = user.queryOptions.paginationInput.entriesPerPage;
          let itemFilter = "";
          for (var i = 0; i < user.queryOptions.itemFilter.length; i++) {
            itemFilter = itemFilter + " - " +  user.queryOptions.itemFilter[i].name;
          }
          msg = `I'm going to search ${qty} items for the product: ${product} with this special filters: ${itemFilter}`;
          out.add({text: msg});
          await bot.send(sender.id, out);
          //console.log("Params: ", params);
          console.log("Query Options: ", user.queryOptions);
          //EBAY
          ebay.xmlRequest({
              serviceName: 'Finding',
              opType: 'findItemsByKeywords',
              appId: process.env.EBAYAPPID,
              params: user.queryOptions,
              parser: ebay.parseResponseJson
          },
          function itemsCallback(error, itemsResponse) {
              if (error) throw error;
              out = new Elements();
              var items = itemsResponse.searchResult.item;
              console.log("Response", itemsResponse.searchResult)
              if(!items){
                msg = "Sorry no results for your query!";
                out.add({text: msg});
                bot.send(sender.id, out);
                return;
              }
              console.log('Found', items.length, 'items');
              out = new Elements();
              for (var i = 0; i < items.length; i++) {
                  //console.log("shippingInfo: ", items[i].shippingInfo);
                  let cost = items[i].sellingStatus.convertedCurrentPrice.amount;
                  console.log("sellingStatus: ", cost);
                  if(items[i].pictureURLLarge){
                    imgUrl = items[i].pictureURLLarge;
                  }else{
                    imgUrl = items[i].galleryURL;
                  }
                  buttons = new Buttons();
                  buttons.add({
                      text: 'See on Ebay',
                      url: items[i].viewItemURL
                  });
                  out.add({
                      image: imgUrl,
                      text: cost + "$USD - " + items[i].title,
                      buttons
                  });
                  console.log('- ' + items[i].title);
              }
              bot.send(sender.id, out);
          });
          break;
        case "bye":
          msg = Resp.getBye();
          out.add({text: msg});
          await bot.send(sender.id, out);
          break;

      }
      //Validate Last login for quick response

      //Validate text

      //


        //console.log(text); // 'hey'
        //Metodo(texto) --> regresa out (Ya con boton, texto e imagenes.)
        //params.keywords = text.split(" ");
        //Text


    //     ebay.xmlRequest({
    //             serviceName: 'Finding',
    //             opType: 'findItemsByKeywords',
    //             appId: process.env.EBAYAPPID, // FILL IN YOUR OWN APP KEY, GET ONE HERE: https://publisher.ebaypartnernetwork.com/PublisherToolsAPI
    //             params: params,
    //             parser: ebay.parseResponseJson // (default)
    //         },
    //         // gets all the items together in a merged array
    //         function itemsCallback(error, itemsResponse) {
    //             if (error) throw error;
    //
    //             var items = itemsResponse.searchResult.item;
    //
    //             console.log('Found', items.length, 'items');
    //             out = new Elements();
    //             for (var i = 0; i < items.length; i++) {
    //
    //                 buttons = new Buttons();
    //                 buttons.add({
    //                     text: 'Ebay',
    //                     url: items[i].viewItemURL
    //                 });
    //                 out.add({
    //                     image: items[i].galleryURL,
    //                     text: items[i].title,
    //                     buttons
    //                 });
    //                 console.log('- ' + items[i].title);
    //
    //                 //console.log(JSON.stringify(items[i],null,2));
    //             }
    //         bot.send(sender.id, out);
    //         });
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
