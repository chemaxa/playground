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
            "src": "www.youtube.com/watch?v=yvRn76Fqyzc",
            "controls": true,
            "autoplay": false,
            "preload": "auto",
            "width": 480,
            "height": 320
        },

        //VideoJS Player Object
        player = videojs('player', playerConfig),

        //Create  instances of :
        // Broadcast Controller
        brdCntr = new BrdCntr(),
        // Player Controller
        plrCntr = new PlrCntr(),
        // Stream Controller
        strCntr = new StrCntr(),
        // Router
        router = new Router(),
        // Object with url params
        urlObj = router.parseUrl(window.location);

    // Init broadcast if URL GET params exist
    if (urlObj.bcstId) {
        brdCntr.setCurrent(urlObj.bcstId);
        chat(urlObj.bcstId);
    }
    // Clean empty broadcasts
    brdCntr.cleaner();
    // Add events handlers
    setBroadcast.addEventListener('click', router.set, false);
    // DEBUG! BUTTON FOR GET BROADCASTS LIST
    //getBroadcasts.addEventListener('click', brdCntr.list, false);
    // Lets GO, statrting logging our state 
    setInterval(plrCntr.log, 1000);



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

    // Simple Anon Chat
    function chat(broadcastId) {
        if (!broadcastId) return;
        var ref = new Firebase(broadcastsListRef.toString() + "/" + broadcastId + '/messages');
        console.log(ref.toString());
        $('#messageInput').keypress(function(e) {
            if (e.keyCode == 13) {
                var name = $('#nameInput').val();
                var text = $('#messageInput').val();
                ref.push({
                    name: name,
                    text: text
                });
                $('#messageInput').val('');
            }
        });
        ref.on('child_added', function(snapshot) {
            var message = snapshot.val();
            displayChatMessage(message.name, message.text);
        });

        function displayChatMessage(name, text) {
            $('<div/>').text(text).prepend($('<em/>').text(name + ': ')).appendTo($('#messagesDiv'));
            $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
        };
    }


    //Router :)
    function Router() {
        var self = this;
        this.set = function() {
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
                        state: 'pause',
                        position: 0
                    };
                // Write created broadcast to DB
                newBroadcastRef.set(newBroadcastData);
                // Set URL to broadcast
                var broadcastUrl = location.host + '/?bcstId=' + newBroadcastRef.key();
                inputGetUrl.value = broadcastUrl;
                brdCntr.setCurrent(newBroadcastRef.key());
                chat(newBroadcastRef.key());
                return;
            }
            // If URL is not validate
            alert('Введите ссылку на видео...');
        }

        this.parseUrl = function(location) {

            function getSearchParameters() {
                var prmstr = location.search.substr(1);
                return prmstr != null && prmstr != "" ? transformToObj(prmstr) : {};
            }

            function transformToObj(prmstr) {
                var params = {};
                var prmarr = prmstr.split("&");
                for (var i = 0; i < prmarr.length; i++) {
                    var tmparr = prmarr[i].split("=");
                    params[tmparr[0]] = tmparr[1];
                }
                return params;
            }

            return getSearchParameters();
        }
    }

    // PLayer Controller 
    function PlrCntr() {
        var self = this;
        this.set = function(conf) {
            player.src(conf.src);
            player.currentTime(Math.round(conf.position));
            if (conf.state == 'pause')
                player.pause();
            else
                player.play();
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
                myStreamRef.update(myStreamData);
            }
        }
    };

    //Stream Controller 
    function StrCntr() {
        var self = this;
        // Setting new stream 
        this.setNewStream = function(broadcastId) {
            // Ref to the broadcast
            var ref = new Firebase(broadcastsListRef.toString() + "/" + broadcastId),
                // Create stream when value is changed? Because we have not video source & techorder and get it from DB!
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
                    // Remove ref from previous broadcast
                if (myStreamRef)
                    myStreamRef.remove();
                // Create ref on my stream
                myStreamRef = broadcastsListRef.child(broadcastId).push();
                console.log(myStreamRef.toString())
                    // Save my state
                myStreamRef.set(myStreamData);
                // Remove stream ondisconnect
                myStreamRef.onDisconnect().remove();
                //Start player
                plrCntr.set(myStreamData);
                // Set broadcast to default position
                brdCntr.setStateBroadcast(myStreamData);
            }

            function error(err) {
                console.error(err);
            }
        };
        // Copy translation state from alive stream
        this.getDonorStream = function(broadcastId) {
            // Lnk to the broadcast
            var ref = new Firebase(broadcastsListRef.toString() + "/" + broadcastId),
                hasChild = new Promise(function(resolve, reject) {
                    // When child added to the broadcast fire this event
                    ref.once("child_added", function(snapshot) {
                        resolve(snapshot.hasChildren());
                    }, function(err) {
                        reject(err);
                    })
                });

            hasChild.then(childExist, error);

            function childExist(data) {
                if (data) {
                    // If broadcast have childrens
                    // Order childs by lastAlive value
                    ref.orderByChild('lastAlive').limitToLast(1).once("child_added", function(snapshot) {
                        // Copy state from last alive child
                        myStreamData = snapshot.val();
                        // Remove ref from previous broadcast
                        if (myStreamRef)
                            myStreamRef.remove();
                        // Set new stream ref to the current broadcast
                        myStreamRef = broadcastsListRef.child(broadcastId).push();
                        // Remove stream ondisconnect
                        myStreamRef.onDisconnect().remove();
                        // +2 sec for buffering
                        myStreamData.position = myStreamData.position + 2;
                        // Set ours data in stream ref
                        myStreamRef.set(myStreamData);
                        // Setting player state
                        plrCntr.set(myStreamData);
                    });
                } else {
                    // If broadcat have not childrens, create new
                    self.setNewStream(broadcastId);
                }
            }

            function error(data) {
                console.error(data);
            }
        };
    }

    // Broadcast Controller
    function BrdCntr() {
        var self = this;
        // Get list of Broadcasts
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
                // Copy state from last alive stream on this broadcast
                strCntr.getDonorStream(broadcastId);

            }
            //Subscribe on change in broadcast
            !(function(broadcastId) {
                var ref = new Firebase(broadcastsListRef.toString() + "/" + broadcastId);
                ref.on("value", function(snapshot) {
                    if (myStreamData.state != snapshot.val()['state']) {
                        plrCntr.set(snapshot.val());
                    }
                })
            })(broadcastId)

        }

        this.setStateBroadcast = function(myStreamData) {
            var ref = new Firebase(broadcastsListRef.toString() + "/" + myStreamData.broadcastId);
            ref.update({
                'state': myStreamData.state,
                'src': myStreamData.src,
                'position': myStreamData.position,
                'techOrder': myStreamData.techOrder
            });
        }

        this.cleaner = function() {
            broadcastsListRef.once("value", function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    // Num of params in Broadcast, if it <4 that empty broadcast
                    if (childSnapshot.numChildren() <= 5) {
                        var ref = new Firebase(broadcastsListRef.toString() + "/" + childSnapshot.key());
                        ref.remove();
                    }
                });
            });
        }
    }
});
