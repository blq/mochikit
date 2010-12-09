/**
 from: http://code.activestate.com/recipes/230113-implementation-of-sets-using-sorted-lists/
 Python code by Raymond Hettinger, converted to JavaScript by Fredrik Blomqvist

""" altsets.py -- An alternate implementation of Sets.py

Implements set operations using sorted lists as the underlying data structure.

Advantages:

  * Space savings -- lists are much more compact than a dictionary
    based implementation.

  * Flexibility -- elements do not need to be hashable, only __cmp__
    is required.

  * Fast operations depending on the underlying data patterns.
    Non-overlapping sets get united, intersected, or differenced
    with only log(N) element comparisons.  Results are built using
    fast-slicing.

  * Algorithms are designed to minimize the number of compares
    which can be expensive.

  * Natural support for sets of sets.  No special accomodation needs to
    be made to use a set or dict as a set member, but users need to be
    careful to not mutate a member of a set since that may breaks its
    sort invariant.

Disadvantages:

  * Set construction uses list.sort() with potentially N log(N)
    comparisons.

  * Membership testing and element addition use log(N) comparisons.
    Element addition uses list.insert() with takes O(N) time.

ToDo:

   * Make the search routine adapt to the data; falling backing to
     a linear search when encountering random data.

"""
*/

// require: Base, Iter, Bisect

/**
 * @param {Iterable=} [iterable] // todo: accept other set also?
 * @constructor
 * todo: custom comparator?
 */
function Set(iterable)
{
	this._cmp = compare;
	var data = list(iterable || []);
	data.sort(compare);
	var result = data.slice(0, 1);
	forEach(islice(data, 1, data.length), function(elem) {
		if (this._cmp(elem, result[result.length-1]) != 0)
			result.push(elem);
	}, this);
	/** @type {!Array.<*>} */
	this.data = result;
}

/**
 * @return {!Iterable}
 */
Set.prototype.__iterator__ = function() {
	return iter(this.data);
};

/**
 * @return {string}
 */
Set.prototype.__repr__ = function() {
	return 'Set(' + repr(this.data) + ')';
};

/**
 * @param {*} elem
 * @return {boolean}
 */
Set.prototype.contains = function(elem) {
	var i = bisectLeft(this.data, elem, 0);
	return i < this.data.length && this._cmp(this.data[i], elem) == 0;
};

/**
 * todo: apply this? http://code.activestate.com/recipes/230113-implementation-of-sets-using-sorted-lists/#c3
 * @param {*} elem
 */
Set.prototype.add = function(elem) {
	if (!this.contains(elem))
		insortLeft(this.data, elem);
	// todo: chain?
};

/**
 * @param {*} elem
 */
Set.prototype.remove = function(elem) {
	var i = bisectLeft(this.data, elem, 0);
	if (i < this.data.length && this._cmp(this.data[i], elem) == 0)
		this.data.splice(i, 1);
	// todo: chain?
};

/**
 * @param {!(Set|Iterable)} other
 * @return {!Array.<*>}
 * @private
 */
Set.prototype._getotherdata = function(other) {
	if (!(other instanceof Set))
		other = new Set(other);
	return other.data;
};

/**
 * @param {!(Set|Iterable)} other
 * @return {!Array.<*>}
 * @private
 */
Set._getotherdata = Set.prototype._getotherdata;

/**
 * @param {!(Set|Iterable)} other
 * @param {Function=} [cmp]
 * @return {integer} -1, 0, +1
 */
Set.prototype.compare = function(other, cmp) {
	cmp = cmp || this._cmp;
	return cmp(this.data, Set._getotherdata(other));
};

/**
 * @param {!(Set|Iterable)} other
 * @param {Function=} [find=bisectLeft] bisect fn
 * @return {!Set}
 */
Set.prototype.union = function(other, find) {
	find = find || bisectLeft;
	var i = 0, j = 0;
	var x = this.data;
	var y = Set._getotherdata(other);
	var result = new Set([]);
	var append = bind(Array.prototype.push, result.data);
	var extend = partial(iextend, result.data);
	while (i < x.length && j < y.length) {
		var cmp = this._cmp(x[i], y[j]);
		if (cmp == 0) {
			append(x[i]);
			i += 1;
			j += 1;
		} else
		if (cmp > 0) {
			var cut = find(y, x[i], j);
			extend(islice(y, j, cut));
			j = cut;
		} else {
			var cut = find(x, y[j], i);
			extend(islice(x, i, cut));
			i = cut;
		}
	}
	extend(x, i);
	extend(y, j);
	return result;
};

/**
 * @param {!(Set|Iterable)} other
 * @param {Function=} [find=bisectLeft] bisect fn
 * @return {!Set}
 */
Set.prototype.intersection = function(other, find) {
	find = find || bisectLeft;
	var i = 0, j = 0;
	var x = this.data;
	var y = Set._getotherdata(other);
	var result = new Set([]);
	var append = bind(Array.prototype.push, result.data);
	while (i < x.length && j < y.length) {
		var cmp = this._cmp(x[i], y[j]);
		if (cmp == 0) {
			append(x[i]);
			i += 1;
			j += 1;
		} else
		if (cmp > 0) {
			j = find(y, x[i], j);
		} else {
			i = find(x, y[j], i);
		}
	}
	return result;
};

/**
 * @param {!(Set|Iterable)} other
 * @param {Function=} [find=bisectLeft] bisect fn
 * @return {!Set}
 */
Set.prototype.difference = function(other, find) {
	find = find || bisectLeft;
	var i = 0, j = 0;
	var x = this.data;
	var y = Set._getotherdata(other);
	var result = new Set([]);
	var extend = partial(iextend, result.data);
	while (i < x.length && j < y.length) {
		var cmp = this._cmp(x[i], y[j]);
		if (cmp == 0) {
			i += 1;
			j += 1;
		} else
		if (cmp > 0) {
			j = find(y, x[i], j);
		} else {
			var cut = find(x, y[j], i);
			extend(islice(x, i, cut));
			i = cut;
		}
	}
	extend(x, i);
	return result;
};

/**
 * @param {!(Set|Iterable)} other
 * @param {Function=} [find=bisectLeft] bisect fn
 * @return {!Set}
 */
Set.prototype.symmetricDifference = function(other, find) {
	find = find || bisectLeft;
	var i = 0, j = 0;
	var x = this.data;
	var y = Set._getotherdata(other);
	var result = new Set([]);
	var extend = partial(iextend, result.data);
	while (i < x.length && j < y.length) {
		var cmp = this._cmp(x[i], y[j]);
		if (cmp == 0) {
			i += 1;
			j += 1;
		} else
		if (cmp > 0) {
			var cut = find(y, x[i], j);
			extend(islice(y, j, cut));
			j = cut;
		} else {
			var cut = find(x, y[j], i);
			extend(islice(x, i, cut));
			i = cut;
		}
	}
	extend(x, i);
	extend(y, j);
	return result;
};
