$('body').css('overflow', 'hidden');

var setupLocalMode = function() {
  var socket = io.connect('http://localhost:12567');
  socket.on('fileServable', function(data) {
    console.log('File is served at:', data);
  })

  var readStart = function(progressEvent) {
      console.log('readStart',progressEvent);
  }

  var readEnd = function(progressEvent) {
      console.log('readEnd',progressEvent,this);
      var fileReader = this;
      var fileContent = fileReader.result;
      var fileName = fileReader.file.name;
      var fileType = fileReader.file.type;

      socket.emit('newFile', {fileName: fileName, fileContent: fileContent, fileType: fileType});
  }

  var readProgress = function(progressEvent) {
      console.log('readProgress',progressEvent);
      if (progressEvent.lengthComputable) {
          var percentage = Math.round((event.loaded * 100) / event.total);
          console.log('readProgress: Loaded : '+percentage+'%');
      }
  }

  var readError = function(progressEvent) {
      console.log('readError',progressEvent);
      switch(progressEvent.target.error.code) {
          case progressEvent.target.error.NOT_FOUND_ERR:
              alert('File not found!');
              break;
          case progressEvent.target.error.NOT_READABLE_ERR:
              alert('File not readable!');
              break;
          case progressEvent.target.error.ABORT_ERR:
              break;
          default:
              alert('Unknow Read error.');
      }
  }

  var readFile = function(file) {
      var reader = new FileReader();
      reader.file = file; // We need it later (filename)
      reader.addEventListener('loadstart', readStart, false);
      reader.addEventListener('loadend', readEnd, false);
      reader.addEventListener('error', readError, false);
      reader.addEventListener('progress', readProgress, false);
      reader.readAsBinaryString(file);
  }

  var drop = function(event) {
      event.preventDefault();
      var dt = event.dataTransfer;
      var files = dt.files;
      for (var i = 0; i<files.length; i++) {
          var file = files[i];
          readFile(file);
      }
  }

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  var dropZone = $('.local-mode #file-drop-zone')[0];
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', drop, false);
}

var loadLocalModeDeferred = function() {
  if (window.io) {
    setupLocalMode();
  } else {
    setTimeout(loadLocalModeDeferred, 1000);
  }
};
loadLocalModeDeferred();