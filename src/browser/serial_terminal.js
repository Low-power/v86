"use strict";

/**
 * @constructor
 *
 * @param {BusConnector} bus
 */
function SerialTerminalAdapter(element, bus, unit, columns, rows)
{
    var serial = this;

	var term_handler = function(s) {
		for(var i = 0; i < s.length; i++) {
			serial.bus.send(this.input_name, s.charCodeAt(i));
		}
	};

	this.term = new Term(columns, rows, term_handler.bind(this), 4096);
	this.enabled = true;
	this.bus = bus;
	this.input_name = "serial" + String(unit) + "-input";

	this.bus.register("serial" + String(unit) + "-output-char", function(s) { this.term.write(s); }, this);

    this.destroy = function()
    {
    };

    this.init = function()
    {
        this.destroy();

		this.term.open(element);
    };
    this.init();
}
