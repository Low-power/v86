"use strict";

/**
 * @constructor
 *
 * @param {BusConnector} bus
 */
function SerialTerminalAdapter(element, bus, columns, rows)
{
    var serial = this;

	var term_handler = function(s) {
		console.log("function: term_handler(\"%s\")", s);
		for(var i = 0; i < s.length; i++) {
			serial.bus.send("serial0-input", s.charCodeAt(i));
		}
	};

	this.term = new Term(columns, rows, term_handler, 4096);
    this.enabled = true;
    this.bus = bus;
    this.text = "";
    this.text_new_line = false;

    this.last_update = 0;

/*
	this.print = function(c) {
		this.term.write(c);
	};

	this.bus.register("serial0-output-char", this.print, this);
*/
	this.bus.register("serial0-output-char", this.term.write, this);
	console.log(this.bus.register("serial0-output-char", function(s) { console.log("serial output \"%s\"", s); this.term.write(s); }, this));


    this.destroy = function()
    {
    };

    this.init = function()
    {
        this.destroy();

		this.term.open(element);
		this.term.writeln("Serial ready");
    };
    this.init();
}
