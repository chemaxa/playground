$(function() {
    'use strict';
    // Firebase Refs
    var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts'),
        streamsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/streams'),

        // Stream reference
        myStreamRef,
        // Stream state object
        myStreamData = {},

        // Html Elements
        broadcasts = document.getElementById('broadcasts'),
        inputPutUrl = document.getElementById('inputPutUrl'),
        // VideoJS player init config
        playerConfig = {
            "techOrder": ["youtube"],
            "src": "www.youtube.com/watch?v=yvRn76Fqyzc"
        },

        //VideoJS Player Object
        player = videojs('player', playerConfig),

        //Create  instances of :
        // Broadcast Controller
        brdCntr = new BrdCntr(),
        // Player Controller
        plrCntr = new PlrCntr(),
        // Stream Controller
        strCntr = new StrCntr();


    // Add events
    setBroadcast.addEventListener('click', brdCntr.set, false);
    getBroadcasts.addEventListener('click', brdCntr.list, false);
    setInterval(plrCntr.log, 1000);
    //setInterval(PlCntr.set, 1000);
    player.on('play', function() {
        plrCntr.log();
    });
    player.on('pause', function() {
        plrCntr.log();
    });
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

            if (player.paused()) {
                myStreamData.state = 'pause';
                console.log('I am paused');
            } else {
                console.log('I am played');
                myStreamData.state = 'play';
            }

            myStreamData.position = player.currentTime();
            myStreamData.lastAlive = Firebase.ServerValue.TIMESTAMP;

            if (myStreamRef != undefined) {
                myStreamRef.set(myStreamData);
            }
        }

    };

    //Stream Controller 
    function StrCntr() {
        this.setMyStream = function() {

        }
        this.getDonorStream = function(broadcastId) {
            var ref = new Firebase(broadcastsListRef.toString() + "/" + broadcastId);
            ref.orderByChild('lastAlive').limitToLast(2).on("child_added", function(snapshot) {
                console.log('LA ', snapshot.val());
                console.log('Parent ', snapshot.key());
                myStreamData = snapshot.val();
            });
        }
        this.updData = function(streamData) {
            myStreamData.state = streamData.val().state;
            myStreamData.position = streamData.val().position;
            // copy state from stream
            plrCntr.set(myStreamData);
        }

        this.setRef = function() {
            return streamsListRef.push();
        }

    }

    // Broadcast Controller
    function BrdCntr() {
        var self = this;
        // Create/Update list of Broadcasts
        this.list = function() {
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
                            self.setCurrent(broadcastId);
                        }, false);
                    })(key);

                    a.href = 'javascript:void(0)';
                    //a.innerHTML = dataSnapshot.val()[key].url;
                    a.innerHTML = key + '<br>' + dataSnapshot.val()[key].src;

                    broadcasts.appendChild(a);
                }

            })
        }

        this.setCurrent = function(broadcastId) {
            // New Stream
            if (!myStreamRef) {
                //myStreamRef = strCntr.setRef();
                myStreamRef = broadcastsListRef.child(broadcastId).push();
                strCntr.getDonorStream(broadcastId);
                myStreamData = {
                    'state': 'pause',
                    'position': 0,
                    'broadcastId': broadcastId,
                    'lastAlive': Firebase.ServerValue.TIMESTAMP
                }
                myStreamRef.set(myStreamData);

            }
            // Change Broadcast
            if (myStreamData.broadcastId != broadcastId) {
                // Remove from previous broadcast
                myStreamRef.remove();
                // Sub for new broadcast
                myStreamRef = broadcastsListRef.child(broadcastId).push();
                // Copy state from last alive stream on this broadcast
                strCntr.getDonorStream(broadcastId);
                /*myStreamData = {
                    'state': 'pause',
                    'position': 0,
                    'broadcastId': broadcastId,
                    'lastAlive': Firebase.ServerValue.TIMESTAMP
                };*/
                myStreamRef.set(myStreamData);
                console.log("change broadcast", myStreamData)
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
                newBroadcastRef.set(newBroadcastData);
                // Set inputed URL value for copy
                inputGetUrl.value = inputPutUrl.value;
                return;
            }
            // If URL is not validate
            alert('Введите ссылку на видео...');
        }
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4();
    }
});
