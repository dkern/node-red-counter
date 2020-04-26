module.exports = function(RED) {
    "use strict";

    function counter(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        this.outputs = Number(config.outputs || 1) === 1 ? "single" : "split";
        this.init = Number(config.init || 0);
        this.step = Number(config.step || 1);
        this.lower = config.lower || null;
        this.upper = config.upper || null;
        this.mode = config.mode || "increment";
        this.count_per_topic = {};

        this.on("input", function(msg) {
            var lowerLimitReached = false,
                upperLimitReached = false;

            // Extract topic
            var topic = "";
            if ( msg.hasOwnProperty("topic") ) {
                if ( typeof msg.topic === "string" ) {
                    topic = msg.topic;
                }
                else {
                    this.error("topic is not a string", msg);
                }
            }

            // Initialize counter if required
            if ( !node.count_per_topic.hasOwnProperty(topic) ) {
                node.count_per_topic[topic] = this.init
            }

            // use message parameters
            if( msg.hasOwnProperty("increment") || msg.hasOwnProperty("decrement") ) {
                var decremented = false;

                // handle decrement value
                if( msg.hasOwnProperty("decrement") ) {
                    var decrement = Number(msg.decrement);

                    if( !isNaN(decrement) && isFinite(decrement) ) {
                        node.count_per_topic[topic] -= decrement;
                        decremented = true;
                    }
                    else {
                        this.error("decrement is not a numeric value", msg);
                    }
                }

                // handle increment value
                if( !decremented ) {
                    var increment = Number(msg.increment || 1);

                    if( !isNaN(increment) && isFinite(increment) ) {
                        node.count_per_topic[topic] += increment;
                    }
                    else {
                        this.error("increment is not a numeric value", msg);
                    }
                }
            }

            // use default parameters
            else {
                if( isNaN(node.step) || !isFinite(node.step) ) {
                    this.error("step is not a numeric value", msg);
                }

                if( node.mode === "increment" ) {
                    node.count_per_topic[topic] += node.step;
                }
                else if( node.mode === "decrement" ) {
                    node.count_per_topic[topic] -= node.step;
                }
                else {
                    this.error("unknown mode '" + node.mode + "'", msg);
                }
            }

            // handle reset
            if( msg.hasOwnProperty("reset") && msg.reset !== false ) {
                if ( topic !== "" ) {
                    node.count_per_topic[topic] = typeof msg.reset === "number" ? msg.reset : node.init;
                }
                else {
                    if (typeof msg.reset !== "number") {
                        node.count_per_topic = {}
                    }
                    else {
                        Object.keys(node.count_per_topic).forEach(v => node.count_per_topic[v] = msg.reset)
                    }
                }
            }

            // handle lower limit
            if( node.lower !== null ) {
                var lower = Number(node.lower);

                if( !isNaN(lower) && isFinite(lower) && node.count_per_topic[topic] < lower ) {
                    node.count_per_topic[topic] = lower;
                    lowerLimitReached = true;
                }
            }

            // handle upper limit
            if( node.upper !== null ) {
                var upper = Number(node.upper);

                if( !isNaN(upper) && isFinite(upper) && node.count_per_topic[topic] > upper ) {
                    node.count_per_topic[topic] = upper;
                    upperLimitReached = true;
                }
            }

            // single output
            if( node.outputs === "single" ) {
                msg.count = node.count_per_topic[topic];

                if( lowerLimitReached ) {
                    msg.countLowerLimitReached = true;
                }

                if( upperLimitReached ) {
                    msg.countUpperLimitReached = true;
                }

                node.send(msg);
            }

            // split output
            else {
                var obj = {payload: node.count_per_topic[topic]};

                if( lowerLimitReached ) {
                    obj.countLowerLimitReached = true;
                }

                if( upperLimitReached ) {
                    obj.countUpperLimitReached = true;
                }

                node.send([obj, msg]);
            }
        });
    }

    RED.nodes.registerType("counter", counter);
};