/**
 * @title list view scroll
 * @{@link https://github.com/typesettin/component.collection_list-view-scroll}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 */

'use strict';
var classie = require('classie'),
	extend = require('util-extend'),
	events = require('events'),
	util = require('util'),
	docElem;

/**
 * A module that represents a listViewScroll object, a List view collection page.
 * @{@link https://github.com/typesettin/component.collection_list-view-scroll}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @constructor listViewScroll
 * @requires module:classie
 * @requires module:util-extent
 * @requires module:util
 * @requires module:events
 */
var listViewScroll = function (options) {
	/** call event emitter */
	events.EventEmitter.call(this);

	/** module default configuration */
	var defaults = {
		// The viewportFactor defines how much of the appearing item has to be visible in order to trigger the animation
		// if we'd use a value of 0, this would mean that it would add the animation class as soon as the item is in the viewport. 
		// If we were to use the value of 1, the animation would only be triggered when we see all of the item in the viewport (100% of it)
		viewportFactor: 0.2,
		idSelector: 'list-view-scroll',
		initClass: 'list-view-scroll-init',
		animateClass: 'list-view-scroll-animate',
		sectionClass: 'list-view-scroll-section',
		useWindowAsParent: true,
		el: null,
		sections: null
	};
	docElem = window.document.documentElement;

	this.didScroll = false;
	/** extended default options */
	this.options = extend(defaults, options);
	this.init(this.options);
};

/** Inherit event emitter */
util.inherits(listViewScroll, events.EventEmitter);


/**
 * Sets up a new listViewScroll event listeners.
 */
listViewScroll.prototype.initEventListeners = function () {
	var scrollHandler = function () {
		if (!this.didScroll) {
			this.didScroll = true;
			setTimeout(function () {
				this._scrollPage(this.options);
			}.bind(this), 60);
		}
	}.bind(this);

	var resizeHandler = function () {
		// function delayed() {
		// this._scrollPage(this.options);
		// resizeTimeout = null;
		// }.bind(this);

		var resizeTimeout = setTimeout(function () {
			this._scrollPage(this.options);
			resizeTimeout = null;
		}.bind(this), 60);

		if (resizeTimeout) {
			clearTimeout(resizeTimeout);
		}
	}.bind(this);

	if (typeof window === 'object' && typeof window.document === 'object') {
		console.log("this.options.parentElement", this.options.parentElement)
		this.options.parentElement.addEventListener('scroll', scrollHandler, false);
		window.addEventListener('resize', resizeHandler, false);
	}
};
/**
 * Sets up a new listViewScroll component.
 */
listViewScroll.prototype.init = function (options) {
	this.options = options;
	this.options.el = document.getElementById(options.idSelector);
	this.options.sections = this.options.el.getElementsByClassName(options.sectionClass);

	this.options.parentElement = (this.options.useWindowAsParent) ? (window || docElem) : this.options.el.parentElement;

	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		// console.log('has touch');
		return;
	}

	this.initEventListeners();
};

/**
 * handle touch start events
 * @returns {number} height of viewport element
 */
listViewScroll.prototype._getViewportH = function () {
	var client = docElem.clientHeight,
		inner = window.innerHeight;
	if (client > inner) {
		return inner;
	}
	else {
		return client;
	}
};
/**
 * get the scroll position of the viewport element
 */
listViewScroll.prototype._scrollY = function () {
	return this.options.parentElement.scrollTop || this.options.parentElement.pageYOffset;
};

/**
 * get element offset, http://stackoverflow.com/a/5598797/989439
 * @param {object} el element of scrolled element
 * @returns {object} top,left position of element
 */
listViewScroll.prototype._getOffset = function (el) {
	var offsetTop = 0,
		offsetLeft = 0;
	do {
		if (!isNaN(el.offsetTop)) {
			offsetTop += el.offsetTop + el.offsetParent.offsetTop;
		}
		if (!isNaN(el.offsetLeft)) {
			offsetLeft += el.offsetLeft + el.offsetParent.offsetLeft;
		}
	} while (el === el.offsetParent); //changed for linting

	return {
		top: offsetTop,
		left: offsetLeft
	};
};


/**
 * handle touch start events
 * @event touchStartHandler
 * @param {object} el element to check if in viewport
 * @param {object} h element to check if in viewport
 */
listViewScroll.prototype._inViewport = function (el, h) {
	var elH = el.offsetHeight,
		scrolled = this._scrollY(),
		viewed = scrolled + this._getViewportH(),
		elTop = this._getOffset(el).top,
		elBottom = elTop + elH;

	// if 0, the element is considered in the viewport as soon as it enters.
	// if 1, the element is considered in the viewport only when it's fully inside
	// value in percentage (1 >= h >= 0)
	h = h || 0;

	return (elTop + elH * h) <= viewed && (elBottom) >= scrolled;
};

/**
 * Keep visible sections in viewport
 * @fires - sectionInView
 * @fires - sectionOutView
 */
listViewScroll.prototype._scrollPage = function () {
	for (var x in this.options.sections) {
		if ((typeof this.options.sections[x] === 'object') && this._inViewport(this.options.sections[x], this.options.viewportFactor)) {
			classie.add(this.options.sections[x], this.options.animateClass);
			this.emit('sectionInView', x);
		}
		else if (typeof this.options.sections[x] === 'object') {
			// this add class init if it doesn't have it. This will ensure that the items initially in the viewport will also animate on scroll
			classie.add(this.options.sections[x], this.options.initClass);
			if (this.options.parentElement.scrollTop !== 0) {
				classie.remove(this.options.sections[x], this.options.animateClass);
			}
			this.emit('sectionOutView', x);
		}
	}

	this.didScroll = false;
};

module.exports = listViewScroll;

// If there is a window object, that at least has a document property,
// define Linotype
if (typeof window === 'object' && typeof window.document === 'object') {
	window.listViewScroll = listViewScroll;
}
