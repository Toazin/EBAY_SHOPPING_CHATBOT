const ebay = require('ebay-api');
const {Elements, Buttons} = require("facebook-messenger-bot");
let buttons = new Buttons();
let out = new Elements();

exports.ebayRequest = function (user) {
  out = new Elements();
  buttons = new Buttons();
  //console.log("USER: ", user);
  return new Promise(function (accept, reject) {
    ebay.xmlRequest({
        serviceName: 'Finding',
        opType: 'findItemsByKeywords',
        appId: process.env.EBAYAPPID,
        params: user.queryOptions,
        parser: ebay.parseResponseJson
    },function (error, itemsResponse) {
      if(error) reject(error);
      if(itemsResponse){
        if(!itemsResponse.searchResult.item.length){
          accept({status:2,data:new Elements()});
          return;
        }
        generateOut(itemsResponse);
        accept({status:1,data:out});
      }
    });
  })
}

function generateOut(itemsResponse) {
  if(!itemsResponse) return;
  let items = itemsResponse.searchResult.item;
  for (var i = 0; i < items.length; i++) {
      let cost = items[i].sellingStatus.convertedCurrentPrice.amount;
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
}
