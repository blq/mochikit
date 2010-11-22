/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * @author Fredrik Blomqvist
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
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
// todo: could perhaps put these in an optional block? and expose the placeholder class to allow users to create their own.
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
 * internal helper for bind2
 * todo: perhaps generalize to a visit interface? http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#visit_each
 * @private
 * @param {!Array} im_preargs
 * @param {!Array} args
 * @param {!Object=} [filledSlots]
 * @return {!Object} dictionary of which empty slot indices that were used by args
 */
MochiKit.Base._rebind_preargs = function(im_preargs, args, filledSlots)
{
	filledSlots = filledSlots || {}; // should only be empty on first, non recursive, entry.

	// fill any placeholder prearg slots
	for (var i = 0; i < im_preargs.length; ++i) {
		var pa = im_preargs[i];
		if (pa instanceof MochiKit.Base._arg_placeholder) {
			if (pa.index < args.length) {
				im_preargs[i] = args[pa.index];
				filledSlots[pa.index] = pa.index;
			}
			// ..else? (see "discussion" below)
		} else
		if (typeof pa == 'function' && typeof pa.im_func == 'function') { // == isBoundFunction
			MochiKit.Base._rebind_preargs(pa.im_preargs, args, filledSlots); // recurse nested binds
		}
	}
	return filledSlots;
};

/**
 * should be fully compatible with the existing bind! passes all existing bind() test + my placeholder tests
 * (though not optimized)
 * @param {!Function|string} func
 * @param {Object|undefined} self
 * @param {...*} var_args
 * @return {!Function}
 */
MochiKit.Base.bind2 = function (func, self, var_args)
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

	var args = Array.prototype.slice.call(arguments, self instanceof m._arg_placeholder ? 1 : 2);

	var filledSlots = MochiKit.Base._rebind_preargs(im_preargs, args);
	// remove possibly filled placeholders (need to remove afterwards to not mess up indices)
	for (var index in filledSlots) {
		args.splice(filledSlots[index], 1);
	}
	// todo: remaining more or less subtle issues to be decided on and tested:
	// 1. shouldn't we decrement indices for remaining slots? keep track of min/max?
	// 2. what about gaps between slots? store counter to nr of args bound? (even if they won't be used due to gaps)
	// 3. what should calling a function with less args than the slots indicate mean? throw? undefined?
	// todo: dig deeper into how Boost bind handles these cases.
	m.extend(im_preargs, args);

	// todo: could easily optimize a fast path version (i.e identical to existing bind) here in the case no placeholders were used
	var newfunc = function () {
		var me = arguments.callee;
		var self = me.im_self;
		if (!self) {
			self = this;
		}

		// todo: profile this, could precalculate (as the previous experimental impl did) the placeholders and nested bind etc but need to be sure it's worth it.
		// (also shouldn't forget this impl. which doesn't use "naive" nested closures might be faster by default!)
		var args = [];
		if (me.im_preargs.length > 0) {
			var imax = 0;
			for (var i = 0; i < me.im_preargs.length; ++i) {
				var pa = me.im_preargs[i];
				if (pa instanceof m._arg_placeholder) {
					imax = Math.max(imax, pa.index + 1);
					pa = arguments[pa.index];
				} else
				if (typeof pa == 'function' && typeof pa.im_func == 'function') { // == isBoundFunction
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

		if (self instanceof m._arg_placeholder)
			self = arguments[self.index];

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


/**
 * ...
 * @param {...*} var_args
 */
MochiKit.Base.partial2 = function(func, var_args)
{
	var m = MochiKit.Base;
	return m.bind2.apply(this, m.extend([func, undefined], arguments, 1));
};

/**
 * ...
 * @param {...*} var_args
 */
MochiKit.Base.method2 = function(self, func, var_args)
{
	var m = MochiKit.Base;
	return m.bind2.apply(this, m.extend([func, self], arguments, 2));
};

/**
 * ...
 * @param {...*} var_args
 */
MochiKit.Base.bindLate2 = function(func, self, var_args)
{
	var m = MochiKit.Base;
	var args = arguments;
	if (typeof(func) === "string") {
		args = m.extend([m.forwardCall(func)], arguments, 1);
		return m.bind2.apply(this, args);
	}
	return m.bind2.apply(this, args);
};


/**
 * name too similar to ES5?
 * @param {!Function} fn
 * @return {boolean}
 */
MochiKit.Base.isBoundFunction = function(fn)
{
	return typeof fn == 'function' && typeof fn.im_func == 'function'; // && fn.im_preargs != 'undefined' ?
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
MochiKit.Base.protect = function(boundFn)
{
	return function() {
		return boundFn.apply(this, arguments);
	};
};


/**
 * assumes first arg is a function, calls it with the rest of the arguments applied.
 * @see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds
 *
 * @param {!Function} fn
 * @param {...*} var_args
 * return ...
 */
MochiKit.Base.apply = function(fn, var_args) // todo: name.. dangerous.
{
	// or return a wrapper fn..?

	var args = MochiKit.Base.extend([], arguments, 1);
	return fn.apply(this, args);
};



//-----------


/**
 * in-place partitioning (not stable). O(N)
 * @see http://en.wikipedia.org/wiki/Quicksort
 * @param {!Array} array
 * @param {?(function(*, *): boolean)=} [cmp=<] ordering, default <  (or allow acomplete comparator with -1, 0, +1 return?)
 * @param {integer=} [left=0]
 * @param {integer=} [right=array.length-1]
 * @param {(integer|Function)=} [pivotIndex=middle] // or move this to an optional pickPivot(array, left, right) function?
 * @return {integer} location of the pivot element
 */
MochiKit.Base.partition = function(array, cmp, left, right, pivotIndex)
{
	cmp = cmp || MochiKit.Base.operator.cle; // or clt?
	left = left || 0;
	right = right || array.length - 1;
	pivotIndex = pivotIndex || (left + Math.floor((right - left) / 2)); // middle elem, could use median of three, random etc

	function swap(i, j) {
		var tmp = array[i];
		array[i] = array[j];
		array[j] = tmp;
	}

	var pivotValue = array[pivotIndex];
	swap(pivotIndex, right); // move pivot to end

	var storeIndex = left;
	for (var i = left; i <= right; ++i) {
		if (cmp(array[i], pivotValue)) {
			swap(i, storeIndex);
			++storeIndex;
		}
	}

	swap(storeIndex, right); // move pivot to its final place
	return storeIndex;
};


// todo: stablePartition, binarySearch, stableSort, unique, partialSort, setUnion, setIntersection, setSymmetricDifference etc

/**
 * @param {!Function} cmp
 * @return {!Function}
 */
MochiKit.Base.negateComparator = function(cmp)
{
	return function() {
		return -1 * cmp.apply(this, arguments);
	};
};


//------------------


MochiKit.Base_ext.__new__ = function() {
	// NOP ...
};


MochiKit.Base_ext.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Base); // ! since we add to the existing namespace we export it again here (ok?)
