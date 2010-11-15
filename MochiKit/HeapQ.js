/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * Heap methods
 * see http://en.wikipedia.org/wiki/Heap_(data_structure)
 * more specifically this resembles a min-heap.
 * supports custom comparator.
 *
 * the impl. is almost a line-by-line(!) port of http://docs.python.org/library/heapq.html
 *
 * todo: separate imergeSorted? could drop dep on Iter
 * todo: isHeap?
 * todo: explicit prio queue class (see /examples/PrioQueue.js)
 *
 *
 * @author Fredrik Blomqvist
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.HeapQ');

	goog.require('MochiKit.Base');
	goog.require('MochiKit.Iter');
}

MochiKit.Base._module('HeapQ', '1.5', ['Base', 'Iter']);



/**
 * Transform list x into a heap, in-place, in linear time.
 * @param {!Array} x
 * @param {Function=} [cmp]
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
    for (var i = Math.floor(n / 2); i >= 0; --i)
		MochiKit.HeapQ._siftup(x, i, cmp);
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
        var parentpos = (pos - 1) >> 1
        var parent = heap[parentpos];
        if (cmp(newitem, parent)) {
            heap[pos] = parent;
            pos = parentpos;
            continue;
		}
        break;
	}
    heap[pos] = newitem;
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
};


/**
 * Push the value item onto the heap, maintaining the heap invariant.
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
 * @param {!Array} heap
 * @param {Function=} cmp
 * @return {*}
 */
MochiKit.HeapQ.heapPop = function(heap, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

    var lastelt = heap.pop(); // raises appropriate IndexError if heap is empty
	var returnitem;
    if (heap.length > 0) {
        returnitem = heap[0]
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
 * @param {!Array} heap
 * @param {*} item
 * @param {Function=} cmp
 * @return {*}
 */
MochiKit.HeapQ.heapReplace = function(heap, item, cmp)
{
	cmp = cmp || MochiKit.Base.operator.clt;

    var returnitem = heap[0]; // raises appropriate IndexError if heap is empty
    heap[0] = item;
    MochiKit.HeapQ._siftup(heap, 0, cmp);
    return returnitem;
};


/**
 * Fast version of a heappush followed by a heappop.
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
 * @param {!Iterable} iterables
 * @param {Function=} cmp // todo: custom cmp not quite ready
 * @return {!Iterable}
 */
MochiKit.HeapQ.imergeSorted = function(iterables, cmp)
{
	// todo: ! need to wrap the comparator.. cmp shouldn't need to handle arrays, only the actual value type!
	cmp = cmp || MochiKit.Base.operator.clt; // ! need to use clt since we compare array (tuples)
	var m = MochiKit;

    var h = [];
    m.Iter.forEach(m.Iter.izip(m.Iter.count(), m.Iter.imap(m.Iter.iter, iterables)), function(pair) {
		var itnum = pair[0];
		var it = pair[1];
        try {
            var next = it.next;
            h.push([next(), itnum, next]);
		} catch (e) {
			if (e != m.Iter.StopIteration)
				throw e;
		}
	});
    m.HeapQ.heapify(h, cmp);

	return {
		repr: function() { return "imergeSorted(...)"; },
		toString: MochiKit.Base.forwardCall("repr"),

		next: function() {
			while (true) {
				if (h.length == 0)
					throw m.Iter.StopIteration;

				var s = h[0];
				var v = s[0]; var next = s[2];

				try {
					s[0] = next(); // raises StopIteration when exhausted
					m.HeapQ.heapReplace(h, s, cmp); // restore heap condition
				} catch (e) {
					if (e != m.Iter.StopIteration)
						throw e;
					m.HeapQ.heapPop(h, cmp);   // remove empty iterator
				}
				return v;
			}
		}
	};
};


/**
 * example code for heap sort
 * Equivalent to sorted(iterable)
 * @param {!Iterable} iterable
 * @return {!Array}
 */
MochiKit.HeapQ.heapsort = function(iterable)
{
	var m = MochiKit;

	var h = [];
	m.Iter.forEach(iterable, m.Base.partial(m.HeapQ.heapPush, h)); // todo: isn't it better to use heapify?
	return m.Base.map(m.Base.partial(m.HeapQ.heapPop, h), m.Iter.range(h.length));
};


//-------------------------------

MochiKit.HeapQ.__new__ = function()
{
	// NOP ...
};


MochiKit.HeapQ.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.HeapQ);
