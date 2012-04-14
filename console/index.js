/*jshint node:true jquery:true*/
"use strict";

var cs = {};

cs.Console = function() { return this.init.apply(this, arguments); };

cs.Console.prototype = {
	init: function($div, editor) {
		this.$div = $div;
		this.$div.addClass('cs-console');
		this.$div.on('scroll', $.proxy(this.refreshAutoScroll, this));

		this.$content = $('<div class="cs-content"></div>');
		this.$div.append(this.$content);

		//this.debugToBrowser = true;
		this.highlightNextLines = false;
		this.autoScroll = false;
		this.editor = editor;
		this.editor.addOutput(this);

		this.refreshAutoScroll();
		this.clear();
	},

	getAugmentedObject: function() {
		return {
			log: {isAugmentedFunction: true, func: $.proxy(this.log, this)},
			clear: {isAugmentedFunction: true, func: $.proxy(this.log, this)}
		};
	},

	log: function(node, value) {
		var text = '' + value;
		if (typeof value === 'object') text = '[object]';
		else if (typeof value === 'function') text = '[function]';

		var $element = $('<div class="cs-line"></div>');
		if (this.highlightNextLines) {
			$element.addClass('cs-highlight-line');
		}
		$element.text(text);
		$element.data('node', node);
		$element.on('mousemove', $.proxy(this.mouseMove, this));
		this.$content.append($element);

		if (this.debugToBrowser && console && console.log) console.log(value);
	},

	startHighlighting: function() {
		this.highlightNextLines = true;
	},

	stopHighlighting: function() {
		this.highlightNextLines = false;
	},

	enableHighlighting: function() {
		this.highlighting = true;
		this.$div.addClass('cs-highlighting');
		this.autoScroll = false;
		this.$div.removeClass('cs-autoscroll');
	},

	disableHighlighting: function() {
		this.highlighting = false;
		this.$content.children('.cs-highlight-line').removeClass('cs-highlight-line');
		this.$div.removeClass('cs-highlighting');
		this.refreshAutoScroll();
	},

	startRun: function() {
		this.clear();
	},

	endRun: function() {
		if (this.highlighting) {
			var $last = this.$content.children('.cs-highlight-line').last();
			if ($last.length > 0) {
				// the offset is weird since .position().top changes when scrolling
				console.log($last.position().top);
				this.scrollToY($last.position().top + this.$div.scrollTop());
			}
		} else if (this.autoScroll) {
			this.scrollToY(this.$content.height());
		}
	},

	clear: function() {
		this.$content.children('.cs-line').remove(); // like this to prevent $.data memory leaks
		if (this.debugToBrowser && console && console.clear) console.clear();
	},

	/// INTERNAL FUNCTIONS ///
	scrollToY: function(y) {
		y = Math.max(0, y - this.$div.height()/2);
		this.$div.stop(true).animate({scrollTop : y}, 150);
	},

	mouseMove: function(event) {
		if (this.highlighting) {
			var $target = $(event.target);
			if (!$target.hasClass('cs-highlight-line')) {
				this.$content.children('.cs-highlight-line').removeClass('cs-highlight-line');
				$target.addClass('cs-highlight-line');
				this.editor.highlightNode($target.data('node'));
			}
		}
	},

	refreshAutoScroll: function() {
		if (!this.highlighting) {
			if (this.$div.scrollTop() >= this.$content.outerHeight(true)-this.$div.height()-2) {
				this.$div.addClass('cs-autoscroll');
				this.autoScroll = true;
			} else {
				this.$div.removeClass('cs-autoscroll');
				this.autoScroll = false;
			}
		}
	}
};

module.exports = cs;