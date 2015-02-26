function go() {
    'use strict';
    var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts');
    var streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams');

    var setBroadcastForm = document.querySelector('.setBroadcastForm');
    var btnGetBroadcats = document.getElementsByName('btnGetBroadcasts')[0];

    var divPlayer = document.getElementById('player');

    var inputBroadcastUrl = document.querySelector('.broadcastUrl');
    var divBroadcastsList = document.querySelector('.broadcastsList');

    var myStream,
        myStreamData,
        playerConfig;


    setBroadcastForm.addEventListener('submit', setNewBroadcast, false);
    btnGetBroadcats.addEventListener('click', getBroadcastList, false);

    playerConfig = {
        "techOrder": ["youtube"],
        "src": "http://www.youtube.com/watch?v=xjS6SftYQaQ"
    };


    ////////////// WORK WITH PLAYER //////////////////

    var timerId = setInterval(setConfigByInterval, 5000);


    function setConfigByInterval() {

    }

    function setPlayerConfig(conf) {
        divPlayer.dataset.setup = JSON.stringify(playerConfig);
    }

    function getPlayerConfig() {

    }









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


}

document.addEventListener("DOMContentLoaded", function () {
    'use strict';
    go();
});
