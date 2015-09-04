$(function() {
    'use strict';
    var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts'),
        streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams'),
        // Html Elements
        broadcasts = document.getElementById('broadcasts'),
        // Stream link
        myStream,
        // Stream state object
        myStreamData = {},

        // VideoJS player init config
        playerConfig = {
            "techOrder": ["youtube"],
            "src": "www.youtube.com/watch?v=yvRn76Fqyzc"
        },

        //VideoJS Player Object
        player = videojs('player', playerConfig);


    // Set Broadcast Url Button
    setBroadcast.addEventListener('click', setNewBroadcast, false);
    getBroadcasts.addEventListener('click', getBroadcastList, false);

    //Create  instances of :
    // Broadcast Controller
    brdCntrl = new BrdCntr();
    // Player Controller
    plrCntrl = new PlCntr();
    // Stream Controller
    strCntrl = new StrCntr();

    ////////////// WORK WITH PLAYER //////////////////
    // Constructor PLayer
    function PlrCntr() {
        this.set = function(conf) {

            broadcastsListRef.orderByKey().equalTo(conf.broadcastId).on("child_added", function(snapshot) {
                console.log(snapshot.val().src);
                player.src(snapshot.val().src);
            });

            if (conf.state == 'pause')
                player.pause();

            if (player.currentTime() != conf.position)
                player.currentTime(Math.round(conf.position));

        };

        this.log = function() {
            myStreamData.state = 'play';
            myStreamData.position = player.currentTime();

            if (player.paused()) {
                myStreamData.state = 'pause';
            }

            if (myStream != undefined) {
                myStream.set(myStreamData);
            }
        }

    };


    //setInterval(PlrCntr.log, 1000);
    //setInterval(PlCntr.set, 1000);

    /////////// WORK WITH HTML ////////////////////
    function StrCntr() {
        this.updateStreamData = function(streamData) {
            myStreamData.state = streamData.val().state;
            myStreamData.position = streamData.val().position;
            // copy state from stream
            plrCntrl.set(myStreamData);
        }

        this.setNewStreamRef = function() {
            return streamsListRef.push();
        }
    }

    function BrdCntr() {
        this.addToList = function(broadcastsList) {
            // Clear Broadcast List
            if (broadcasts.children.length) {
                broadcasts.innerHTML = '';
            }

            for (var key in broadcastsList) {
                var a = document.createElement('a');
                a.classList.add('list-group-item');

                (function(broadcastId) {
                    a.addEventListener('click', function() {
                        getCurrentBroadcast(broadcastId);
                    }, false);
                })(key);

                a.href = 'javascript:void(0)';
                //a.innerHTML = broadcastsList[key].url;
                a.innerHTML = key + '<br>' + broadcastsList[key].src;

                broadcasts.appendChild(a);
            }
        }

        // Create/Update list of Broadcasts
        this.broadcastsList = function() {
            broadcastsListRef.once('value', function(dataSnapshot) {
                this.addToList(dataSnapshot.val());
            });
        }

        this.getCurrentBroadcast = function(broadcastId) {
            // CREATE NEW BROADCAST & STREAM
            if (!myStream) {
                myStream = setNewStreamRef();
                myStreamData = {
                    'state': 'pause',
                    'position': 0,
                    'broadcastId': broadcastId
                };
                myStream.set(myStreamData);
                console.log('CREATE NEW STREAM', myStream.key(), myStreamData);
            }

            // CHANGE CURRENT BROADCAST
            if (myStreamData.broadcastId != broadcastId) {
                myStreamData = {
                    'state': 'pause',
                    'position': 0,
                    'broadcastId': broadcastId
                };
                myStream.set(myStreamData);
            }
        }

    }

    function setNewBroadcast() {
        ///// ONLY FOR DEBUG!!!!!!! THIS CLEAR ALL DATA IN broadcast LIST !
        //broadcastsListRef.remove();
        //streamsListRef.remove();
        //////////////////////////////////////
        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);


        if (inputPutUrl.value && regex.test(inputPutUrl.value)) {
            var newBroadcastRef = broadcastsListRef.push(),
                u = new URL(inputPutUrl.value),
                newBroadcastData = {
                    src: inputPutUrl.value,
                    streamId: 0,
                    techOrder: u.host
                };

            dbCntrl.write(newBroadcastRef, newBroadcastData);
            //getBroadcast();
            inputGetUrl.value = inputPutUrl.value;
            return;
        }
        alert('Введите УРЛ');
    }




});
