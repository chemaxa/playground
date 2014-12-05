function go() {
  var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts');
  var streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams');

  var buttonSet = document.getElementsByName('urlButtonSet')[0];
  var buttonGet = document.getElementsByName('urlButtonGet')[0];
  var srcVideo = document.getElementsByName('urlVideo')[0];
  var divPlayer = document.querySelector('.player');
  var divButton = document.querySelector('.urlField');
  var inputBroadcastUrl = document.querySelector('.broadcastUrl');
  var divBroadcastsList = document.querySelector('.broadcastsList');
  
  buttonSet.addEventListener('click', setBroadcast, false);
  buttonGet.addEventListener('click', getBroadcast, false);

  function addBroadcastToListCallback(urlToBroadcast) {
    var ul = divBroadcastsList.getElementsByTagName('ul')[0];
    if(ul.childNodes.length > 1){
      divBroadcastsList.removeChild(ul);
      ul = document.createElement('ul');  
      divBroadcastsList.appendChild(ul);
    }
    
    
    for (var key in urlToBroadcast) {
      var li = document.createElement('li');
      li.innerHTML = '<a onclick=\'func(' + urlToBroadcast[key] + ') \' href=javascript:void(0)' + key + '>' + urlToBroadcast[key].url;
      ul.appendChild(li);
      ///console.log(li);
      
    }
  }
  

  function broadcastsList() {
    broadcastsListRef.once('value', function(nameSnapshot) {
      console.log(nameSnapshot.val());
      addBroadcastToListCallback(nameSnapshot.val());
    });
  }

  function streamsList() {
    streamsListRef.once('value', function(nameSnapshot) {
       //streams = nameSnapshot.val();
    });
  }

  function getBroadcast() {
    streamsList();
    broadcastsList();
  }

  function setBroadcast() {
    ///// ONLY FOR DEBUG!!!!!!! THIS CLEAR ALL DATA IN broadcast LIST !
    //broadcastsListRef.remove();
    //streamsListRef.remove();
    //////////////////////////////////////
    var newStreamRef = setNewStream();
    var newSroadcastRef = setNewBroadcast();
    
    getBroadcast();
    inputBroadcastUrl.value=srcVideo.value;
  }

  function setNewStream() {
    var newStreamRef = streamsListRef.push();
    newStreamRef.set({
      'state': "state",
      'pos': 0,
      'lastTimeModificated': Firebase.ServerValue.TIMESTAMP
    });
    return newStreamRef;
  }
  
  function writeDataToDB  (ref,data) {
    ref.set({
      'stream_id': setNewStream().key(),
      'url': srcVideo.value
    });
  }
  
  function setNewBroadcast() {
    var newBroadcastRef = broadcastsListRef.push();
    
    return newBroadcastRef;
  }
  
  function updateStreamInfo (){
    
  }
  
  function setupPlayer (conf){
    jwplayer('player').setup({
      file: conf.file
    });
  }
  
  

  function trim(string) { // trim spaces
    return string.replace(/(^\s+)|(\s+$)/g, "");
  }

  function isValidUrl(url) { //Check valid Url https, http èëè ftp
    var template = /^(?:(?:https?|http|ftp):\/\/(?:[a-z0-9_-]{1,32}(?::[a-z0-9_-]{1,32})?@)?)?(?:(?:[a-z0-9-]{1,128}\.)+(?:com|net|org|mil|edu|arpa|ru|gov|biz|info|aero|inc|name|[a-z]{2})|(?!0)(?:(?!0[^.]|255)[0-9]{1,3}\.){3}(?!0|255)[0-9]{1,3})(?:\/[a-z0-9.,_@%&?+=\~\/-]*)?(?:#[^ \'\"&<>]*)?$/i;
    var regex = new RegExp(template);
    return (regex.test(url) ? true : false);
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  go();
});
