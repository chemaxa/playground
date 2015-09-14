$(function() {
    'use strict';
    // Firebase Refs
    var broadcastsListRef = new Firebase('https://fiery-heat-9055.firebaseio.com/broadcasts'),
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
    setInterval(plrCntr.log, 2000);
    //setInterval(PlCntr.set, 1000);


    player.on('play', playerHandlerPlay);
    player.on('pause', playerHandlerPause);

    function playerHandlerPlay() {
        plrCntr.log();
        myStreamData.state = 'play';
        console.log(myStreamData.state, player.paused());
        brdCntr.setStateBroadcast(myStreamData);
    }

    function playerHandlerPause() {
        plrCntr.log();
        myStreamData.state = 'pause';
        console.log(myStreamData.state, player.paused());
        brdCntr.setStateBroadcast(myStreamData);
    }

    // PLayer Constructor 
    function PlrCntr() {
        this.init = function(conf) {
            player.src(conf.src);
            player.currentTime(Math.round(conf.position));
            if (conf.state == 'pause')
                player.pause();
            else
                player.play();
        }

        this.set = function(conf) {

            if (player.currentTime() != conf.position) {
                player.currentTime(Math.round(conf.position));
            }
            if (conf.state == 'pause')
                player.pause();
            else
                player.play();

            console.log('Player state: ', conf);


        };

        this.log = function() {

            if (player.paused()) {
                myStreamData.state = 'pause';
            } else {
                myStreamData.state = 'play';
            }

            myStreamData.position = player.currentTime();
            myStreamData.lastAlive = Firebase.ServerValue.TIMESTAMP;

            if (myStreamRef) {
                myStreamRef.set(myStreamData);
            }
        }

    };

    //Stream Controller 
    function StrCntr() {

        var self = this;
        this.setNewStream = function(broadcastId) {
            console.log('Child NOT exist');
            var ref = new Firebase(broadcastsListRef.toString() + "/" + broadcastId),
                createStream = new Promise(function(resolve, reject) {
                    ref.once("value", function(snapshot) {
                        resolve(snapshot);
                    }, function(err) {
                        reject(err)
                    });
                });
            createStream.then(create, error);
            //Get URL & TechOrder video
            function create(data) {
                // Create own default stream 
                myStreamData = {
                    'state': 'pause',
                    'position': 0,
                    'broadcastId': broadcastId,
                    'lastAlive': Firebase.ServerValue.TIMESTAMP,
                    'src': data.val()['src'],
                    'techOrder': data.val()['techOrder']
                }
                console.log('Start state: ', myStreamData);
                // Create ref on my stream
                myStreamRef = broadcastsListRef.child(broadcastId).push();
                console.log(myStreamRef.toString())
                    // Save my state
                myStreamRef.set(myStreamData);
                // Remove stream ondisconnect
                myStreamRef.onDisconnect().remove();
                //Start player
                plrCntr.init(myStreamData);
            }


            function error(err) {
                console.error(err);
            }

        }

        this.getDonorStream = function(broadcastId) {
            var ref = new Firebase(broadcastsListRef.toString() + "/" + broadcastId),
                hasChild = new Promise(function(resolve, reject) {
                    ref.once("child_added", function(snapshot) {
                        console.log('Snapshot: ', snapshot.val());
                        resolve(snapshot.hasChildren());
                    }, function(err) {
                        reject(err);
                    })
                });

            hasChild.then(childExist, error);

            function childExist(data) {
                // If child exist
                if (data) {
                    console.log('Child exist');
                    ref.orderByChild('lastAlive').limitToLast(1).once("child_added", function(snapshot) {

                        myStreamData = snapshot.val();
                        console.log('Copy state: ', myStreamData);
                        // Copy state from last alive stream
                        if (!myStreamRef)
                            myStreamRef = broadcastsListRef.child(broadcastId).push();
                        myStreamRef.set(myStreamData);
                        // Setting player
                        plrCntr.init(myStreamData);
                    });
                } else {
                    self.setNewStream(broadcastId);
                }
            }

            function error(data) {
                console.error(data);
            }
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
                // Copy state from last alive stream on this broadcast
                strCntr.getDonorStream(broadcastId);
            }
            // Change Broadcast
            if (myStreamRef && myStreamData.broadcastId != broadcastId) {
                // Remove ref from previous broadcast
                myStreamRef.remove();
                // Copy state from last alive stream on this broadcast
                strCntr.getDonorStream(broadcastId);
                // Remove stream ondisconnect
                myStreamRef.onDisconnect().remove();
            }

            !(function(broadcastId) {
                var ref = new Firebase(broadcastsListRef.toString() + "/" + broadcastId);

                ref.on("value", function(snapshot) {
                    console.log("Player Get State: ", snapshot.val()['state'], myStreamData.state);

                    if (myStreamData.state != snapshot.val()['state']) {
                        console.log("Player Set State: ", snapshot.val()['state'], myStreamData.state);
                        plrCntr.set(snapshot.val());
                        //myStreamData.state = snapshot.val();
                    }
                })
            })(broadcastId)

        }

        this.setStateBroadcast = function(myStreamData) {
            var ref = new Firebase(broadcastsListRef.toString() + "/" + myStreamData.broadcastId);
            console.log('Set state: ', myStreamData.state);
            ref.update({
                'state': myStreamData.state,
                'src': myStreamData.src,
                'techOrder': myStreamData.techOrder
            });
        }

        this.set = function() {
            ///// ONLY FOR DEBUG!!!!!!! THIS CLEAR ALL DATA IN DB broadcast LIST !
            //broadcastsListRef.remove();
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
                        techOrder: u.host,
                        state: 'pause'
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
});
