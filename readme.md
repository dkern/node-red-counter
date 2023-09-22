@cymplecy/node-red-counter
========================

Forked from node-red-contrib-counter to fix small bug and alter behaviour of a msg.reset command
Original node by Daniel Kern https://github.com/dkern/node-red-counter

A [Node-RED](http://nodered.org) node to create a counter with messages.

---

## Table of Contents
* [Install](#install)
* [Usage](#usage)
  * [Configuration](#configuration)
  * [Output](#output)
  * [Control](#control)
* [Bugs / Feature request](#bugs--feature-request)
* [License](#license)


---

## Install

Run the following command in your Node-RED user directory - typically `~/.node-red`:

```
npm install @cymplecy/node-red-counter
```


## Usage

By default the counter will be incremented for every inbound message and append the current count to `msg.count`.


### Configuration

- `Initial Count`: The initial count can be set in the configuration. By default it will be `zero` at start.
- `Default Step`: Default amount that will be incremented or decremented on every incoming message.
- `Lower Limit`: Optional limitation of the lower count limit. Will add `countLowerLimitReached` to `msg` if reached.
- `Upper Limit`: Optional limitation of the upper count limit. Will add `countUpperLimitReached` to `msg` if reached.
- `Mode`: Determine if count value should be incremented or decremented on every incoming message.
- `Outputs`: Selects the output format of the counter. _For more info read below._


### Output

There are two output options for the counter value:

- `single`: The actual count will be appended to `msg.count` of the original `msg`.
- `split`: The node will become two outputs, first will return the count as `msg.payload` and possible limitation info, the second returns the untouched original `msg`.


### Control

It's possible to control the counter with incoming `msg` properties:

- `msg.increment`: counter will be incremented by the given value.
- `msg.decrement`: counter will be decremented by the given value.
- `msg.reset`: resets the counter to it's initial count, or to the given value, when it's a number.  If no msg.payload in the same message, then node will not output anything



## Bugs / Feature request
Please [report](http://github.com/cymplecy/node-red-counter/issues) bugs and feel free to [ask](http://github.com/cymplecy/node-red-counter/issues) for new features directly on GitHub or contact me on the forum.


## License
This project is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license.
