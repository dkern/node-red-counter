module.exports = function(RED) {
    "use strict";

    function counter(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        this.outputs = config.outputs === "1" ? "single" : "split";
        this.mode = config.mode || "increment";
        this.init = Number(config.init || 0);
        this.step = Number(config.step || 1);
        this.count = this.init;

        this.on("input", function(msg) {
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
                node.count = typeof msg.reset == "number" ? msg.reset : node.init;
            }

            // single output
            if( node.outputs === "single" ) {
                msg.count = node.count;
                node.send(msg);
            }

            // split output
            else {
                node.send([{payload: node.count}, msg]);
            }
        });
    }

    RED.nodes.registerType("counter", counter);
};