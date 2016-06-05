//var redis = require('redis'),
//    client = redis.createClient();

module.exports = function(RED) {
    "use strict";


    var SyncCmdDB = {};

    
    function SenseEvent(n) {
        RED.nodes.createNode(this,n);
        var node = this,
            senseId = n.senseid,
            eventType = n.eventtype,
            eventName = n.eventname;

        var eventHandler = function(event) {
            try {
                var json;
                if (typeof event === 'string') {
                    json = JSON.parse(event).data;
                } else {
                    json = event.data;
                }

                if (json.eventType === eventType && json.eventName === eventName) {
                    node.send({
                        payload: json.message
                    });
                }
            } catch (e) {
                node.error('Error: '+e);
            }
        };

        RED.comms.subscribe(senseId, eventHandler);

        node.on('close', function() {
            RED.comms.unsubscribe(senseId, eventHandler);
        });
    }
    RED.nodes.registerType("sense event", SenseEvent);

    function SenseCommand(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid,
            commandType = n.commandtype,
            commandName = n.commandname,
            node = this;

        node.on('input', function(msg) {
            if (!msg.payload) {
                node.error('Missing property: msg.payload');
                return;
            }

            var message = {
                header: {
                    type: 'modules'
                },
                payload: {
                    commandType: commandType,
                    commandName: commandName,
                    commandData: msg.payload
                }
            };
            RED.comms.publish(senseId, message, true);
        });
    }
    RED.nodes.registerType("sense command", SenseCommand);


    function SenseCommandSync(n) {
        RED.nodes.createNode(this,n);
        var senseId = n.senseid,
            commandType = n.commandtype,
            commandName = n.commandname,
            node = this;


        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
             }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                 s4() + '-' + s4() + s4() + s4();
        }

        node.on('input', function(msg) {
            if (!msg.payload) {
                node.error('Missing property: msg.payload');
                return;
            }

            var id = guid();
            console.log('SyncCmdID:'+id)
            msg.payload.senseCmdId = id;
            
           
            SyncCmdDB[id] = new Promise(function (fulfil, reject) {

                console.log("Register Callback"+result);              
                 
                //SyncCmdDB[id] = fulfil;


            }).then(function (result) {

                console.log("Get Sync Cmd Result:"+result);              
                if (node) { 

                    node.send({
                        payload: json.message
                    });     
                }     
            });

            var eventHandler = function(event) {
                try {
                    var json;
                    if (typeof event === 'string') {
                        json = JSON.parse(event).data;
                    } else {
                        json = event.data;
                    }

                    console.log("SyncCmdn event handle received message:" + JSON.stringify(json));
                    json.message = JSON.parse(json.message);      
                    var senseCmdId = json.message.senseCmdId;

                    if (senseCmdId) { 

                        console.log("Get Sync Cmd Event:"+json);               
                        //SyncCmdDB[senseCmdId](json);
                        node.send({
                            payload: json.message
                        });     
                        RED.comms.unsubscribe(senseId, eventHandler);
                    }

                } catch (e) {
                    node.error('Error: '+e);
                }
            };
            console.log("about to subscribe for senseid:" + senseId);
            RED.comms.subscribe(senseId, eventHandler);
            
            var message = {
                header: {
                    type: 'modules'
                },
                payload: {
                    commandType: commandType,
                    commandName: commandName,
                    commandData: msg.payload
                }
            };
            console.log("about to publish msg:" + message);
            RED.comms.publish(senseId, message, true);


          

        });
    }
    RED.nodes.registerType("sense command sync", SenseCommandSync);    
    
};
