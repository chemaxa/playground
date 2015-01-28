function go() {
    'use strict';
    var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts');
    var streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams');

    var setBroadcastForm = document.querySelector('.setBroadcastForm');
    var btnGetBroadcats = document.getElementsByName('btnGetBroadcasts')[0];

    var divPlayer = document.querySelector('.player');
    //var divButton = document.querySelector('.urlField');
    var inputBroadcastUrl = document.querySelector('.broadcastUrl');
    var divBroadcastsList = document.querySelector('.broadcastsList');

    var myStream, myStreamData;


    setBroadcastForm.addEventListener('submit', setNewBroadcast, false);
    btnGetBroadcats.addEventListener('click', getBroadcastList, false);



    ////////////// WORK WITH PLAYER //////////////////

    var timerId = setInterval(setConfigByInterval, 5000);




    function setConfigByInterval() {

    }

    function setPlayerConfig(conf) {
        jwplayer('player').setup({
            file: conf.file
        });
    }

    function getPlayerConfig() {

    }

    jwplayer('player').onPause(function (event) {
        console.log(1, event.newstate);
        myStreamData.state = event.newstate;
        writeDataToDB(myStream, myStreamData);
        console.log('state on Pause', myStream.key(), myStreamData);
    });

    jwplayer('player').onPlay(function (event) {
        console.log(2, event.newstate, this.getPosition());
        myStreamData.state = event.newstate;
        myStreamData.position = this.getPosition();
        writeDataToDB(myStream, myStreamData);
        console.log('state on Play', myStream.key(), myStreamData);
    });



    /////////// WORK WITH HTML ////////////////////

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
            a.innerHTML = key + '<br>' + broadcastsList[key].url;
            li.appendChild(a);
            ul.appendChild(li);
        }
    }

    function broadcastsList() {
        broadcastsListRef.once('value', function (dataSnapshot) {
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
            console.log('CREATE NEW STREAM', myStream.key(), myStreamData);
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
            // GET CONF FROM LAST ALIVE STREAM FOR CURRENT BROADCAST
            streamsListRef.orderByChild("lastTimeModificated").on("child_added", function (dataSnapshot) {
                if (myStream.key() != dataSnapshot.key() && myStreamData.broadcastId == dataSnapshot.val().broadcastId)
                    updateStreamData(dataSnapshot);
            });
        }
    }


    function updateStreamData(streamData) {
        myStreamData.state = streamData.val().state;
        myStreamData.position = streamData.val().position;
        //console.log(myStream.key(),streamData.key(),streamData.val(),myStreamData);
    }

    function getBroadcastList() {
        broadcastsList();
    }

    function setNewBroadcast() {
        ///// ONLY FOR DEBUG!!!!!!! THIS CLEAR ALL DATA IN broadcast LIST !
        //broadcastsListRef.remove();
        //streamsListRef.remove();
        //////////////////////////////////////

        event.preventDefault();

        if (event.target[0].value != '') {
            var newBroadcastRef = broadcastsListRef.push();

            var newBroadcastData = {
                url: event.target[0].value,
                streamId: 0,
            };

            writeDataToDB(newBroadcastRef, newBroadcastData);
            //getBroadcast();
            inputBroadcastUrl.value = event.target[0].value;
        }
    }

    function setNewStreamRef() {
        return streamsListRef.push();
    }

    function writeDataToDB(ref, data) {
        ref.set(data);
    }

    function deleteDataFromDB(ref) {
        ref.remove();
    }



    //*************  SERVICE FUNCTIONS !!!!! **********************//

    // trim spaces
    /*function trim(string) {
        return string.replace(/(^\s+)|(\s+$)/g, "");
    }*/

    //Check valid Url https, http or ftp
    /*function isValidUrl(url) {
        var template = /^(?:(?:https?|http|ftp):\/\/(?:[a-z0-9_-]{1,32}(?::[a-z0-9_-]{1,32})?@)?)?(?:(?:[a-z0-9-]{1,128}\.)+(?:com|net|org|mil|edu|arpa|ru|gov|biz|info|aero|inc|name|[a-z]{2})|(?!0)(?:(?!0[^.]|255)[0-9]{1,3}\.){3}(?!0|255)[0-9]{1,3})(?:\/[a-z0-9.,_@%&?+=\~\/-]*)?(?:#[^ \'\"&<>]*)?$/i;
        var regex = new RegExp(template);
        return (regex.test(url) ? true : false);
    }*/

    /*   function compareStreams(streamA, streamB) {

           return streamA.lastTimeModificated - streamB.lastTimeModificated;

       }*/


    /* function debugData(data) {
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
     }*/
}

document.addEventListener("DOMContentLoaded", function () {
    'use strict';
    go();
});
