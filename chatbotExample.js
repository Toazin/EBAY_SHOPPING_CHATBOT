require('dotenv').config();
require('./userData.js');
require('./responses.js');
const port = 3000;
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
        "FeaturedOnly",
        "FreeShippingOnly",
        "GetItFastOnly",
        "LocatedIn",
        "MinPrice",
        "OutletSellerOnly",
        "TopRatedSellerOnly"];

//User MODULES
const ebayHandler = require("./ebay/ebay.js");
const visionHandler = require("./vision/visionHandler.js");
const wit = require('./wit/witclient');

var users = {};

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
      return;
    }
    if(event){
      if(event == "addFilter"){
        user.queryOptions.itemFilter.push({name:data, value:true});
        console.log("Agreuge: ", user.queryOptions.itemFilter);
      }else if(event == "removeFilter"){
        //REMOVER! D:
        for (var i = 0; i < user.queryOptions.itemFilter.length; i++) {
          console.log("Reviso: ", user.queryOptions.itemFilter[i].name , " = ", data);
          if(data == user.queryOptions.itemFilter[i].name){
            console.log("Entre: ");
            user.queryOptions.itemFilter.splice(i, 1);
            break;
          }
        }
        console.log("Removi: ", data);
      }

      return;
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
    console.log("SALI2");
});

bot.on('message', async message => {
    const {
        sender
    } = message; //object destructor
    await sender.fetch(`first_name,last_name`,true);//profile_pic`, true);
    if(users[sender.id] == undefined){
        users[sender.id] = new User(sender.id,sender.first_name);
    }else{
        users[sender.id].notNew();
    }
    let user = users[sender.id];
    console.log(`Received a message from ${sender.first_name} with id: ${sender.id}`);
    const {
        text, images, videos, location, audio
    } = message;
    if (text) {
      var intent = await (wit.sendToWit(text));
      console.log("Intension: ", intent);
      let out = new Elements();
      let msg;
      switch (intent.intention) {
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
        case "search":
          let product = intent.product;
          //let product = "Clock";
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
          //EBAY
          let ebayData = await (ebayHandler.ebayRequest(user));
          if(ebayData.status == 2){
            out = new Elements();
            msg = "Sorry I have no results for your search! :( ";
            out.add({text: msg});
            bot.send(sender.id, out);
            return;
          }
          if(ebayData.status == 1){
            bot.send(sender.id, ebayData.data);
          }
          break;
        case "bye":
          msg = Resp.getRandom("bye");
          out.add({text: msg});
          await bot.send(sender.id, out);
          break;
        case "closingLine":
          msg = Resp.getRandom("bye");
          out.add({text: msg});
          await bot.send(sender.id, out);
          break;
        case "what?":
          msg = Resp.getWhat();
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
          visionHandler.getVisionResponse(user, url).then(visionData=>{
            console.log("Vision Out", visionData);
            if(visionData.status == 2)
            {
              out = new Elements();
              msg = "Sorry! I don't understand this image, try with another angle";
              out.add({text: msg});
              bot.send(sender.id, out);
              return;
            }
            if(visionData.status == 1)
            {
              msg = "I think your serching for something with: ";
              user.queryOptions.keywords = visionData.data;
              for(var j = 0; j < user.queryOptions.keywords.length; j++)
              {
                msg = msg + " - " + user.queryOptions.keywords[j];
              }
              console.log("Final: ", user.queryOptions.keywords);
              out.add({text: msg});
              bot.send(sender.id, out);

              ebayHandler.ebayRequest(user)
                .then(ebayData =>{
                  if(ebayData.status == 2){
                    out = new Elements();
                    msg = "Sorry I have no results for your search! :( ";
                    out.add({text: msg});
                    bot.send(sender.id, out);
                    return;
                  }
                  if(ebayData.status == 1){
                    bot.send(sender.id, ebayData.data);
                  }
                });
            }
          })


        });
    }

    if (videos) {
        console.log(videos); // ['http://...', 'http://...']
        out = new Elements();
        msg = "Sorry I'm not that smart, i dont know about videos";
        out.add({text: msg});
        bot.send(sender.id, out);
    }

    if (location) {
        console.log(location); // {title, long, lat, url}
        out = new Elements();
        msg = "I see that you are at: " + location.title + "... in the next versions I will change settings for your location! :)";
        out.add({text: msg});
        bot.send(sender.id, out);
    }

    if (audio) {
        console.log(audio); // url
        out = new Elements();
        msg = "Sorry! i dont understand human voices or sounds";
        out.add({text: msg});
        bot.send(sender.id, out);
    }
    console.log("SALI");
});


const app = express();
app.use('/facebook', bot.router());
// app.use('/test', function(req, res, next) {
//     // console.log("req", req);
//     // console.log("res", res);
//     next("DUDE QE PEDO");
// });

app.listen(port);
console.log("Listo bro - Listening on port: " + port);
