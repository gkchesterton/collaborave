window.AudioContext = window.AudioContext||window.webkitAudioContext;
context = new AudioContext();
context.position = 0;
context.postition_diff = 0;

window.Collaborave = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    new Collaborave.Routers.Router();
		Backbone.history.start();
  }
};

$(document).ready(function(){
  Collaborave.initialize();
});
