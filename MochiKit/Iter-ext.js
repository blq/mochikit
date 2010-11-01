/**
 *
 * @author Fredrik Blomqvist
 *
 */

MochiKit.Base._module('Iter-ext', '1.5', ['Base', 'Iter']);


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
		repr: function () { return "treePreOrder(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function()
		{
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
 * todo: hmm, would be nice to have some version that would indicate each level (useful when doing searches for example)
 *
 * @param {*} rootNode
 * @param {function(*): !Iterable} getChildNodes should return an empty array if no children (ok? could add fallback ourselves also)
 * @return {!Iterable}
 */
MochiKit.Iter.treeLevelOrder = function(rootNode, getChildNodes)
{
	var queue = [ rootNode ];

	return {
		repr: function () { return "treeLevelOrder(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function()
		{
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
		repr: function () { return "treePostOrder(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function()
		{
			while (true) // loop until a visited node is returned or end of iteration
			{
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
	try
	{
		var elem0 = it.next();
	}
	catch (e)
	{
		if (e != MochiKit.Iter.StopIteration)
			throw e;
		// return empty dummy iter that re-throws the StopIter
		return {
			next: function()
			{
				throw e;
			}
		};
	}

	if (wrapLast)
		it = MochiKit.Iter.chain(it, [ elem0 ]);

	return {
		repr: function () { return "pairView(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function()
		{
			var elem1 = it.next();
			var pair = [ elem0, elem1 ];
			elem0 = elem1;
			return pair;
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
		function(item)
		{
			return typeof(item) !== 'undefined' && item !== null;
		},
		MochiKit.Iter.imap(
			mapFn,
			iterable
		)
	);
};
