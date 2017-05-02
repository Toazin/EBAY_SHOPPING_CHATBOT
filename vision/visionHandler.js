const vision = require('@google-cloud/vision')({
  projectId: process.env.PROJECTID,
  keyFilename: process.env.VISIONKEY
});
const {Elements, Buttons} = require("facebook-messenger-bot");
const ebayHandler = require("../ebay/ebay.js");
let keywordsData = {};

exports.getVisionResponse = function (user, url) {
  //console.log("USER VISION: ", user);
  let confidence = user.getConfidence();
  return new Promise(function (accept,reject) {
    vision.detectSimilar(url)
    .then((vSimilar) => {
      if(!vSimilar) reject({status:2,data:null});
      vision.detectLabels(url)
        .then((vLabel)=>{

          let results = vSimilar[1].responses[0].webDetection;
          let labels = vLabel[0];
          //console.log("SIMILAR", vSimilar[1]);
          //console.log("LABELS", vLabel[0]);
          if (results.webEntities.length > 0)
          {
            keywordsData.webEntities = obtainWebEntities(results.webEntities, confidence);
          }
/*
          if (results.fullMatchingImages.length > 0)
          {
            keywordsData.fullMatchingImages = obtainWebEntities(results.fullMatchingImages);
          }
          if (results.partialMatchingImages.length > 0)
          {
            keywordsData.partialMatchingImages = obtainWebEntities(results.partialMatchingImages);
          }
*/
          if(labels.length > 0)
          {
            keywordsData.labels = obtainLabels(labels);
          }
          console.log("WEB ENTITIES: ", keywordsData.webEntities);
          console.log("LABELS: ", keywordsData.labels);
          if(keywordsData.webEntities.length > 0){
            accept({status:1,data:keywordsData.webEntities});
          }else{
            accept({status:1,data:keywordsData.labels});
          }
          //let finalArr = merge(keywordsData.webEntities, keywordsData.labels);
          //console.log("FINAL", finalArr);
          //accept({status:1,data:finalArr});
        })
    })
  })
}

function obtainWebEntities (webEntities, confidence) {
    //out.webEntities = new Elements();
    let arr = [];
    console.log(`Web entities found: ${webEntities.length}`);
    webEntities.forEach((webEntity) => {
      //console.log("Checo: ", webEntity.description , " en: ", arr);
      if(webEntity.score > confidence){
        var tmp = webEntity.description.split(" ");
        for (var j = 0; j < tmp.length; j++) {
          if(!arr.includes(tmp[j].toLowerCase())) arr.push(tmp[j].toLowerCase());
        }
      }
      console.log(`  Description: ${webEntity.description}`);
      console.log(`  Score: ${webEntity.score}`);
    });
    return arr;
}

function obtainLabels(labels) {
  let arr = [];
  console.log(`Labels found: ${labels.length}`);
  labels.forEach((label) => {
    var tmp = label.split(" ");
    for (var j = 0; j < tmp.length; j++) {
      if(!arr.includes(tmp[j].toLowerCase())) arr.push(tmp[j].toLowerCase());
    }
    console.log(`  label: ${label}`);
  });
  return arr;
}

function merge (web,labels) {
  if(web.length == 0) return labels;
  let arr = [];
  let length = Math.max(web.length, labels.length);
  for (var i = 0; i < length; i++) {
    if(web[i] && !arr.includes(web[i])) arr.push(web[i]);
    if(labels[i] && !arr.includes(labels[i])) arr.push(labels[i]);
  }
  return arr;
}
function obtainPartialMatch (partialMatchingImages) {
  // body...
}

function obtainFullMatch (fullMatchingImages) {
  // body...
}
