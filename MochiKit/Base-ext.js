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

// following boost's convention of using 1-based indices
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


// todo: name?
// todo: should use same convention for allowing detection and un-binding as MochiKit.Base.bind
// only other javascript reference I found was: http://gfaraj.wordpress.com/2008/01/18/boostbind-ala-javascript/

/**
 * @see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html
 * @param {!Function} fn
 * @param {...*} var_args
 * @return {!Function}
 */
MochiKit.Base.lambda = function(func, var_args) // or just "bind2"?
{
	// precompute mapping table. use hardcoded closures for speed (?)
	// todo: could detect some common cases and return custom case code paths (i.e bind without placeholders -> "old bind" etc)
	// todo: or is this optimization worth it? skipping this allows simpler handling of re-binding case, can use logic very similar to "old" bind and be compatible(?)

	var argmap = [];
	var allowTrailingArgs = true;
	for (var i = 1; i < arguments.length; ++i) {
		var a = arguments[i];

		if (i == 1 && a instanceof _context) {
			func = MochiKit.Base.bind(func, a.context);
		}
		else
		if (a instanceof MochiKit.Base._arg_placeholder) { // or use a.constructor == _arg_placeholder? (todo: profile)
			// todo: should we range check? (I'd say not)
			argmap.push((function(idx) {
				return function() {
					return arguments[idx];
				};
			})(a.index));
			allowTrailingArgs = false; // ok?
		}
		else // see the "protect" function if you don't want this expansion to occur
		if (typeof a == 'function' && (a._is_bound || a.im_func)) { // detects existing mochikit.bind also! (todo: should rather use same signature but then we must make sure compatibility)
			argmap.push((function(bf) {
				return function() {
					return bf.apply(this, arguments); // recurse!
				};
			})(a));
			allowTrailingArgs = false; // ok?
		} else {
			// default, store input arg (or handle this even more special cased?)
			argmap.push((function(arg) {
				return function() {
					return arg;
				};
			})(a));
		}
	}

	var newfunc = function(/* arguments */) {
		var args = [];
		for (var i = 0; i < argmap.length; ++i)	{
			args.push(argmap[i].apply(this, arguments));
		}
		if (allowTrailingArgs) for (var j = i; j < arguments.length; ++j) {
			args.push(arguments[j]);
		}
		return func.apply(this, args);
	};

	newfunc._is_bound = true; // tag ourself as bound

	return newfunc;
}

//-----------------------


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
	} else  {
		im_preargs = im_preargs.slice();
	}
	m.extend(im_preargs, arguments, 2);

	var newfunc = function () {
		var me = arguments.callee;
		var self = me.im_self;
		if (!self) {
			self = this;
		}

		var args = [];
		if (me.im_preargs.length > 0) {
			var imax = 0;
			for (var i = 0; i < me.im_preargs.length; ++i) {
				var pa = me.im_preargs[i];
				if (pa instanceof MochiKit.Base._arg_placeholder) {
					imax = Math.max(imax, pa.index + 1);
					pa = arguments[pa.index];
				} else
				if (typeof pa == 'function' && pa.im_func) {
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


//---------------------------------

/**
 * simple wrapper to mask the fact that a fn is bound.
 * to be used in cases where you don't want to evaluate a nested bind
 * @see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds
 *
 * @param {!Function}
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
 * @param {!Function}
 * @param {...*} var_args
 * return ...
 */
function apply(fn, var_args) // todo: name.. NS!
{
	// or return a wrapper fn..?

	var args = MochiKit.Base.extend([], arguments, 1);
	return arguments[0].apply(this, args);
}


/**
 * experiment in creating a special-purposed _parameter_ object
 * that indicates context, 'self/this'. Mostly to help syntax.
 * todo: test variant that binds function+context in pair/tuple-object?
 * @private
 * @constructor
 * @param {Object} context
 */
function _context(context) // todo: NS!
{
	/** @type {Object} */
	this.context = context;
}

/**
 * factory to remove need for "new" in the expressions
 * @param {Object} context
 * @return {!_context}
 */
function context(context) // todo: NS!
{
	return new _context(context);
}

//-----------


/**
 * Shuffles an array using the Fisher-Yates algorithm (Knuth). O(N)
 * in-place algorithm. (todo: a functional version?)
 *
 * @see http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * Thou shalt not shuffle using a random comparator!
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
