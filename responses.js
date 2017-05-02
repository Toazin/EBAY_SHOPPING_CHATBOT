Responses = function()
{
  this.greeting = ["hey whats up!",
                    "whats new?",
                    "anything else?",
                    "what can i help you?",
                    "Hi again!",
                    "I'm still here! i'm not going anywere"];
  this.bye = ["Have a nice day!",
              "Come back soon",
              "Hope to see you around.. wait i can't :(",
              "dont leave me! :( i feel alone",
              "Good bye!"];
  this.what = ["I dont understand, can you be more specific?",
                    "I dont understad, it's Mike fault... he didn't train me that well :(",
                    "i'm just a bot, please talk me prettier, i dont understand",
                    "what do you mean?",
                    "i didn't catch you, what again?"];

  this.getRandom= function (type)
  {
    if(!this[type]) return;
    let randIndex = Math.floor(Math.random() * this[type].length);
    return this[type][randIndex];
  }


  this.getGreeting = function(){
    let randIndex = Math.floor(Math.random() * this.greeting.length);
    return this.greeting[randIndex];
  }
  this.getBye = function(){
    let randIndex = Math.floor(Math.random() * this.bye.length);
    return this.bye[randIndex];
  }
  this.getWhat = function(){
    let randIndex = Math.floor(Math.random() * this.what.length);
    return this.what[randIndex];
  }
}
