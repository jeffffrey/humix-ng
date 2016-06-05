var imgJson = '../images/index.json';
var target_host = 'ws://127.0.0.1:3000/node-red/ws/dashboard';  
var g;
var client;

$(document).ready(function() {

  // Load the classic theme
  Galleria.loadTheme('./galleria/themes/classic/galleria.classic.min.js');
  
  genImages();

})

Galleria.ready(function(options) {

  g = this;
  // 'this' is the gallery instance
  // 'options' is the gallery options

  this.bind('image', function(e) {
      Galleria.log('Now viewing ' + e.imageTarget.src);
  });

  clientWithWebSocket(target_host);  
  //setTimeout(reloadImage, 1000 * 10);
    
});

function genImages() {

  $.getJSON(imgJson, function(data) {  
    data.files.forEach(function(file) {
	    var img = document.createElement("img");
	    img.src = file.url;
	    img.setAttribute('data-title', file.title);
	    img.setAttribute('data-description', file.description);
	    $('#galleria').append(img);

    });

    Galleria.run('#galleria');
  });
}

function reloadImage(){

  g.destroy();
  $('#galleria').empty();
  genImages();

}

function clientWithWebSocket(target_host) {
  console.log("client uses WebSocket lib");
  client = new WebSocket(target_host, "echo-protocol");
  client.onerror = function() {
      console.log('[onerror] Connection Error');
  };
  client.onopen = function() {
      console.log('[onopen] WebSocket Client Connected');
  };
  client.onclose = function() {
      console.log('[onclose]  echo-protocol Client Closed');
  };
  client.onmessage = function(message) {
    // handle incoming message
      try {
         var input = JSON.parse(message.data);
         console.log('update image data:' + message.data);
         reloadImage();
         
      } catch (e) {
         console.log('This doesn\'t look like a valid JSON. Error: ', e);
         return;
      }
  };
}
