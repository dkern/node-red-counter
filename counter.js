module.exports = function(RED) {
    "use strict";

    function counter(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        this.outputs = config.outputs;
        this.init = config.init || 0;
        this.count = this.init;

        this.on("input", function(msg) {
            // handle decrement value
            var decremented = false;
            if( msg.hasOwnProperty("decrement") ) {
                var decrement = Number(msg.decrement);

                if( !isNaN(decrement) && isFinite(decrement) ) {
                    node.count -= decrement;
                    decremented = true;
                }
            }

            // handle increment value
            if( !decremented ) {
                var increment = Number(msg.increment || 1);
                node.count += !isNaN(increment) && isFinite(increment) ? increment : 1;
            }

            // handle reset
            if( msg.hasOwnProperty("reset") && msg.reset === true ) {
                node.count = config.init;
            }

            // single output
            console.log(node.outputs);
            if( node.outputs == 1 ) {
                msg.count = node.count;
                node.send(msg);
                return;
            }

            // split output
            node.send([{payload: node.count}, msg]);
        });
    }

    RED.nodes.registerType("counter", counter);
};