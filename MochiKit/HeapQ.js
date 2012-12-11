/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * Heap methods
 * see http://en.wikipedia.org/wiki/Heap_(data_structure)
 * more specifically this resembles a min-heap.
 *
 * the impl. is almost a line-by-line(!) port of http://docs.python.org/library/heapq.html
 * more intricate implementations can be found here: http://www.boost.org/doc/libs/1_49_0/doc/html/heap.html
 *
 * note: supports custom comparator.
 * note: hopefully self evident, but, when using custom comparators, you must use same comparator in all calls.
 * see also: https://github.com/blq/mochikit/blob/master/examples/PriorityQueue.js
 *
 *
 * todo: separate imergeSorted? could drop dep on Iter
 * todo: explicit prio queue class (see /examples/PrioQueue.js)
 * todo: revert custom comparators? Rather do exactly as Python does and suggest using a pair/tuple in those cases.
 * see http://stackoverflow.com/questions/8875706/python-heapq-with-custom-compare-predicate
 *
 * @author Fredrik Blomqvist
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.HeapQ');

	goog.require('MochiKit.Base');
	goog.require('MochiKit.Iter');
}

MochiKit.Base.module(MochiKit, 'HeapQ', '1.5', ['Base', 'Iter']);



/**
 * Transform list x into a heap, in-place, in linear time.
 *
 * @see http://docs.python.org/library/heapq.html#heapq.heapify
 * @see http://www.sgi.com/tech/stl/make_heap.html
 *
 * @param {!Array} x
 * @param {Function=} [cmp]
 * @return {!Array} chained, modified input array (note that Python heapify doesn't do this..)
 */
MochiKit.HeapQ.heapify = function(x, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

	var n = x.length;
	// Transform bottom-up.  The largest index there's any point to looking at
	// is the largest with a child index in-range, so must have 2*i + 1 < n,
	// or i < (n-1)/2.  If n is even = 2*j, this is (2*j-1)/2 = j-1/2 so
	// j-1 is the largest, which is n//2 - 1.  If n is odd = 2*j+1, this is
	// (2*j+1-1)/2 = j so j-1 is the largest, and that's again n//2-1.
	for (var i = Math.floor(n / 2) - 1; i >= 0; --i)
		MochiKit.HeapQ._siftup(x, i, cmp);
	return x; // enable functional chaining (Python doesn't do this..)
};


/**
 * 'heap' is a heap at all indices >= startpos, except possibly for pos.  pos
 * is the index of a leaf with a possibly out-of-order value.  Restore the
 * heap invariant.
 * @see _siftup
 * @param {!Array} heap
 * @param {integer} startpos
 * @param {integer} pos
 * @param {Function=} cmp
 * @private
 */
MochiKit.HeapQ._siftdown = function(heap, startpos, pos, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

	var newitem = heap[pos];
	// Follow the path to the root, moving parents down until finding a place
	// newitem fits.
	while (pos > startpos) {
		var parentpos = (pos - 1) >> 1; // or use floor() ?
		var parent = heap[parentpos];
		if (cmp(newitem, parent)) {
			heap[pos] = parent;
			pos = parentpos;
			continue;
		}
		break;
	}
	heap[pos] = newitem;
	// return heap?
};

/**
 * @see _siftdown
 * @param {!Array} heap
 * @param {integer} pos
 * @param {Function=} cmp
 * @private
 */
MochiKit.HeapQ._siftup = function(heap, pos, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

	var endpos = heap.length;
	var startpos = pos;
	var newitem = heap[pos];
	// Bubble up the smaller child until hitting a leaf.
	var childpos = 2*pos + 1; // leftmost child position
	while (childpos < endpos) {
		// Set childpos to index of smaller child.
		var rightpos = childpos + 1;
		if (rightpos < endpos && !(cmp(heap[childpos], heap[rightpos])))
			childpos = rightpos;
		// Move the smaller child up.
		heap[pos] = heap[childpos];
		pos = childpos;
		childpos = 2*pos + 1;
	}
	// The leaf at pos is empty now.  Put newitem there, and bubble it up
	// to its final resting place (by sifting its parents down).
	heap[pos] = newitem;
	MochiKit.HeapQ._siftdown(heap, startpos, pos, cmp);
	// return heap?
};


/**
 * Push the value item onto the heap, maintaining the heap invariant.
 *
 * @see http://docs.python.org/library/heapq.html#heapq.heappush
 * @see http://www.sgi.com/tech/stl/push_heap.html
 *
 * @param {!Array} heap
 * @param {*} item
 * @param {Function=} cmp
 */
MochiKit.HeapQ.heapPush = function(heap, item, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

	heap.push(item);
	MochiKit.HeapQ._siftdown(heap, 0, heap.length-1, cmp);
};

/**
 * Pop the smallest item off the heap, maintaining the heap invariant.
 *
 * @see http://docs.python.org/library/heapq.html#heapq.heappop
 * @see http://www.sgi.com/tech/stl/pop_heap.html
 *
 * @param {!Array} heap
 * @param {Function=} cmp
 * @return {*}
 */
MochiKit.HeapQ.heapPop = function(heap, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

	var lastelt = heap.pop(); // todo: throw if empty?
	var returnitem;
	if (heap.length > 0) {
		returnitem = heap[0];
		heap[0] = lastelt;
		MochiKit.HeapQ._siftup(heap, 0, cmp);
	} else {
		returnitem = lastelt;
	}
	return returnitem;
};


/**
 * Pop and return the current smallest value, and add the new item.
 *
 * This is more efficient than heappop() followed by heappush(), and can be
 * more appropriate when using a fixed-size heap.  Note that the value
 * returned may be larger than item!  That constrains reasonable uses of
 * this routine unless written as part of a conditional replacement:
 *
 *      if (item > heap[0])
 *          item = heapReplace(heap, item)
 *
 * @see http://docs.python.org/library/heapq.html#heapq.heapreplace
 * @param {!Array} heap
 * @param {*} item
 * @param {Function=} cmp
 * @return {*}
 */
MochiKit.HeapQ.heapReplace = function(heap, item, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

	var returnitem = heap[0]; // todo: throw if empty?
	heap[0] = item;
	MochiKit.HeapQ._siftup(heap, 0, cmp);
	return returnitem;
};


/**
 * Fast version of a heapPush followed by a heapPop.
 * @see http://docs.python.org/library/heapq.html#heapq.heappushpop
 * @param {!Array} heap
 * @param {*} item
 * @param {Function=} cmp
 * @return {*}
 */
MochiKit.HeapQ.heapPushPop = function(heap, item, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

	if (heap.length > 0 && cmp(heap[0], item)) {
		var tmp = heap[0];
		heap[0] = item;
		item = tmp;
		MochiKit.HeapQ._siftup(heap, 0, cmp);
	}
	return item;
};


/**
 * todo: name? Python only calls this 'merge'.
 * todo: would have been nice with variable nr of arguments (as the Python equiv)
 * But, then it would be difficult to support the cmp.. hmm?
 * @see http://docs.python.org/library/heapq.html#heapq.merge
 * @param {!Iterable} iterables
 * @param {Function=} cmp // todo: custom cmp not quite ready
 * @return {!Iterable}
 */
MochiKit.HeapQ.imergeSorted = function(iterables, cmp)
{
	var m = MochiKit, mi = m.Iter;
	cmp = cmp || m.Base.operator.clt;

	// wrap user supplied cmp so it only needs to compare the value-part
	var _cmp = function(a, b) {
		var c = cmp(a[0], b[0]);
		// todo: hmm ? shouldn't we chain a compare with the index if equal..?
		return c;
	};

	var h = [];
	mi.forEach(mi.izip(mi.count(), mi.imap(mi.iter, iterables)), function(pair) {
		var itnum = pair[0], it = pair[1];
		try {
			var next = it.next;
			h.push([next(), itnum, next]); // tuple of [value, index, iterator]
		} catch (e) {
			if (e != mi.StopIteration)
				throw e;
		}
	});
	m.HeapQ.heapify(h, _cmp);

	return {
		repr: function() { return "imergeSorted(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			while (true) {
				if (h.length == 0)
					throw mi.StopIteration;

				var s = h[0];
				var v = s[0]; var next = s[2];

				try {
					s[0] = next();
					m.HeapQ.heapReplace(h, s, _cmp); // restore heap condition
				} catch (e) {
					if (e != mi.StopIteration)
						throw e;
					m.HeapQ.heapPop(h, _cmp);   // remove empty iterator
				}
				return v;
			}
		}
	};
};


/**
 * note: ! this is a destructive iterator!
 * @param {!Array} heap ! will be emptied during the iteration
 * @param {Function=} [cmp=clt]
 * @return {!Iterable}
 */
MochiKit.HeapQ.heapIter = function(heap, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

	return {
		next: function() {
			if (heap.length == 0)
				throw MochiKit.Iter.StopIteration;
			return MochiKit.HeapQ.heapPop(heap, cmp);
		}
	};
};


/**
 * Find the n largest elements in a dataset.
 * Equivalent to: sorted(iterable, reverse=True)[:n]
 * @see http://docs.python.org/library/heapq.html#heapq.nlargest
 * @param {integer} n
 * @param {!Iterable} iterable
 * @param {Function=} [cmp=cle]
 * @return {!Array} array of (at most) n elements from iterable in sorted order
 */
MochiKit.HeapQ.nLargest = function(n, iterable, cmp)
{
	var m = MochiKit, mi = m.Iter;
	cmp = cmp || m.Base.operator.clt; // cle? ok?
	var it = mi.iter(iterable);

	// todo: several fast-paths possible. n >= len(iterable) -> rev.sort etc
/*
	// PyPy variant
	var result = mi.list(mi.islice(it, n));
	if (result.length == 0)
		return result;
	m.HeapQ.heapify(result, cmp);
	var sol = result[0];         // sol --> smallest of the nlargest
	mi.forEach(it, function(elem) {
	   if (elem > sol) {
			m.HeapQ.heapReplace(result, elem, cmp);
			sol = result[0];
	   }
	});
	result.sort(function(a, b) { return -1*m.Base.compare(a, b); }); // todo: extract a negateComparator
	return result;
*/

	var result = mi.list(mi.islice(it, n));
	if (result.length == 0)
		return result;
	m.HeapQ.heapify(result, cmp);
	mi.forEach(it, function(elem) {
		m.HeapQ.heapPushPop(result, elem, cmp);
	});
	result.sort(function(a, b) { return -1*m.Base.compare(a, b); });
	return result;
};


/**
 * @see http://docs.python.org/library/heapq.html#heapq.nsmallest
 * O(N + n log N), N = len(iterable)
 * @param {integer} n
 * @param {!Iterable} iterable
 * @param {Function=} [cmp=lte]
 * @return {!Array}
 */
MochiKit.HeapQ.nSmallest = function(n, iterable, cmp)
{
	// (Python code also has a fast-path for n*10 < len(iterable) using bisection)
	var m = MochiKit, mi = m.Iter;
	cmp = cmp || m.Base.operator.clt; // ok?

	var h = mi.list(iterable);
	m.HeapQ.heapify(h, cmp);
	return m.Base.map(m.Base.partial(m.HeapQ.heapPop, h, cmp), mi.range(Math.min(n, h.length)));
};


/**
 * Test if Array lst fulfills the heap invariant
 *
 * @see http://www.sgi.com/tech/stl/is_heap.html
 *
 * @param {!Array} lst
 * @param {BinaryComparator=} [cmp] observe that this, in contrast to the default cmp in heap creation functions, must return true for equal elements also
 * @return {boolean}
 */
MochiKit.HeapQ.isHeap = function(lst, cmp)
{
	cmp = cmp || MochiKit.Base.operator.cle;
/*
	var n = Math.floor(lst.length / 2);
	if (n == 0)
		return true;

	for (var i = 0; i < n - 1; ++i) {
		if (!(cmp(lst[i], lst[2*i+1]) && cmp(lst[i], lst[2*i+2])))
			return false;
	}
	return true;
*/
	// bottom up variant
	for (var pos = 1; pos < lst.length; ++pos) { // pos 0 has no parent
		var parentpos = (pos - 1) >> 1; // == Math.floor((pos - 1) / 2)
		if (!cmp(lst[parentpos], lst[pos]))
			return false;
	}
	return true;
};


// todo: heapMerge? useful? or just "misleading"? since it's O(N) in this case, since we simply need to re-heapify the two heaps anyway..


/**
 * example code for heap sort.
 * Does Not run in-place. (hmm, perhaps call it heapSorteD?) (todo: in-place version possible, but more code)
 * Equivalent to sorted(iterable)
 *
 * @see http://www.sgi.com/tech/stl/sort_heap.html
 *
 * @param {!Iterable} iterable
 * @param {BinaryComparator=} [cmp]
 * @return {!Array}
 */
MochiKit.HeapQ.heapSort = function(iterable, cmp)
{
	var m = MochiKit;

	var h = m.Iter.list(iterable);
	m.HeapQ.heapify(h, cmp);
	return m.Base.map(m.Base.partial(m.HeapQ.heapPop, h, cmp), m.Iter.range(h.length)); // could use repeat(h, h.length) also (see nSmallest)
};


//-------------------------------

MochiKit.HeapQ.__new__ = function()
{
	// NOP ...
};


MochiKit.HeapQ.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.HeapQ);
