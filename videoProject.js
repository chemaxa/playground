function go() {
    'use strict';
    var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts');
    var streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams');

    var buttonSet = document.getElementsByName('urlButtonSet')[0];
    var buttonGet = document.getElementsByName('urlButtonGet')[0];
    var srcVideo = document.getElementsByName('urlVideo')[0];
    var divPlayer = document.querySelector('.player');
    var divButton = document.querySelector('.urlField');
    var inputBroadcastUrl = document.querySelector('.broadcastUrl');
    var divBroadcastsList = document.querySelector('.broadcastsList');

    var myStream, myStreamData;

    buttonSet.addEventListener('click', setNewBroadcast, false);
    buttonGet.addEventListener('click', getBroadcastList, false);

    function addBroadcastToListCallback(broadcastsList) {
        var ul = divBroadcastsList.getElementsByTagName('ul')[0];
        if (ul.childNodes.length > 1) {
            divBroadcastsList.removeChild(ul);
            ul = document.createElement('ul');
            divBroadcastsList.appendChild(ul);
        }


        for (var key in broadcastsList) {
            var li = document.createElement('li');
            var a = document.createElement('a');

            (function (broadcastId) {
                a.addEventListener('click', function () {
                    getCurrentBroadcast(broadcastId);
                }, false);
            })(key);

            a.href = 'javascript:void(0)';
            //a.innerHTML = broadcastsList[key].url;
            a.innerHTML = key;
            li.appendChild(a);
            ul.appendChild(li);
        }
    }

    function broadcastsList() {
        broadcastsListRef.once('value', function (dataSnapshot) {
            //console.log(dataSnapshot.val());
            addBroadcastToListCallback(dataSnapshot.val());
        });
    }


    function getCurrentBroadcast(broadcastId) {
        // CREATE NEW BROADCAST & STREAM
        if (!myStream) {
            myStream = setNewStreamRef();
            myStreamData = {
                'state': 'paused',
                'position': 0,
                'lastTimeModificated': Firebase.ServerValue.TIMESTAMP,
                'broadcastId': broadcastId,
            };
            writeDataToDB(myStream, myStreamData);
            console.log('CREATE NEW STREAM',myStream.key(), myStreamData);
        }
        // CHANGE CURRENT BROADCAST
        if (myStreamData.broadcastId != broadcastId) {

            myStreamData = {
                'state': 'paused',
                'position': 0,
                'lastTimeModificated': Firebase.ServerValue.TIMESTAMP,
                'broadcastId': broadcastId,
            };

            writeDataToDB(myStream, myStreamData);
            console.log('CHANGE',myStream.key(), myStreamData);
        } else {
            // READ CURRENT BROADCAST STATE
            var broadcastsRef = broadcastsListRef.child(broadcastId);
            broadcastsRef.once('value', function (dataSnapshot) {
                updateStreamData(dataSnapshot);
            });
            console.log('3');
        }
    }

    function updateStreamData(streamData) {

        console.log(streamData.key());

    }

    function getBroadcastList() {
        broadcastsList();
    }

    function setNewBroadcast() {
        ///// ONLY FOR DEBUG!!!!!!! THIS CLEAR ALL DATA IN broadcast LIST !
        //broadcastsListRef.remove();
        //streamsListRef.remove();
        //////////////////////////////////////
        // 
        var newBroadcastRef = broadcastsListRef.push();

        var newBroadcastData = {
            url: srcVideo.value,
            stream_id: 0,
        };

        writeDataToDB(newBroadcastRef, newBroadcastData);
        //getBroadcast();
        inputBroadcastUrl.value = srcVideo.value;
    }



    function setNewStreamRef() {
        var newStreamRef = streamsListRef.push();
        return newStreamRef;
    }

    function writeDataToDB(ref, data) {
        ref.set(data);
    }

    function deleteDataFromDB(ref){
        ref.remove();
    }


    function setupPlayer(conf) {
        jwplayer('player').setup({
            file: conf.file
        });
    }



    function trim(string) { // trim spaces
        return string.replace(/(^\s+)|(\s+$)/g, "");
    }

    function isValidUrl(url) { //Check valid Url https, http or ftp
        var template = /^(?:(?:https?|http|ftp):\/\/(?:[a-z0-9_-]{1,32}(?::[a-z0-9_-]{1,32})?@)?)?(?:(?:[a-z0-9-]{1,128}\.)+(?:com|net|org|mil|edu|arpa|ru|gov|biz|info|aero|inc|name|[a-z]{2})|(?!0)(?:(?!0[^.]|255)[0-9]{1,3}\.){3}(?!0|255)[0-9]{1,3})(?:\/[a-z0-9.,_@%&?+=\~\/-]*)?(?:#[^ \'\"&<>]*)?$/i;
        var regex = new RegExp(template);
        return (regex.test(url) ? true : false);
    }

    function debugData(data) {
        var li = document.createElement('li');
        if (data instanceof Object) {
            for (var key in data) {
                li.innerHTML += '<br>' + key + ' ' + data[key];
            }
            console.log(data);
        } else {
            li.innerHTML = data;
            console.log(1, data);
        }
        log.appendChild(li);
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    'use strict';
    go();
});
