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
        this.show = Number(config.show || 0);
        this.duration = Number(config.duration || 0) * 1000;
        this.timer = null;
        this.count = this.init;

        // show initial counter value
        this.status({
            text: node.show ? node.count : "",
            shape: node.show && node.duration ? "dot" : null,
            fill: node.show && node.duration ? "grey" : null,
        });

        this.on("input", function(msg) {
            var lowerLimitReached = false,
                upperLimitReached = false;

            // use message parameters
            if( msg.hasOwnProperty("increment") || msg.hasOwnProperty("decrement") ) {
                var decremented = false;

                // handle decrement value
                if( msg.hasOwnProperty("decrement") ) {
                    var decrement = Number(msg.decrement);

                    if( !isNaN(decrement) && isFinite(decrement) ) {
                        node.count -= decrement;
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
                        node.count += increment;
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
                    node.count += node.step;
                }
                else if( node.mode === "decrement" ) {
                    node.count -= node.step;
                }
                else {
                    this.error("unknown mode '" + node.mode + "'", msg);
                }
            }

            // handle reset
            if( msg.hasOwnProperty("reset") && msg.reset ) {
                node.count = typeof msg.reset === "number" ? msg.reset : node.init;
            }

            // handle lower limit
            if( node.lower !== null ) {
                var lower = Number(node.lower);

                if( !isNaN(lower) && isFinite(lower) && node.count < lower ) {
                    node.count = lower;
                    lowerLimitReached = true;
                }
            }

            // handle upper limit
            if( node.upper !== null ) {
                var upper = Number(node.upper);

                if( !isNaN(upper) && isFinite(upper) && node.count > upper ) {
                    node.count = upper;
                    upperLimitReached = true;
                }
            }

            // single output
            if( node.outputs === "single" ) {
                msg.count = node.count;

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
                var obj = {payload: node.count};

                if( lowerLimitReached ) {
                    obj.countLowerLimitReached = true;
                }

                if( upperLimitReached ) {
                    obj.countUpperLimitReached = true;
                }

                node.send([obj, msg]);
            }

            // clear any pending timer
            if ( node.timer ) {
                clearTimeout(node.timer);
                node.timer = null;
            }

            // update 'live' counter value on the node status label
            if ( node.show || node.duration ) {
                node.status({
                    text: node.show ? node.count : "",
                    shape: node.duration ? 'dot' : null,
                    fill: node.duration ? 'blue' : null
                });
            }

            // blink the status icon for a certain time
            if ( node.duration ) {
                node.timer = setTimeout(() => {
                    node.status({
                        text: node.show ? node.count : "",
                        shape: node.show ? 'dot' : null,
                        fill: node.show ? 'grey' : null
                    });
                    node.timer = null;
                }, node.duration);
            }
        });

         this.on("close", function() {
            if ( node.timer ) {
                clearTimeout(node.timer);
                node.timer = null;
            }
            node.status({});
        });
    }

    RED.nodes.registerType("counter", counter);
};