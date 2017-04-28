require('dotenv').config();
require('./userData.js');
require('./responses.js');
const moment = require('moment');
const fs = require('fs');
const request = require('request');
const download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
const types = [
  'face',
  'text',
  'label',
  'logos',
  'similar'
];

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
const vision = require('@google-cloud/vision')({
  projectId: process.env.PROJECTID,
  keyFilename: process.env.VISIONKEY
});

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
          let product = "MacBook pro";
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
     }

    if (images) {
        var url = __dirname + "/tmp.png";
        let out = new Elements();
        let msg;
        console.log("URL IMAGEN: " , images[0]);
        download(images[0], 'tmp.png', function(){
          console.log('Image Saved into server');
          /*vision.detect(url,types, function(err, detection, apiResponse){
            console.log("ERROR", err);
            var logos = detection.logos;
            var label = detection.labels;
            console.log("Detect: ", detection);
            user.queryOptions.keywords = detection.labels;
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
                //console.log("Response", itemsResponse.searchResult)
                if(!items){
                  msg = "Sorry no results for your query!";
                  out.add({text: msg});
                  bot.send(sender.id, out);
                  return;
                }
                //console.log('Found', items.length, 'items');
                out = new Elements();
                for (var i = 0; i < items.length; i++) {
                    //console.log("shippingInfo: ", items[i].shippingInfo);
                    let cost = items[i].sellingStatus.convertedCurrentPrice.amount;
                    //console.log("sellingStatus: ", cost);
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
                    //console.log('- ' + items[i].title);
                }
                bot.send(sender.id, out);
            });
          });*/

          vision.detectSimilar(url)
          .then((data) => {
            console.log("SIMILAR", data[1].responses[0].webDetection);
            const results = data[1].responses[0].webDetection;
            user.queryOptions.keywords = [];
            if (results.fullMatchingImages.length > 0) {
              console.log(`Full matches found: ${results.fullMatchingImages.length}`);
              results.fullMatchingImages.forEach((image) => {
                console.log(`  URL: ${image.url}`);
                console.log(`  Score: ${image.score}`);
              });
            }

            if (results.partialMatchingImages.length > 0) {
              console.log(`Partial matches found: ${results.partialMatchingImages.length}`);
              results.partialMatchingImages.forEach((image) => {
                console.log(`  URL: ${image.url}`);
                console.log(`  Score: ${image.score}`);
              });
            }

            if (results.webEntities.length > 0) {
              console.log(`Web entities found: ${results.webEntities.length}`);
              results.webEntities.forEach((webEntity) => {
                if(webEntity.score > .9) user.queryOptions.keywords.push(webEntity.description);
                console.log(`  Description: ${webEntity.description}`);
                console.log(`  Score: ${webEntity.score}`);
              });
            }

            //user.queryOptions.keywords = detection.labels;
            msg = "I think your serching for something with: ";

            user.queryOptions.keywords.push(user.queryOptions.keywords[0].split(" ")[0]);
            console.log("RESULTS TO SEND: ", user.queryOptions.keywords);
            for(var j = 0; j < user.queryOptions.keywords.length; j++)
            {
              //console.log("Split: ", user.queryOptions.keywords[j].split(" "));
              if(user.queryOptions.keywords[j].split(" ").length > 1)
              {
                console.log("Splitie");
                if(!user.queryOptions.keywords.includes(user.queryOptions.keywords[j].split(" ")[0]))
                  user.queryOptions.keywords.push(user.queryOptions.keywords[j].split(" ")[0]);
              }
              msg = msg + " - " + user.queryOptions.keywords[j];
            }
            console.log("Final: ", user.queryOptions.keywords);
            out.add({text: msg});
            bot.send(sender.id, out);

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
                  //console.log("Response", itemsResponse.searchResult)
                  if(!items){
                    msg = "Sorry no results for your query!";
                    out.add({text: msg});
                    bot.send(sender.id, out);
                    return;
                  }
                  //console.log('Found', items.length, 'items');
                  out = new Elements();
                  for (var i = 0; i < items.length; i++) {
                      //console.log("shippingInfo: ", items[i].shippingInfo);
                      let cost = items[i].sellingStatus.convertedCurrentPrice.amount;
                      //console.log("sellingStatus: ", cost);
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
                  }
                  bot.send(sender.id, out);
              });
            });

          vision.detectLabels(url)
            .then((results) => {
              console.log("LABELS", results[0]);
              const labels = results[0];

              console.log('Labels:');
              labels.forEach((label) => console.log(label));
            });

          vision.detectLandmarks(url)
            .then((results) => {
              console.log("LANDMARKS", results[0]);
              const landmarks = results[0];

              console.log('Landmarks:');
              landmarks.forEach((landmark) => console.log(landmark));
            });


          vision.detectLogos(url)
          .then((results) => {
            console.log("LOGOS", results[0]);
            const logos = results[0];

            console.log('Logos:');
            logos.forEach((logo) => console.log(logo));
          });

          vision.detectProperties(url)
          .then((results) => {
            console.log("PROPERTIES", results[0]);
            const properties = results[0];

            console.log('Colors:');
            properties.colors.forEach((color) => console.log(color));
          });

        });

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
});


const app = express();
app.use('/facebook', bot.router());

app.listen(3000);
console.log("Listo bro");
