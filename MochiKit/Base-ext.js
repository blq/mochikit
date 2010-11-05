/**
 *
 * @author Fredrik Blomqvist
 *
 */

if (typeof(goog) != 'undefined' && typeof goog.base == 'function') {
	goog.provide('MochiKit.Base_ext');

	goog.require('MochiKit.Base');
}

MochiKit.Base._module('Base_ext', '1.5', ['Base']);

/**
 * @private
 * @constructor
 * @param {integer} index
 */
function _arg_placeholder(index)
{
	/** @type {integer} */
	this.index = index;
}

// todo: decide on placeholder name. (@1, #1, $1 €1, p1 ?!)
/** @const */
var _1 = new _arg_placeholder(0);
/** @const */
var _2 = new _arg_placeholder(1);
/** @const */
var _3 = new _arg_placeholder(2);
/** @const */
var _4 = new _arg_placeholder(3);
/** @const */
var _5 = new _arg_placeholder(4);
/** @const */
var _6 = new _arg_placeholder(5);
/** @const */
var _7 = new _arg_placeholder(6);
/** @const */
var _8 = new _arg_placeholder(7);
/** @const */
var _9 = new _arg_placeholder(8);
/** @const */
var _10 = new _arg_placeholder(9);
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
MochiKit.Base.lambda = function(func, var_args)
{
	// precompute mapping table. use hardcoded closures for speed (?)
	// todo: could detect some common cases and return custom case code paths (i.e bind with not placeholders ("old bind") etc)

	var argmap = [];
	var allowTrailingArgs = true;
	for (var i = 1; i < arguments.length; ++i)
	{
		var a = arguments[i];

		if (i == 1 && a instanceof _context)
		{
			func = MochiKit.Base.bind(func, a.context);
		}
		else
		if (a instanceof _arg_placeholder) // or use a.constructor == _arg_placeholder? (todo: profile)
		{
			// todo: should we range check? (I'd say not)
			argmap.push((function(idx) {
				return function() {
					return arguments[idx];
				};
			})(a.index));
			allowTrailingArgs = false; // ok?
		}
		else // see the "protect" function if you don't want this expansion to occur
		if (typeof a == 'function' && (a._is_bound || a.im_func)) // detects existing mochikit.bind also! (todo: should rather use same signature but then we must make sure compatibility)
		{
			argmap.push((function(bf) {
				return function() {
					return bf.apply(this, arguments); // recurse!
				};
			})(a));
			allowTrailingArgs = false; // ok?
		}
		else
		{
			// default, store input arg (or handle this even more special cased?)
			argmap.push((function(arg) {
				return function() {
					return arg;
				};
			})(a));
		}
	}

	var newfunc = function(/* arguments */)
	{
		var args = [];
		for (var i = 0; i < argmap.length; ++i)
		{
			args.push(argmap[i].apply(this, arguments));
		}
		if (allowTrailingArgs) for (var j = i; j < arguments.length; ++j)
		{
			args.push(arguments[j]);
		}
		return func.apply(this, args);
	};

	newfunc._is_bound = true; // tag ourself as bound

	return newfunc;
}

//------


/**
 * simple wrapper to mask the fact that a fn is bound.
 * to be used in cases where you don't want to evaluate a nested bind
 * @see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds
 *
 * @param {!Function}
 * @return {!Function}
 */
function protect(boundFn)
{
	return function()
	{
		return boundFn.apply(this, arguments);
	};
}


/**
 * assumes first arg is a function,
 * calls it with the rest of the arguments applied.
 * @see http://www.boost.org/doc/libs/1_44_0/libs/bind/bind.html#nested_binds
 *
 * @param {!Function}
 * @param {...*} var_args
 * return ...
 */
function apply(fn, var_args)
{
	// or return a wrapper fn..?

	var args = MochiKit.Base.extend([], arguments, 1);
	return arguments[0].apply(this, args);
}


/**
 * @private
 * @constructor
 * @param {Object} context
 */
function _context(context)
{
	/** @type {Object} */
	this.context = context;
}

/**
 * factory to remove need for "new" in the expressions
 * @param {Object} context
 * @return {!_context}
 */
function context(context)
{
	return new _context(context);
}



MochiKit.Base_ext.__new__ = function()
{
	// NOP ...
};


MochiKit.Base_ext.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Base); // ! since we add to the existing namespace we export it again here (ok?)
