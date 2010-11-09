/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * @author Fredrik Blomqvist
 *
 */

if (typeof goog != 'undefined' && typeof goog.base == 'function') {
	goog.provide('MochiKit.Base_ext');

	goog.require('MochiKit.Base');
}

MochiKit.Base._module('Base_ext', '1.5', ['Base']);

/**
 * @private
 * @constructor
 * @param {integer} index
 */
MochiKit.Base._arg_placeholder = function(index)
{
	/** @type {integer} */
	this.index = index;
};

// following Boost's convention of using 1-based indices
// todo: decide on placeholder name. (@1, #1, $1 €1, p1 ?!)
/** @const */
var _1 = new MochiKit.Base._arg_placeholder(0);
/** @const */
var _2 = new MochiKit.Base._arg_placeholder(1);
/** @const */
var _3 = new MochiKit.Base._arg_placeholder(2);
/** @const */
var _4 = new MochiKit.Base._arg_placeholder(3);
/** @const */
var _5 = new MochiKit.Base._arg_placeholder(4);
/** @const */
var _6 = new MochiKit.Base._arg_placeholder(5);
/** @const */
var _7 = new MochiKit.Base._arg_placeholder(6);
/** @const */
var _8 = new MochiKit.Base._arg_placeholder(7);
/** @const */
var _9 = new MochiKit.Base._arg_placeholder(8);
/** @const */
var _10 = new MochiKit.Base._arg_placeholder(9);
// ...



/**
 * should be fully compatible with the existing bind! passes all existing bind() test + my placeholder tests
 * (though not optimized)
 */
MochiKit.Base.bind2 = function (func, self/* args... */)
{
	if (typeof(func) == "string") {
		func = self[func];
	}
	var im_func = func.im_func;
	var im_preargs = func.im_preargs;
	var im_self = func.im_self;
	var m = MochiKit.Base;
	if (typeof(func) == "function" && typeof(func.apply) == "undefined") {
		// this is for cases where JavaScript sucks ass and gives you a
		// really dumb built-in function like alert() that doesn't have
		// an apply
		func = m._wrapDumbFunction(func);
	}
	if (typeof(im_func) != 'function') {
		im_func = func;
	}
	if (typeof(self) != 'undefined') {
		im_self = self;
	}
	if (typeof(im_preargs) == 'undefined') {
		im_preargs = [];
	} else {
		im_preargs = im_preargs.slice();
	}
	// fill any placeholder prearg slots
	var filledSlots = {}; // dictionary of placeholder slots being filled
	var args = Array.prototype.slice.call(arguments, 2);
	for (var i = 0; i < im_preargs.length; ++i) {
		var pa = im_preargs[i];
		if (pa instanceof m._arg_placeholder) {
			if (pa.index < args.length) {
				im_preargs[i] = args[pa.index];
				filledSlots[pa.index] = pa.index;
			}
			// ..else? (see "discussion" below)
		}
	}
	// remove possibly filled placeholders (need to remove afterwards to not mess up indices)
	for (var index in filledSlots) {
		args.splice(filledSlots[index], 1);
	}
	// todo: remaining more or less subtle issues to be decided on and tested:
	// 1. shouldn't we decrement indices for remaining slots? keep track of min/max?
	// 2. what about gaps between slots? store counter to nr of args bound? (even if they won't be used due to gaps)
	// 3. what should calling a function with less args than the slots indicate mean? throw? undefined?
	// 4. you re-bind with another placeholder? collision? mixing?
	// 5. shouldn't re-binding examine possibly nested binds also and handle their slots same way?
	// todo: dig deeper into how Boost bind handles these cases.
	m.extend(im_preargs, args);

	var newfunc = function () {
		var me = arguments.callee;
		var self = me.im_self;
		if (!self) {
			self = this;
		}

		// todo: profile this, could precalculate (as the previous experimental imple did) the placeholders and nested bind etc but need to be sure it's worth it.
		// (also shouldn't forget this impl. which doesn't use "naive" nested closures might be faster by default)
		var args = [];
		if (me.im_preargs.length > 0) {
			var imax = 0;
			for (var i = 0; i < me.im_preargs.length; ++i) {
				var pa = me.im_preargs[i];
				if (pa instanceof m._arg_placeholder) {
					imax = Math.max(imax, pa.index + 1);
					pa = arguments[pa.index];
				} else
				if (typeof pa == 'function' && typeof pa.im_func == 'function') {
					pa = pa.apply(self, arguments); // recurse for nested evaluation!
				}
				args.push(pa);
			}
			for (var j = imax; j < arguments.length; ++j) {
				args.push(arguments[j]);
			}
		} else {
			args = arguments;
		}

		return me.im_func.apply(self, args);
	};

	newfunc.im_self = im_self;
	newfunc.im_func = im_func;
	newfunc.im_preargs = im_preargs;
	if (typeof(im_func.NAME) == 'string') {
		newfunc.NAME = "bind2(" + im_func.NAME + ",...)";
	}
	return newfunc;
};


MochiKit.Base.partial2 = function(func)
{
	var m = MochiKit.Base;
	return m.bind2.apply(this, m.extend([func, undefined], arguments, 1));
};

MochiKit.Base.method2 = function(self, func)
{
	var m = MochiKit.Base;
	return m.bind2.apply(this, m.extend([func, self], arguments, 2));
};

MochiKit.Base.bindLate2 = function(func, self/* args... */)
{
	var m = MochiKit.Base;
	var args = arguments;
	if (typeof(func) === "string") {
		args = m.extend([m.forwardCall(func)], arguments, 1);
		return m.bind2.apply(this, args);
	}
	return m.bind2.apply(this, args);
};

//---------------------------------

/**
 * simple wrapper to mask the fact that a fn is bound.
 * to be used in cases where you don't want to evaluate a nested bind
 * @see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds
 *
 * @param {!Function} boundFn
 * @return {!Function}
 */
function protect(boundFn) // todo: NS!
{
	return function() {
		return boundFn.apply(this, arguments);
	};
}


/**
 * assumes first arg is a function, calls it with the rest of the arguments applied.
 * @see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds
 *
 * @param {!Function} fn
 * @param {...*} var_args
 * return ...
 */
function apply(fn, var_args) // todo: name.. NS!
{
	// or return a wrapper fn..?

	var args = MochiKit.Base.extend([], arguments, 1);
	return arguments[0].apply(this, args);
}



//-----------


/**
 * Shuffles an array using the Fisher-Yates algorithm (Knuth). O(N)
 * in-place algorithm. (todo: a functional version?)
 *
 * @see http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * Thou shalt not shuffle by sorting using a random comparator!
 * - You don't want to make same mistake M$ did ;) http://www.robweir.com/blog/2010/02/microsoft-random-browser-ballot.html
 *
 * todo: take optional range, start & end, indices?
 * todo: create an iterator based impl. ishuffle
 * todo: take a custom getter and setter funcs instead of just whole elem swaps?
 * todo: support a generator?
 *
 * @id MochiKit.Base.shuffle
 * @param {!Array} values
 * @return {!Array} chained, values array shuffled
 */
MochiKit.Base.shuffleArray = function(values)
{
	// Durstenfeld's algorithm
	for (var i = values.length - 1; i > 0; --i) {
		var j = Math.floor(Math.random() * (i + 1));
		// swap elems at i and j
		var tmp = values[i];
		values[i] = values[j];
		values[j] = tmp;
	}
	return values; // ok? enable chaining
};


/**
 * Generates a unique random range of numbers from 0..N-1 (or rather f(0)..f(N-1) ) (no number occurs twice) (think dealing a deck of cards)
 * O(N)
 *
 * todo: create an iterator based impl? (needs a quite different algo though, using a specific rand method)
 * todo: create an in-place version (taking an array)?
 *
 * @id MochiKit.Base.deal
 * @param {integer} numItems
 * @param {Function=} [func] Optional. function receiving the index.nr and producing a result. default identity.
 * @return {!Array}
 */
MochiKit.Base.deal = function(numItems, func)
{
	func = func || MochiKit.Base.operator.identity; // default pass-through, function(i) { return i; }

	var deck = new Array(numItems);

	for (var i = 0; i < numItems; ++i) {
		var j = Math.floor(Math.random() * (i + 1));
		deck[j] = func(i);
		deck[i] = deck[j];
	}

	return deck;
};


// todo: partition, binarySearch, isSorted, stableSort, unique, partialSort, setUnion, setIntersection, setSymmetricDifference etc

MochiKit.Base_ext.__new__ = function() {
	// NOP ...
};


MochiKit.Base_ext.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Base); // ! since we add to the existing namespace we export it again here (ok?)
