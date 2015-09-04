$(function() {
    'use strict';
    // Firebase Refs
    var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts'),
        streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams'),
        // Html Elements
        broadcasts = document.getElementById('broadcasts'),
        inputPutUrl = document.getElementById('inputPutUrl'),
        // Stream 
        myStreamRef,
        // Stream state object
        myStreamData = {},

        // VideoJS player init config
        playerConfig = {
            "techOrder": ["youtube"],
            "src": "www.youtube.com/watch?v=yvRn76Fqyzc"
        },

        //VideoJS Player Object
        player = videojs('player', playerConfig),

        //Create  instances of :
        // Broadcast Controller
        brdCntrl = new BrdCntr(),
        // Player Controller
        plrCntrl = new PlCntr(),
        // Stream Controller
        strCntrl = new StrCntr();


    // Add events
    setBroadcast.addEventListener('click', brdCntrl.set, false);
    getBroadcasts.addEventListener('click', getBroadcastList, false);
    //setInterval(PlrCntr.log, 1000);
    //setInterval(PlCntr.set, 1000);

    // PLayer Constructor 
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

            if (myStreamRef != undefined) {
                myStreamRef.set(myStreamData);
            }
        }

    };

    //Stream Controller 
    function StrCntr() {
        this.updateStreamData = function(streamData) {
            myStreamData.state = streamData.val().state;
            myStreamData.position = streamData.val().position;
            // copy state from stream
            plrCntrl.set(myStreamData);
        }

        this.setRef = function() {
            return streamsListRef.push();
        }

    }

    // Broadcast Controller
    function BrdCntr() {

        // Create/Update list of Broadcasts
        this.List = function() {
            broadcastsListRef.once('value', function(dataSnapshot) {

                // Clear Broadcast List
                if (broadcasts.children.length) {
                    broadcasts.innerHTML = '';
                }

                for (var key in dataSnapshot.val()) {
                    var a = document.createElement('a');
                    a.classList.add('list-group-item');

                    (function(broadcastId) {
                        a.addEventListener('click', function() {
                            this.getCurrent(broadcastId);
                        }, false);
                    })(key);

                    a.href = 'javascript:void(0)';
                    //a.innerHTML = dataSnapshot.val()[key].url;
                    a.innerHTML = key + '<br>' + dataSnapshot.val()[key].src;

                    broadcasts.appendChild(a);
                }

            })
        }

        this.getCurrent = function(broadcastId) {
            // CREATE NEW STREAM
            if (!myStreamRef) {
                myStreamRef = strCntr.setRef();
                myStreamData = {
                    'state': 'pause',
                    'position': 0,
                    'broadcastId': broadcastId
                };
                myStreamRef.set(myStreamData);
                console.log('CREATE NEW STREAM', myStreamRef.key(), myStreamData);
            }

            // CHANGE CURRENT BROADCAST
            if (myStreamData.broadcastId != broadcastId) {
                myStreamData = {
                    'state': 'pause',
                    'position': 0,
                    'broadcastId': broadcastId
                };
                myStreamRef.set(myStreamData);
            }
        }

        this.set = function() {
            ///// ONLY FOR DEBUG!!!!!!! THIS CLEAR ALL DATA IN DB broadcast LIST !
            //broadcastsListRef.remove();
            //streamsListRef.remove();
            //////////////////////////////////////

            // Checking input URL
            var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
                regex = new RegExp(expression);

            // Validate inputed URL
            if (regex.test(inputPutUrl.value)) {
                //Create new Broadcast
                var newBroadcastRef = broadcastsListRef.push(),
                    u = new URL(inputPutUrl.value),
                    newBroadcastData = {
                        src: inputPutUrl.value,
                        streamId: 0,
                        techOrder: u.host
                    };
                // Write created broadcast to DB
                dbCntrl.write(newBroadcastRef, newBroadcastData);
                // Set inputed URL value for copy
                inputGetUrl.value = inputPutUrl.value;
                return;
            }
            // If URL is not validate
            alert('Введите ссылку на видео...');
        }
    }
});
