function go() {
  var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts_list');
  var streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams_list');

  var buttonSet = document.getElementsByName('urlButtonSet')[0];
  var buttonGet = document.getElementsByName('urlButtonGet')[0];
  var srcVideo = document.getElementsByName('urlVideo')[0];
  var divPlayer = document.querySelector('.player');
  var divButton = document.querySelector('.urlField');
  var inputbroadcastUrl = document.querySelector('.broadcastUrl');
  var divbroadcastsList = document.querySelector('.broadcastsList');
  buttonSet.addEventListener('click', setbroadcast, false);
  buttonGet.addEventListener('click', getbroadcast, false);

  function addBroadcastToListCallback(urlTobroadcast) {
    var ul = divbroadcastsList.getElementsByTagName('ul')[0];
    if(ul.childNodes.length > 1){
      divbroadcastsList.removeChild(ul);
      ul = document.createElement('ul');  
      divbroadcastsList.appendChild(ul);
    }
    
    
    for (var key in urlTobroadcast) {
      var li = document.createElement('li');
      li.innerHTML = '<a onclick=\'func(' + urlTobroadcast[key] + ') \' href=javascript:void(0)' + key + '>' + urlTobroadcast[key].url;
      ul.appendChild(li);
      ///console.log(li);
      
    }
  }
  

  function broadcastsList() {
    broadcastsListRef.once('value', function(nameSnapshot) {
      //console.log(nameSnapshot.val());
      addBroadcastToListCallback(nameSnapshot.val());
    });
  }

  function streamsList() {
    streamsListRef.once('value', function(nameSnapshot) {
       //streams = nameSnapshot.val();
    });
  }

  function getbroadcast() {
    streamsList();
    broadcastsList();
  }

  function setbroadcast() {
    ///// ONLY FOR DEBUG!!!!!!! THIS CLEAR ALL DATA IN broadcast LIST !
    //broadcastsListRef.remove();
    //streamsListRef.remove();
    //////////////////////////////////////
    var newstreamRef = setNewstream();
    var newbroadcastRef = setNewbroadcast();
    
    getbroadcast();
    inputbroadcastUrl.value=srcVideo.value;
  }

  function setNewstream() {
    var newstreamRef = streamsListRef.push();
    newstreamRef.set({
      'state': "state",
      'pos': 0,
      'lastTimeModificated': Firebase.ServerValue.TIMESTAMP
      //'broadcast_id':newbroadcastRef.key()
    });
    return newstreamRef;
  }
  
  function writeData  () {
    
  }
  function setNewbroadcast() {
    var newbroadcastRef = broadcastsListRef.push();
    newbroadcastRef.set({
      'stream_id': setNewstream().key(),
      'url': srcVideo.value
    });
    return newbroadcastRef;
  }
  
  function updatestreamInfo (){
    
  }
  
  function setupPlayer (conf){
    jwplayer('player').setup({
      file: conf.file
    });
  }
  
  
  function trim(string) { //Удаляем лишние пробелы из строки
    return string.replace(/(^\s+)|(\s+$)/g, "");
  }

  function isValidUrl(url) { //Проверяем корректность URL-адреса с протоколом https, http или ftp
    var template = /^(?:(?:https?|http|ftp):\/\/(?:[a-z0-9_-]{1,32}(?::[a-z0-9_-]{1,32})?@)?)?(?:(?:[a-z0-9-]{1,128}\.)+(?:com|net|org|mil|edu|arpa|ru|gov|biz|info|aero|inc|name|[a-z]{2})|(?!0)(?:(?!0[^.]|255)[0-9]{1,3}\.){3}(?!0|255)[0-9]{1,3})(?:\/[a-z0-9.,_@%&?+=\~\/-]*)?(?:#[^ \'\"&<>]*)?$/i;
    var regex = new RegExp(template);
    return (regex.test(url) ? true : false);
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  go();
});