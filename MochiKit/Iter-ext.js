/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * @author Fredrik Blomqvist
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Iter_ext');

	goog.require('MochiKit.Base');
	goog.require('MochiKit.Iter');
}

MochiKit.Base._module('Iter_ext', '1.5', ['Base', 'Iter']);


/**
 * parent->child order (depth-first, preorder)
 * ref <a href="http://en.wikipedia.org/wiki/Tree_traversal">tree traversal</a>
 *
 * @param {*} rootNode
 * @param {function(*): !Iterable} getChildNodes should return an empty array if no children (ex: for dom traversal use <code>treePreOrderIter(dom, methodcaller('childNodes'));</code>)
 * @return {!Iterable}
 */
MochiKit.Iter.treePreOrder = function(rootNode, getChildNodes)
{
	var stack = [ rootNode ];

	return {
		repr: function() { return "treePreOrder(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			if (stack.length == 0)
				throw MochiKit.Iter.StopIteration;

			var node = stack.pop();

			// note: this should rather set a state and iterate this level instead of filling stack for less mem (stack) usage and "true" iterator behaviour.
			MochiKit.Iter.iextend(stack, getChildNodes(node));

			return node;
		}
	};
};


/**
 * top-down, breadth-first, level-order traversal (parent->siblings order)
 * ref <a href="http://en.wikipedia.org/wiki/Tree_traversal">tree traversal</a>
 * (could be seen as an iterator version of <a href="http://mochikit.com/doc/html/MochiKit/Base.html#fn-nodewalk">MochiKit.Base.nodeWalk()</a>)
 * useful for searching and culling
 * todo: create version taking a descend-predicate if used for culling
 * todo: hmm, would be nice to have some version that would indicate each level (callback?) (useful when doing searches for example)
 *
 * @param {*} rootNode
 * @param {function(*): !Iterable} getChildNodes should return an empty array if no children (ok? could add fallback ourselves also)
 * @return {!Iterable}
 */
MochiKit.Iter.treeLevelOrder = function(rootNode, getChildNodes)
{
	var queue = [ rootNode ];

	return {
		repr: function() { return "treeLevelOrder(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			if (queue.length == 0)
				throw MochiKit.Iter.StopIteration;

			var node = queue.shift();

			// note: this should rather set a state and iterate this level instead of filling stack for less mem usage and "true" iterator behaviour.
			MochiKit.Iter.iextend(queue, getChildNodes(node));

			return node;
		}
	};
};


/**
 * bottom-up iteration
 * ref <a href="http://en.wikipedia.org/wiki/Tree_traversal">tree traversal</a>
 * useful for pruning for example.
 *
 * @param {*} rootNode
 * @param {function(*): !Iterable} getChildNodes should return an empty array if no children (ok? could add fallback ourselves also)
 * @return {!Iterable}
 */
MochiKit.Iter.treePostOrder = function(rootNode, getChildNodes)
{
	var stack = [ [rootNode, false] ]; // [node, visited] (could use a queue also, only affects the order of nodes on each individual level)

	return {
		repr: function() { return "treePostOrder(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			while (true) { // loop until a visited node is returned or end of iteration
				if (stack.length == 0)
					throw MochiKit.Iter.StopIteration;

				var n = stack.pop(); // shift would work also
				if (n[1]) // visited?
					return n[0];
				// else
				n[1] = true;
				stack.push(n);

				MochiKit.Iter.iextend(stack, MochiKit.Iter.imap(
					function(node) { return [node, false]; },
					getChildNodes(n[0])
				));
			}
		}
	};
};


/**
 * @id MochiKit.Iter.pairView
 *
 * Pairwise view of an iterable (overlapping)
 * <tt>[a, b, c, d, ..] -> [[a,b],[b,c],[c,d], ..]</tt>
 *
 * todo: generalize to full n-tuples (fifo queue) and configurable start and end logic (offset, clamp, wraparound etc) (windowIter?)
 * todo: is logic for single elem ok? 1 elem iter: no wrap -> no result, wrap=true -> one [elem, elem] pair. should wrap case also return nothing?
 * note that this function _might have_ sideeffects, since it immediately extracts first element (could change implementation to do this on first .next call I guess?)
 *
 * @param {!Iterable} iterable
 * @param {boolean=} [wrapLast=false] optional, default false. if true, last pair will be: [last, first] elems
 * @return {!Iterable} sequence of two-elem Arrays
 */
MochiKit.Iter.pairView = function(iterable, wrapLast)
{
	wrapLast = wrapLast || false;

	var it = MochiKit.Iter.iter(iterable);

	// grab first element and handle case of empty input (mustn't throw StopIter until in the actual iter object)
	// (we do this stuff up-front to reduce amount of logic in the main iter .next below. hmm, or change this? not quite sure if one might expect any iter err to only show up on first .next?)
	try {
		var elem0 = it.next();
	} catch (e) {
		if (e != MochiKit.Iter.StopIteration)
			throw e;
		// return empty dummy iter that re-throws the StopIter
		return {
			next: function() {
				throw e;
			}
		};
	}

	if (wrapLast)
		it = MochiKit.Iter.chain(it, [ elem0 ]);

	return {
		repr: function() { return "pairView(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			var elem1 = it.next();
			var pair = [ elem0, elem1 ];
			elem0 = elem1;
			return pair;
		}
	};
};


/**
 * sliding-window iterator, generalized pairView
 * tood: decide on howto handle ending, need logic caese to handle clamping, wraparound etc (see pairView and wrapLast for example)
 * @param {!Iterable} iterable
 * @param {integer=} [windowSize=2] defaults to pair-size
 * @param {integer=} [stepSize=1]
 * @return {!Iterable.<!Array>}
 */
MochiKit.Iter.windowView = function(iterable, windowSize, stepSize)
{
	windowSize = windowSize || 2;
	stepSize = stepSize || 1;

	var it = MochiKit.Iter.iter(iterable);
	var win = [];

	// naive impementation. could add fast-path for Array input, if stepSize is "large" window should be rebuilt etc.
	return {
		repr: function() { return "windowView(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			if (win.length < windowSize) {
				// first call, fill window
				while (win.length < windowSize)
					win.push(it.next());
			} else {
				// slide
				for (var i = 0; i < stepSize; ++i) {
					win.shift();
					win.push(it.next());
				}
			}

			return win.slice();
		}
	};
};


/**
 * convenience in the common(?) case where you need to do a mapping
 * but also discard certain elements (when mapFn returns null/undefined)
 * todo: perhaps support an optional param that specifies which value should be considered "false"? (to allow -1 etc for example)
 *
 * @method filterMap
 * @param {!function(*): *} mapFn
 * @param {!Iterable} iterable
 * @return {!Iterable}
 */
MochiKit.Iter.filterMap = function(mapFn, iterable) // ok name? (not to confuse with a filter operation on a map(dictionary) object..)
{
	return MochiKit.Iter.ifilter(
		function(item) {
			return typeof item !== 'undefined' && item !== null;
		},
		MochiKit.Iter.imap(
			mapFn,
			iterable
		)
	);
};


/**
 * extract only the leaves
 * iterator vesion of MochiKit.Base.flattenArray
 */
MochiKit.Iter.iflattenArray = function(root)
{
	var queue = [ root ];

	return {
		repr: function() { return "iflattenArray(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			while (true) {
				if (queue.length == 0)
					throw MochiKit.Iter.StopIteration;

				var node = queue.shift();

				if (node instanceof Array) {
					Array.prototype.splice.apply(queue, [0, 0].concat(node)); // insert elements at front of queue, in-place.
				}
				else {
					return node;
				}
			}
		}
	};
};


/**
 * resembles Python's chain.from_iter
 * one level flattening of a sequence of iterables
 * generalized chain (intended for larger volumes, think nodes->values of a tree-structure).
 * Can be used to traverse grouby sequences: indirectChain(groupby([1,1,1,2,2,3,3]), function(v) { return v[1]; }) -> [1,1,1,2,2,3,3] i.e an inverse of the groupby)
 * @see http://docs.python.org/library/itertools.html#itertools.chain.from_iterable
 * @param {!Iterable.<!Iterable>} seq
 * @param {(function(*): !Iterable)=} [getIter] get second level iterator. optional, default iter. // todo: hmm, could skip this? could obtain using imap also
 * @return {!Iterable}
 */
MochiKit.Iter.chainFromIter = function(seq, getIter)
{
	getIter = getIter || MochiKit.Iter.iter;

	var it = MochiKit.Iter.iter(seq);
	var jt = null;

	return {
		repr: function() { return "chainFromIter(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			if (jt == null)
				jt = MochiKit.Iter.iter(getIter(it.next())); // wrap once more in iter since getIter might return an Array for example

			while (true) {
				try {
					var val = jt.next();
					return val;
				} catch (e) {
					if (e != MochiKit.Iter.StopIteration)
						throw e;
					jt = MochiKit.Iter.iter(getIter(it.next()));
				}
			}
		}
	};
};


/**
 * filters out adjacent equal elements.
 * kindof equivalent to: imap(function(v){ return v[0]; }, groupby(iterable))
 * @see http://www.sgi.com/tech/stl/unique.html
 * @param {!Iterable} iterable
 * @param {(function(*, *): boolean)=} [pred=eq]
 * @return {!Iterable}
 */
MochiKit.Iter.uniqueView = function(iterable, pred)
{
	pred = pred || MochiKit.Base.operator.eq;

	var it = MochiKit.Iter.iter(iterable);
	var first = true;
	var prev;

	return {
		repr: function() { return "uniqueView(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			if (first) {
				first = false;
				prev = it.next();
				return prev;
			}
			// todo: optimize by swapping impl by setting this.next?
			var val = it.next();
			while (pred(prev, val))
				val = it.next();
			prev = val;
			return val;
		}
	};
};


/**
 * todo: ! this version currently only supports two input sequences
 * resembles nested loops over the input sequences
 * @see http://docs.python.org/library/itertools.html#itertools.product
 * note: doesn't support the 'repeat' param that Python's version has
 * @param {!Iterable} iterable
 * @param {...!Iterable} var_args // ! observe that subsequent iterables must be _iterables_, Not _iterators_ so that the sequences can be "restarted"!
 * @return {!Iterable.<!Array>}
 * .. will Apple sue us for this name? ;)
 */
MochiKit.Iter.iproduct = function(iterable, var_args)
{
	// first impl. only supports two args
	var sa = arguments[0], sb = arguments[1];

	var it = MochiKit.Iter.iter(sa);
	var jt = null;

	var a, b;

	return {
		repr: function() { return "iproduct(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			while (true) {
				if (jt == null) {
					a = it.next();
					jt = MochiKit.Iter.iter(sb); // ! here we assume 'sb' will return a _new_ iterator to the beginning
				}

				try {
					b = jt.next();
					return [a, b];
				} catch (e) {
					if (e != MochiKit.Iter.StopIteration)
						throw e;
					jt = null;
				}
			}
		}
	};
};


/**
 * convenience wrapper for izip/count.
 * usage: forEach(enumerate(seq), function(i_val) { var i = i_val[0], val = i_val[1]; ... });
 * this is a very common request, FAQ I'd say
 * (a pity JS doesn't (yet?) have tuple unfolds in assignments)
 * @see http://docs.python.org/library/functions.html#enumerate
 * @param {!Iterable.<*>} iterable
 * @param {integer=} [start=0]
 * @return {!Iterable.<[integer, *]>}  iterator over [index, itervalue] pairs
 */
MochiKit.Iter.enumerate = function(iterable, start)
{
	return MochiKit.Iter.izip(MochiKit.Iter.count(start), iterable);
};


/**
 * useful convenience(?)
 * ... or will it just confuse? in a deeper iterator hierachy (nested) this might not do what the user believes, i.e the exception is caught earlier and interpreted wrongly..
 */
MochiKit.Iter.breakIt = function()
{
	throw MochiKit.Iter.StopIteration;
};


/**
 * @see http://docs.python.org/library/itertools.html#itertools.izip_longest
 * note: slightly different (I'd say better) handling of single and empty iterables compared to Python itertools
 * ex:
 * izipLongest([]) -> []
 * izipLongest([[]]) -> []
 * izipLongest([[1]]) -> [1], Not [1,fillValue]
 * i.e similar to MK.izip Not Python
 * @param {!Iterable.<!Iterable>} iterables
 * @param {*=} [fillValue=null]
 */
MochiKit.Iter.izipLongest = function(iterables, fillValue)
{
	fillValue = fillValue || null;
	iterables = MochiKit.Base.map(MochiKit.Iter.iter, iterables);
	var numActive = iterables.length;

	return {
		repr: function() { return "izipLongest(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			var result = new Array(iterables.length);
			for (var i = 0; i < iterables.length; ++i) {
				try {
					result[i] = iterables[i].next();
				} catch (e) {
					if (e != MochiKit.Iter.StopIteration)
						throw e;

					iterables[i] = MochiKit.Iter.repeat(fillValue);
					result[i] = fillValue;
					--numActive;
				}
			}
			if (numActive == 0)
				throw MochiKit.Iter.StopIteration;
			return result;
		}
	};
};


/**
 * alias for MochiKit.Iter.some (to match Python)
 */
MochiKit.Iter.any = MochiKit.Iter.some;

/**
 * alias for MochiKit.Iter.every (to match Python)
 */
MochiKit.Iter.all = MochiKit.Iter.every;


// todo: combinations, permutations, compress(?)


//--------------------------------


MochiKit.Iter_ext.__new__ = function() {
	// NOP ...
};


MochiKit.Iter_ext.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Iter); // ! since we add to the existing namespace we export it again here (ok?)
