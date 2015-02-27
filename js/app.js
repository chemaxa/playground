function go() {
    'use strict';
    var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts');
    var streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams');

    var setBroadcastForm = document.querySelector('.setBroadcastForm');
    var btnGetBroadcats = document.getElementsByName('btnGetBroadcasts')[0];

    //var player = document.getElementById('player');

    var inputBroadcastUrl = document.querySelector('.broadcastUrl');
    var divBroadcastsList = document.querySelector('.broadcastsList');

    var myStream,
        myStreamData = {},
        playerConfig = {};

    playerConfig = {
        "techOrder": ["youtube"],
        "src": "www.youtube.com/watch?v=yvRn76Fqyzc"
    };

    var player = videojs('player', playerConfig);



    setBroadcastForm.addEventListener('submit', setNewBroadcast, false);
    btnGetBroadcats.addEventListener('click', getBroadcastList, false);




    ////////////// WORK WITH PLAYER //////////////////



    function setPlayerConfig(conf) {

        console.log(2, conf);

        broadcastsListRef.orderByKey().equalTo(conf.broadcastId).on("child_added", function (snapshot) {
            console.log(snapshot.val().src);
            player.src(snapshot.val().src);
        });

        if (conf.state == 'pause')
            player.pause();

        if (player.currentTime() != conf.position)
            player.currentTime(Math.round(conf.position));

    };



    function logPlayerState() {
        myStreamData.state = 'play';
        myStreamData.position = player.currentTime();

        if (player.paused()) {
            myStreamData.state = 'pause';
            if (myStream != undefined) {
                broadcastsListRef.orderByKey().equalTo(myStreamData.broadcastId).on("child_added", function (snapshot) {
                    console.log(snapshot.key(), myStream.key());
                    writeDataToDB(snapshot.ref(), );
                });
            }
        }


        if (myStream != undefined) {

            writeDataToDB(myStream, myStreamData);
        }
    }

    function setPlayerState() {

    }

    setInterval(logPlayerState, 1000);

    setInterval(setPlayerState, 1000);


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
            a.innerHTML = key + '<br>' + broadcastsList[key].src;
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
                'state': 'pause',
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
                'state': 'pause',
                'position': 0,
                'lastTimeModificated': Firebase.ServerValue.TIMESTAMP,
                'broadcastId': broadcastId,
            };
            writeDataToDB(myStream, myStreamData);

            updateStreamDataFromLastAliveStream();
        }
    }

    function updateStreamDataFromLastAliveStream() {
        // GET CONF FROM LAST ALIVE STREAM FOR CURRENT BROADCAST
        streamsListRef.orderByChild("lastTimeModificated").on("child_added", function (dataSnapshot) {
            if (myStream.key() != dataSnapshot.key() && myStreamData.broadcastId == dataSnapshot.val().broadcastId)
                updateStreamData(dataSnapshot);
        });
    }


    function updateStreamData(streamData) {
        myStreamData.state = streamData.val().state;
        myStreamData.position = streamData.val().position;
        console.log(1, myStream.key(), streamData.key(), streamData.val(), myStreamData);
        // copy state from stream
        setPlayerConfig(myStreamData);
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
            var u = new URL(event.target[0].value);
            var newBroadcastData = {
                src: event.target[0].value,
                streamId: 0,
                techOrder: u.host
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
