/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * @author Fredrik Blomqvist
 *
 * @fileoverview
 * Extends MochiKit.Iter with many other iterator helpers. Mostly inspired from Python's itertools and C++'s STL.
 *
 * for JavaScript's own take on this:
 * @see https://developer.mozilla.org/en/New_in_JavaScript_1.7#Iterators
 * i.e exactly same pattern (but with possibly the 'yield' keyword). (Also might problematic with the type of the StopIter object also..)
 *
 * todo: rewrite many iterators to not use closures for better debugging and inspection? (might need to explicitly bind .next to still allow aliasing .next?)
 * todo: see if possible to be compatible with hypotetical JS 1.7 iterator code?
 *
 * good article that systematically describes the recursion -> loop transform needed for iterators.
 * @see http://www.codeproject.com/Articles/418776/How-to-replace-recursive-functions-using-stack-and
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Iter_ext');

	goog.require('MochiKit.Base');
	goog.require('MochiKit.Iter');
}

MochiKit.Base.module(MochiKit, 'Iter_ext', '1.5', ['Base', 'Iter']);


/**
 * parent->child order (depth-first, preorder)
 * ref <a href="http://en.wikipedia.org/wiki/Tree_traversal">tree traversal</a>
 *
 * @param {*} rootNode
 * @param {function(*): !Iterable} getChildNodes should return an empty array if no children (ex: for DOM traversal use <code>treePreOrderIter(dom, methodcaller('childNodes'));</code>)
 * @return {!Iterable}
 */
MochiKit.Iter.treePreOrder = function(rootNode, getChildNodes) {
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
MochiKit.Iter.treeLevelOrder = function(rootNode, getChildNodes) {
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
MochiKit.Iter.treePostOrder = function(rootNode, getChildNodes) {
	var stack = [ [rootNode, false] ]; // [node, visited] (could use a queue also, only affects the order of nodes on each individual level)

	return {
		repr: function() { return "treePostOrder(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			while (true) { // loop until a visited node is returned or end of iteration
				if (stack.length == 0)
					throw MochiKit.Iter.StopIteration;

				var n = stack.pop(); // shift (queue) would work also
				if (n[1]) // visited?
					return n[0];
				// else
				n[1] = true; // mark as visited
				stack.push(n);

				MochiKit.Iter.iextend(stack, MochiKit.Iter.imap(
					function(node) { return [node, false]; },
					getChildNodes(n[0]) // add '|| []' here to allow null?
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
 * todo: is logic for single elem ok? 1 elem iter: no wrap -> no result, wrap=true -> one [elem, elem] pair. should wrap case also return nothing?
 * note that this function might have sideeffects, since it immediately extracts first element (could change implementation to do this on first .next call I guess?)
 *
 * todo: currently only reason to keep this instead of forwarding to windowView is the 'wrapLast' option.
 *
 * @param {!Iterable} iterable
 * @param {boolean=} [wrapLast=false] optional, default false. if true, last pair will be: [last, first] elems
 * @return {!Iterable} sequence of two-elem Arrays
 */
MochiKit.Iter.pairView = function(iterable, wrapLast) {
	wrapLast = wrapLast || false;

	var it = MochiKit.Iter.iter(iterable);

	// grab first element and handle case of empty input (mustn't throw StopIter until in the actual iter object)
	// (we do this stuff up-front to reduce amount of logic in the main iter .next below)
	// todo: hmm, change/remove this? one might correctly expect any iter err to only show up on first .next I'd say!
	try {
		var elem0 = it.next();
	} catch (e) {
		if (e != MochiKit.Iter.StopIteration)
			throw e;
		// return empty dummy iter that re-throws the StopIter
		return MochiKit.Iter.EmptyIter;
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
 * todo: decide on howto handle ending, need logic case to handle clamping, wraparound etc (see pairView and wrapLast for example)
 * todo: more configurable start and end logic (offset, clamp, wraparound etc)
 * @param {!Iterable} iterable
 * @param {integer=} [windowSize=2] defaults to pair-size
 * @param {integer=} [stepSize=1]
 * @return {!Iterable.<!Array>}
 */
MochiKit.Iter.windowView = function(iterable, windowSize, stepSize) {
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
 * todo: ok name? (ifilterMap?) ! not to confuse with a filter operation on a map(dictionary) object..
 *
 * @param {!function(*): *} mapFn
 * @param {!Iterable} iterable
 * @param {Function=} [isTrue=undefined|null]
 * @return {!Iterable}
 */
MochiKit.Iter.filterMap = function(mapFn, iterable, isTrue) {
	isTrue = isTrue || function(item) { return typeof item !== 'undefined' && item !== null; };
	return MochiKit.Iter.ifilter(isTrue, MochiKit.Iter.imap(mapFn, iterable));
};


/**
 * extract only the leaves
 * iterator vesion of MochiKit.Base.flattenArray
 * @param {!ArrayLike} root
 * @return {!Iterable}
 */
MochiKit.Iter.iflattenArray = function(root) {
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
				} else {
					return node;
				}
			}
		}
	};
};


/**
 * resembles Python's chain.from_iterable
 * one level flattening of a sequence of iterables
 * generalized chain (intended for larger volumes, think nodes->values of a tree-structure).
 * Can be used to traverse grouby sequences: indirectChain(groupby([1,1,1,2,2,3,3]), function(v) { return v[1]; }) -> [1,1,1,2,2,3,3] i.e an inverse of the groupby)
 * @see http://docs.python.org/library/itertools.html#itertools.chain.from_iterable
 * @param {!Iterable.<!Iterable>} seq
 * @param {(function(*): !Iterable)=} [getIter] get second level iterator. optional, default iter. // todo: hmm, could skip this? could obtain using imap also
 * @return {!Iterable}
 */
MochiKit.Iter.chainFromIter = function(seq, getIter) {
	getIter = getIter || MochiKit.Iter.iter;

	var it = MochiKit.Iter.iter(seq);
	var jt = null;

	return {
		repr: function() { return "chainFromIter(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			if (jt == null)
				jt = MochiKit.Iter.iter(getIter(it.next())); // wrap once more in iter since getIter might return an Array for example (ok? or demand iter?)

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
 * @param {(function(*, *): boolean)=} [pred=ceq]
 * @return {!Iterable}
 */
MochiKit.Iter.uniqueView = function(iterable, pred) {
	pred = pred || MochiKit.Base.operator.ceq;

	var it = MochiKit.Iter.iter(iterable);
	var first = true;
	var prev;

	return {
		repr: function() { return "uniqueView(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		// fold-iteration
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
MochiKit.Iter.iproduct = function(iterable, var_args) {
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
 *
 * @see http://docs.python.org/library/functions.html#enumerate
 * @param {!Iterable.<*>} iterable
 * @param {integer=} [start=0]
 * @return {!Iterable.<[integer, *]>}  iterator over [index, itervalue] pairs
 */
MochiKit.Iter.enumerate = function(iterable, start) {
	return MochiKit.Iter.izip(MochiKit.Iter.count(start), iterable);
};


/**
 * useful convenience(?)
 * ... or will it just confuse? in a deeper iterator hierachy (nested) this might
 * not do what the user believes, i.e the exception is caught earlier and interpreted wrongly..
 */
MochiKit.Iter.breakIt = function() {
	throw MochiKit.Iter.StopIteration;
};

/**
 * @type {!Iterable}
 * @const
 */
MochiKit.Iter.EmptyIter = {
	repr: function() { return "EmptyIter"; },
	toString: MochiKit.Base.forwardCall("repr"),
	next: MochiKit.Iter.breakIt
};


/**
 * @see http://www.sgi.com/tech/stl/generate_n.html
 *
 * @param {!Function} genFn
 * @param {integer} n
 * @return {!Iterable} genFn applied n times
 */
MochiKit.Iter.generateN = function(genFn, n) {
	return MochiKit.Iter.imap(function() { return genFn(); }, MochiKit.Iter.range(n)); // we wrap genFn to make sure the arity of the call isn't disturbed by imap+range
};


/**
 * @see http://docs.python.org/library/itertools.html#itertools.izip_longest
 * note: slightly different (I'd say better) handling of single and empty iterables compared to Python itertools
 * ex:
 * izipLongest([]) -> []
 * izipLongest([[]]) -> []
 * izipLongest([[1]]) -> [1], Not [1,fillValue]
 * i.e similar to MK.izip Not Python
 *
 * @param {!Iterable.<!Iterable>} iterables
 * @param {*=} [fillValue=null]
 * @return {!Iterable}
 */
MochiKit.Iter.izipLongest = function(iterables, fillValue) {
	fillValue = fillValue || null;
	iterables = MochiKit.Base.map(MochiKit.Iter.iter, iterables);
	var numActive = iterables.length;

	return {
		repr: function() { return "izipLongest(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			var result = new Array(iterables.length); // could push also but I pretend this is more efficient here(?)
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
 * @see http://docs.python.org/library/functions.html#any
 */
MochiKit.Iter.any = function(/*iterable, func*/) {
	// wrapped so that load order of Iter.js and this file doesn't matter
	return MochiKit.Iter.some.apply(this, arguments);
};

/**
 * alias for MochiKit.Iter.every (to match Python)
 * @see http://docs.python.org/library/functions.html#all
 */
MochiKit.Iter.all = function(/*iterable, func*/) {
	return MochiKit.Iter.every.apply(this, arguments);
};

/**
 * alias for MochiKit.Iter.applymap (to match Python)
 * @see http://docs.python.org/library/itertools.html#itertools.starmap
 */
MochiKit.Iter.starmap = function(/*fun, seq, self*/) {
	return MochiKit.Iter.applymap.apply(this, arguments);
};


/**
 * @see http://www.sgi.com/tech/stl/advance.html
 * (Python example in itertools calls this "consume")
 *
 * @param {!{ next: !Function }} iter iterator, Not iterable
 * @param {integer} n  >= 0  (todo: default to 1? == next)
 * @return {!{ next: !Function }} iter advanced n steps
 */
MochiKit.Iter.advance = function(iter, n) {
	while (n-- > 0)
		iter.next();
	return iter;
};


/**
 * ok place..?
 * @param {!Iterable} iterable
 * @param {Function=} [cmp=cle]
 * @return {boolean}
 */
MochiKit.Iter.isSorted = function(iterable, cmp) {
	return MochiKit.Iter.every(MochiKit.Iter.windowView(iterable), cmp || MochiKit.Base.operator.cle);
};


/**
 * interleave([a, b, c], [1, 2, 3], [x, y, z]) -> a, 1, z, b, 2, y, c, 3, z
 * @param {!Iterable} iterable
 * @param {...!Iterable} var_args
 * @return {!Iterable}
 */
MochiKit.Iter.interleave = function(iterable, var_args) {
	return MochiKit.Iter.chainFromIter(MochiKit.Iter.izip.apply(this, arguments));
};


/**
 * re-maps lst based on indices in index. kind of permutation.
 * @see http://www.boost.org/doc/libs/1_45_0/libs/iterator/doc/permutation_iterator.html
 * @see http://www.boost.org/doc/libs/1_45_0/libs/iterator/doc/indirect_iterator.html
 *
 * @param {!Iterable} index todo: allow fns here? (mapping->index)
 * @param {!ArrayLike} lst
 * @return {!Iterable} [lst[i0], lst[i1], ...lst[iN]]
 */
MochiKit.Iter.remapView = function(index, lst) {
	return MochiKit.Iter.imap(MochiKit.Base.partial(MochiKit.Base.operator.getitem, lst), index);
};


/**
 * compress([A,B,C,D,E,F], [1,0,1,0,1,1]) --> A, C, E, F
 * @see http://docs.python.org/library/itertools.html#itertools.compress
 *
 * @param {!Iterable} data
 * @param {!Iterable} selectors
 * @return {!Iterable}
 */
MochiKit.Iter.compressIter = function(data, selectors) {
	return MochiKit.Iter.imap(
		function(d_s) {
			return d_s[0];
		},
		MochiKit.Iter.ifilter(
			function(d_s) {
				return d_s[1] ? true : false;
			},
			MochiKit.Iter.izip(data, selectors)
		)
	);
};


/**
 * @see http://docs.python.org/library/itertools.html#itertools.combinations
 * ex: combinations('ABCD', 2) --> AB AC AD BC BD CD
 * impl. follows the Python example reference.
 *
 * @param {!Iterable} iterable Note: must be an iterable, Not an iterator.
 * @param {integer} r
 * @return {!Iterable}
 */
MochiKit.Iter.combinations = function(iterable, r) {
	var m = MochiKit, mi = MochiKit.Iter;

	var pool = mi.list(iterable);
	var n = pool.length;
	if (r > n) {
		return MochiKit.Iter.EmptyIter;
	}

	var indices = mi.list(mi.range(r));
	var first = true;
	return {
		repr: function() { return "combinations(...)"; },
		toString: m.Base.forwardCall("repr"),

		next: function() {
			if (first) {
				first = false;
				return mi.list(mi.remapView(indices, pool));
			} // else
			while (true) {
				var done = true;
				for (var i = r - 1; i >= 0; --i) {
					if (indices[i] != (i + n - r)) {
						done = false;
						break;
					}
				}
				if (done)
					throw MochiKit.Iter.StopIteration;

				indices[i] += 1;
				for (var j = i + 1; j < r; ++j) {
					indices[j] = indices[j-1] + 1;
				}
				return mi.list(mi.remapView(indices, pool));
			}
		}
	};
};

/**
 * @see http://docs.python.org/library/itertools.html#itertools.combinations_with_replacement
 * ex: combinationsWithReplacement([A,B,C], 2) --> AA AB AC BB BC CC
 * impl. follows the Python example reference.
 *
 * @param {!Iterable} iterable
 * @param {integer} r
 * @return {!Iterable}
 */
MochiKit.Iter.combinationsWithReplacement = function(iterable, r) {
	var m = MochiKit, mi = MochiKit.Iter;

    var pool = mi.list(iterable);
    var n = pool.length;
    if (n == 0 || r == 0) {
        return mi.EmptyIter;
    }

    var indices = mi.list(mi.repeat(0, r));
	var first = true;
	return {
		repr: function() { return "combinationsWithReplacement(...)"; },
		toString: m.Base.forwardCall("repr"),

		next: function() {
			if (first) {
				first = false;
				return mi.list(mi.remapView(indices, pool));
			} // else
			while (true) {
				var done = true;
				for (var i = r - 1; i >= 0; --i) {
					if (indices[i] != n - 1) {
						done = false;
						break;
					}
				}
				if (done)
					throw mi.StopIteration;

				indices = indices.slice(0, i).concat(mi.list(mi.repeat(indices[i] + 1, r - i))); // or use push.apply?
				return mi.list(mi.remapView(indices, pool));
			}
		}
	};
};


/**
 * similar to cycle() with a counter, but requires an Iterable (uses no temporary mem)
 * resembles Python's list*n syntax.
 * @param {!Iterable} iterable
 * @param {integer} n // todo: perhaps interpret no n as infinite cycles?
 * @return {!Iterable}
 */
MochiKit.Iter.repeatSeq = function(iterable, n) // ..name? nCycles?
{
	// == chainFromIter(repeat(list(iterable), n)) but uses less memory // todo: ! actually works if we replace range impl with xrange
	if (n == 0) {
		return MochiKit.Iter.EmptyIter;
	}
	var it = MochiKit.Iter.iter(iterable);

	return {
		next: function() {
			try {
				return it.next();
			} catch (e) {
				if (e != MochiKit.Iter.StopIteration || --n <= 0)
					throw e;
				it = MochiKit.Iter.iter(iterable);
				return it.next();
			}
		}
	};
};


/**
 * @see http://docs.python.org/library/itertools.html#itertools.permutations
 * impl. based on the Python example reference.
 *
 * @param {!Iterable} iterable
 * @param {integer=} [r=len(iterable)]
 * @return {!Iterable}
 */
MochiKit.Iter.permutations = function(iterable, r) {
	var m = MochiKit, mi = MochiKit.Iter;

	var pool = mi.list(iterable);
	var n = pool.length;
	r = r || n;
	if (r > n) {
		return mi.EmptyIter;
	}

	var indices = mi.list(mi.range(n));
	var cycles = mi.list(mi.range(n, n - r, -1));
	var first = true;
	return {
		repr: function() { return "permutations(...)"; },
		toString: m.Base.forwardCall("repr"),

		next: function() {
			if (first) {
				first = false;
				return mi.list(mi.remapView(mi.islice(indices, 0, r), pool));
			}
			if (n == 0) {
				throw mi.StopIteration;
			}
			var done = true;
			for (var i = r - 1; i >= 0; --i) {
				cycles[i] -= 1;
				if (cycles[i] == 0) {
					indices = indices.slice(0, i).concat(indices.slice(i+1), indices[i]); // or use push.apply?
					cycles[i] = n - i;
				} else {
					var j = cycles[i];
					var jdx = indices.length - j;
					var tmp = indices[i]; indices[i] = indices[jdx]; indices[jdx] = tmp; // swap
					done = false;
					break;
				}
			}
			if (done)
				throw mi.StopIteration;
			// else
			return mi.list(mi.remapView(mi.islice(indices, 0, r), pool));
		}
	};
};


/**
 * @see xrange
 *
 * @param {integer} start
 * @param {integer} stop
 * @param {integer} step
 * @constructor
 * @private
 */
MochiKit.Iter._Range = function(start, stop, step) {
	// todo: overload here also?
	this.start = start;
	this.stop = stop;
	this.step = step;
};

/**
 * @return {!Iterable}
 */
MochiKit.Iter._Range.prototype.__iterator__ = function() {
	// return "old", iterator range
	return MochiKit.Iter.range(this.start, this.stop, this.step);
};

/**
 * identical interface to Iter.range, but returns an iterable _collection_ instead of iterator.
 * the subtle difference from existing range is that this can be run multiple times.
 * see for example: "Multiple Versus Single Iterators" at http://answers.oreilly.com/topic/1576-new-iterables-in-python-3-0/
 * i.e the "old" range is not same as Python xrange, rather it resembles iter(xrange).
 * this seems like it could be a drop-in, but could theoretically cause some subtle differences.
 * calling this "new" range xrange might both be ok and confusing..? this has different naming for other reason than Python added x-name.
 *
 * factory for _Range
 * @param {integer} start
 * @param {integer=} [stop=start]
 * @param {integer=} [step=1]
 * @return {!Iterable}
 */
MochiKit.Iter.xrange = function (/* [start,] stop[, step] */) {
	var start = 0;
	var stop = 0;
	var step = 1;
	if (arguments.length == 1) {
		stop = arguments[0];
	} else if (arguments.length == 2) {
		start = arguments[0];
		stop = arguments[1];
	} else if (arguments.length == 3) {
		start = arguments[0];
		stop = arguments[1];
		step = arguments[2];
	} else {
		throw new TypeError("xrange() takes 1, 2, or 3 arguments!");
	}
	if (step === 0) {
		throw new TypeError("xrange() step must not be 0");
	}

	return new MochiKit.Iter._Range(start, stop, step);
};


/**
 * @param {*} iterator
 * @return {boolean}
 */
MochiKit.Iter.isJavaLikeIterator = function(iterator) {
	return iterator && typeof iterator.hasNext == 'function' && typeof iterator.next == 'function';
};

/**
 * converts "Java style" iterators to the JS 1.7 interface.
 * @see http://download.oracle.com/javase/1.5.0/docs/api/java/util/Iterator.html
 * todo: take optional functions to provide next() & hasNext() configuration? (hmm, would make the registering symmetry cumbersome.. i.e require manual/static registering)
 *
 * @param {!{hasNext: function(): boolean, next: !Function}} iterator
 * @return {!Iterable}
 */
MochiKit.Iter.javaLikeIterator = function(iterator) {
	return {
		repr: function() { return "javaLikeIterator"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			if (!iterator.hasNext())
				throw MochiKit.Iter.StopIteration;
			return iterator.next();
		}
	};
};

// perhaps always add this?
MochiKit.Iter.registerJavaLikeIteratorSupport = function() {
	MochiKit.Iter.registerIteratorFactory(
        "javaLikeIterator",
        MochiKit.Iter.isJavaLikeIterator,
        MochiKit.Iter.javaLikeIterator
    );
};


/**
 * Counts number of occurences of elem in iterable
 * similar to MochiKit.Base.findValue but can take an iterable
 * @param {!Iterable} iterable
 * @param {*} elem
 * @param {Function=} [cmp=ceq]
 * todo: ? or take optional indices as findValue? (in that case assume iterable is ArrayLike)
 * @return {integer}
 */
MochiKit.Iter.countValue = function(iterable, elem, cmp) {
	cmp = cmp || MochiKit.Base.operator.ceq;
	var n = 0;
	MochiKit.Iter.forEach(iterable, function(e) { if (cmp(e, elem)) ++n; });
	return n;
};


/**
 * wraps an iterator in a count guard that will only allow
 * at most N number of iterations.
 * (doesn't affect the original iterator)
 * todo: name? atMost? (see if similar fn already has an established name)
 * found a reference here: http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/collect/Iterators.html#limit(java.util.Iterator, int)
 *
 * @param {!Iterator} iter
 * @param {integer} n max number of iterations allowed
 * @return {!Iterable} new
 */
MochiKit.Iter.limit = function(iter, n) {
	return MochiKit.Iter.takewhile(function() { return n-- > 0; }, iter);
	/*
	// todo: fwd other possible properties from iter? (clone style?)
	return {
		next: function() {
			if (n-- <= 0)
				throw MochiKit.Iter.StopIteration;
			return iter.next();
		}
	};
	*/
};

/**
 * basically the running reduce/fold values
 * @see http://docs.python.org/3.3/library/itertools.html#itertools.accumulate
 * @see MochiKit.Iter.reduce()
 *
 * @param {!Iterable} iterable
 * @param {Function=} [func=operator.add]
 * @return {!Iterable}
 */
MochiKit.Iter.accumulate = function(iterable, func) {
	var iter = MochiKit.Iter.iter(iterable);
	func = func || MochiKit.Base.operator.add;

	var total; // delay fetching first item until first .next call
	var first = true;
	return {
		next: function() {
			if (first) {
				first = false;
				total = iter.next();
				return total;
			}
			total = func(total, iter.next());
			return total;
		}
	};
};


/**
 * Maps a property name
 * useful?
 * (mostly since it seems like this name might have caught on(?) (see Underscore etc) )
 * todo: similar but for methods? pluckFn?
 *
 * @see https://pypi.python.org/pypi/pluck
 * @see http://underscorejs.org/#pluck
 *
 * @param {!terable} iterable
 * @param {string} property
 * todo: support a default value also?
 * @return {!Iterable}
 */
MochiKit.Iter.pluck = function(iterable, property) {
	return MochiKit.Iter.imap(MochiKit.Base.itemgetter(property), iterable);
};


/**
 * shorthand for window-view with same step as window size.
 * todo: this case is possible to be slightly more efficient though.
 * @param {!Iterable} iterable
 * @param {integer} n size of chunk
 * @return {!Iterable}
 */
MochiKit.Iter.chunked = function(iterable, n) {
	return MochiKit.Iter.windowView(iterable, n, n);
};


/**
 * Combined map and zip.
 *
 * @see MochiKit.Iter.izip
 * @see MochiKit.Base.map
 * @see http://hackage.haskell.org/packages/archive/base/latest/doc/html/Prelude.html#v:zipWith
 *
 * todo: umm, this is kindof exactly what the existing imap/map does if fed multiple iterables.. ;) -> drop or just alias?
 *
 * @param {!Function} fn
 * @param {!Iterable} p
 * @param {...!Iterable} [var_args]
 * @return {!Iterable} [fn(a0, b0, ..), fn(a1, b1, ...), fn(a2, b2, ...)]
 */
MochiKit.Iter.zipWith = function(fn, p, var_args) {
	return MochiKit.Iter.imap(function(item) {
		return fn.apply(this, item);
	}, MochiKit.Iter.izip.apply(null, MochiKit.Base.extend(null, arguments, 1)));
};


/**
 * "cute" version of indexed for-each that is possible with zipWith.
 * similar to the enumerate() method but flattens the arguments to the for-body-fn for easier use.
 * todo: name? for_each? forIdx?
 */
MochiKit.Iter.forEachIdx = function(iterable, fn) {
	var self = MochiKit.Iter;
//	self.exhaust(self.zipWith(fn, self.count(), iterable));
	self.exhaust(self.imap(fn, self.count(), iterable));
};


/**
 * @param {*} obj
 * @return {boolean}
 */
MochiKit.Iter.isES6Iterable = function(obj) {
	if (obj != null && typeof Symbol == 'function' && typeof Symbol.iterator != 'undefined') {
		return typeof obj[Symbol.iterator] == 'function' || typeof obj.next == 'function';
	}
	return false;
};

/**
 * returns an ES6 Iterator either an ES6 Iterable or input if already an ES6 Iterator.
 * todo: name?
 * @see MochiKit.Iter.iter()
 * @return {!ES6Iterator} throws if not compatibile or not an iterable
 */
MochiKit.Iter.es6Iter = function(es6iterable) {
	// in ES6 typeof Symbol.iterator == 'symbol'. but we use simpler test to allow polyfills and avoid lint warning.
	if (typeof Symbol == 'function' && typeof Symbol.iterator != 'undefined') {
		if (typeof es6iterable[Symbol.iterator] == 'function') {
			return es6iterable[Symbol.iterator]();
		} else if (typeof es6iterable.next == 'function') {
			return es6iterable;
		}
		throw new TypeError(es6iterable + ": is not iterable");
	}
	throw new Error("ES6 Iterators not supported");
	return null; // silence warning
};


/**
 * Convert a ES6 iterator style into a MochKit.Iterable
 * todo: ok name?
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 * @see MochiKit.Iter.toES6Iterator
 * @param {!ES6Iterator} es6iterable overloads on both Iterable and Iterator
 * @return {!Iterable}
 */
MochiKit.Iter.fromES6Iterator = function(es6iterator) {
	var it = MochiKit.Iter.es6Iter(es6iterator);
	return {
		next: function() {
			var step = it.next();
			if (step.done) {
				throw MochiKit.Iter.StopIteration;
			}
			return step.value;
		}
	};
};

/**
 * Convert a MochKit.Iterable into a ES6 Iterator.
 * todo: todo: ok name?
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 * @see MochiKit.Iter.fromES6Iterator
 * @param {!Iterable} iterable
 * @return {!ES6Iterator} // todo: check exact type
 */
MochiKit.Iter.toES6Iterator = function(iterable) {
	var it = MochiKit.Iter.iter(iterable);
	return {
		next: function() {
			try {
				var val = it.next();
				return {
					done: false,
					value: val
				};
			} catch (e) {
				if (e != MochiKit.Iter.StopIteration)
					throw e;
			}
			return { done: true };
		}
	};
};


//--------------------------------

MochiKit.Iter_ext.__new__ = function() {
	// NOP ...
};


MochiKit.Iter_ext.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Iter); // ! since we add to the existing namespace we export it again here (ok?)
