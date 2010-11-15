/**
 * example PrioQueue with interface from http://hepunx.rl.ac.uk/BFROOT/dist/packages/boost/V01-27-00-04/libs/pri_queue/p_queue.html
 * (apart from value return in pop)
 * Shows how to create a wrapper around the heap functions.
 * todo: parametrice on heap algorithm (now uses HeapQ)
 * todo: elevate this to an official component?
 *
 * @author Fredrik Blomqvist
 *
 */


/**
 * @param {?Iterable} iterable
 * @param {Function=} [cmp]
 * @constructor
 */
function PriorityQueue(iterable, cmp)
{
	/** @private @type {!Array} */
	this._heap = MochiKit.Iter.list(iterable || []);
	/** @private @type {!BinaryPredicate} */
	this._cmp = cmp || MochiKit.Base.operator.clt;
};

/**
 * @return {integer}
 */
PriorityQueue.prototype.size = function()
{
	return this._heap.length;
};


/**
 * @param {*} item
 */
PriorityQueue.prototype.push = function(item)
{
	MochiKit.HeapQ.heapPush(this._heap, item, this._cmp);
};

/**
 * @return {*}
 */
PriorityQueue.prototype.pop = function()
{
	return MochiKit.HeapQ.heapPop(this._heap, this._cmp);
};

/**
 * peek
 * @return {*}
 */
PriorityQueue.prototype.top = function()
{
	return this._heap[0];
};

/**
 * @param {*} item
 */
PriorityQueue.prototype.changeTop = function(item)
{
	MochiKit.HeapQ.heapReplace(this._heap, item, this._cmp);
};

/**
 * ! this is Not the prio-ordered data! only intended for *logical-inspection* http://hepunx.rl.ac.uk/BFROOT/dist/packages/boost/V01-27-00-04/libs/pri_queue/logical-inspectability.html
 * @return {!Iterable}
 */
PriorityQueue.prototype.__iterable__ = function()
{
	return this._heap; // wrap in iter? (or just anal? interface spec forbids user to explicitly use Array, but compiler should benefit)
};

// .. + sorted?

