"use strict";

/**
 * @constructor
 *
 * @param {BusConnector} bus
 */
function SerialWebSocketAdapter(url, bus, unit)
{
    var serial = this;

    this.enabled = true;
	this.url = url;
    this.bus = bus;
	this.input_name = "serial" + String(unit) + "-input";

    this.reconnect_interval = 10000;
/*
    this.send_queue = [];
    this.send_queue_limit = 64;
*/

	var send_to_ws = function(b) {
		if(!this.socket || this.socket.readyState !== 1) {
/*
			this.send_queue.push(b);
			if(this.send_queue.length > 2 * this.send_queue_limit) {
				this.send_queue = this.send_queue.slice(-this.send_queue_limit);
			}
*/
			this.connect();
		} else {
			var buffer = new Uint8Array(1);
			buffer[0] = b;
			this.socket.send(buffer);
		}
	};

	this.bus.register("serial" + String(unit) + "-output-byte", send_to_ws.bind(this));

	this.connect = function() {
		if(this.socket) switch(this.socket.readyState) {
			case 0:
			case 1:
				return;
		}

		try {
			this.socket = new WebSocket(this.url);
		} catch(e) {
			console.warn(e);
			this.on_ws_close(null);
			return;
		}
		this.socket.binaryType = "arraybuffer";
		this.socket.onopen = this.on_ws_open.bind(this);
		this.socket.onmessage = this.on_ws_message.bind(this);
		this.socket.onclose = this.on_ws_close.bind(this);
		this.socket.onerror = this.on_ws_error.bind(this);
	};

	this.disconnect = function() {
	};

	this.on_ws_open = function(e) {
/*		A serial line should drop data when broken
		this.socket.send(this.send_queue);
		this.send_queue = [];
*/
	};

	this.on_ws_message = function(e) {
		//console.log(typeof e.data);
		var buffer = new Uint8Array(e.data);
		for(var i = 0; i < buffer.length; i++) {
			this.bus.send(this.input_name, buffer[i]);
		}
	};

	this.on_ws_close = function(e) {
		this.connect();
		setTimeout(this.connect.bind(this), this.reconnect_interval);
	};

	this.on_ws_error = function(e) {
		console.warn(e);
	};
}
