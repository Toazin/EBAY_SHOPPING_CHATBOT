var moment = require('moment');
/*
1 - greeting
2 - Change query params
3 - execute query
4 - BYE
5 - No sé
*/
User = function (id, name) {
  this.id = id;
  this.state = 1;
  this.name = name;
  this.confidence = .9;
  this.lastLogin = moment(new Date());
  this.queryOptions = {
    paginationInput:{entriesPerPage:5},
    itemFilter:[{name:'BestOfferOnly',
                value:true}],
    outputSelector:["UnitPriceInfo","PictureURLLarge"]
  };
  this.querySearchs = [];
  this.newUser = true;

  this.getLastLogin = function(){
    return this.lastLogin;
  }
  this.setQueryParameter = function(nameParam, objParam){
    this.queryOptions[nameParam] = objParam;
  }
  this.isNew = function(){
    return this.newUser;
  }
  this.notNew = function () {
    this.newUser = false;
  }
  this.addQuery = function(query){
    this.querySearchs.push(query);
  }
  this.getQuerys = function(){
    return this.querySearchs;
  }
  this.stateGreeting = function () {
    if(this.state == 1) return true;
    return false;
  }
  this.setState = function (state) {
    this.state = state;
  }
  this.getFilters = function(){
    return this.queryOptions.itemFilter;
  }
  this.getConfidence = function () {
    return this.confidence;
  }
  this.setConfidence = function (confidence) {
    this.confidence = confidence;
  }
}
