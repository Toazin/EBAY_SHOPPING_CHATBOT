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

  this.getGreeting = function(){
    let randIndex = Math.floor(Math.random() * this.greeting.length);
    return this.greeting[randIndex];
  }
  this.getBye = function(){
    let randIndex = Math.floor(Math.random() * this.bye.length);
    return this.bye[randIndex];
  }
}
