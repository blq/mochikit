/**
# from http://code.activestate.com/recipes/577197-sortedcollection/

from bisect import bisect_left, bisect_right

    '''Sequence sorted by a key function.

    SortedCollection() is much easier to work with than using bisect() directly.
    It supports key functions like those use in sorted(), min(), and max().
    The result of the key function call is saved so that keys can be searched
    efficiently.

    Instead of returning an insertion-point which can be hard to interpret, the
    five find-methods return a specific item in the sequence. They can scan for
    exact matches, the last item less-than-or-equal to a key, or the first item
    greater-than-or-equal to a key.

    Once found, an item's ordinal position can be located with the index() method.
    New items can be added with the insert() and insert_right() methods.
    Old items can be deleted with the remove() method.

    The usual sequence methods are provided to support indexing, slicing,
    length lookup, clearing, copying, forward and reverse iteration, contains
    checking, item counts, item removal, and a nice looking repr.

    Finding and indexing are O(log n) operations while iteration and insertion
    are O(n).  The initial sort is O(n log n).

    The key function is stored in the 'key' attibute for easy introspection or
    so that you can assign a new key function (triggering an automatic re-sort).

    In short, the class was designed to handle all of the common use cases for
    bisect but with a simpler API and support for key functions.

    >>> from pprint import pprint
    >>> from operator import itemgetter

    >>> s = SortedCollection(key=itemgetter(2))
    >>> for record in [
    ...         ('roger', 'young', 30),
    ...         ('angela', 'jones', 28),
    ...         ('bill', 'smith', 22),
    ...         ('david', 'thomas', 32)]:
    ...     s.insert(record)

    >>> pprint(list(s))         # show records sorted by age
    [('bill', 'smith', 22),
     ('angela', 'jones', 28),
     ('roger', 'young', 30),
     ('david', 'thomas', 32)]

    >>> s.find_le(29)           # find oldest person aged 29 or younger
    ('angela', 'jones', 28)
    >>> s.find_lt(28)           # find oldest person under 28
    ('bill', 'smith', 22)
    >>> s.find_gt(28)           # find youngest person over 28
    ('roger', 'young', 30)

    >>> r = s.find_ge(32)       # find youngest person aged 32 or older
    >>> s.index(r)              # get the index of their record
    3
    >>> s[3]                    # fetch the record at that index
    ('david', 'thomas', 32)

    >>> s.key = itemgetter(0)   # now sort by first name
    >>> pprint(list(s))
    [('angela', 'jones', 28),
     ('bill', 'smith', 22),
     ('david', 'thomas', 32),
     ('roger', 'young', 30)]

    '''
*/

/**
 * @param {Iterable=} [iterable]
 * @param {Function=} [key]
 * @constructor
 */
function SortedCollection(iterable, key)
{
	this._init(iterable, key);
};

/**
 * @param {Iterable=} [iterable=empty]
 * @param {Function=} [key=identity]
 * todo: support custom comparator?
 * @private
 */
SortedCollection.prototype._init = function(iterable, key) {
	iterable = iterable || [];
	this._given_key = key;
	key = key || operator.identity;
	var decorated = sorted(imap(function(item) { return [key(item), item]; }, iterable), compare);
	this._keys = map(function(item) { return item[0]; }, decorated);
	this._items = map(function(item) { return item[1]; }, decorated);
	this._key = key;
	// todo: cmp?
};

/**
 * @return {!Function}
 */
SortedCollection.prototype.getKey = function() {
	return this._key;
};

/**
 * @param {Function} key
 */
SortedCollection.prototype.setKey = function(key) {
	if (key != this._key)
		this._init(this._items, key);
};

SortedCollection.prototype.delKey = function() {
	this.setKey(null);
};

SortedCollection.prototype.clear = function() {
	this._init([], this._key);
};

/**
 * @return {integer}
 */
SortedCollection.prototype.length = function() { // or size()?
	return this._items.length;
};

/**
 * @param {integer} i
 * @return {*}
 */
SortedCollection.prototype.getItem = function(i) {
	return this._items[i];
};

/**
 * @return {!Iterable}
 */
SortedCollection.prototype.__iterator__ = function() {
	return iter(this._items);
};

/**
 * @return {string}
 */
SortedCollection.prototype.__repr__ = function() {
	return 'SortedCollection(' +  repr(this._items) + ', key=' + repr(this._key) + ')';
};

/**
 * @param {*} item
 * @return {boolean}
 */
SortedCollection.prototype.contains = function(item) {
	var k = this._key(item);
	var i = bisectLeft(this._keys, k);
	var j = bisectRight(this._keys, k);
	return findValue(this._items, item, i, j) != -1;
};

/**
 * Find the position of an item.  Raise ValueError if not found.
 * @param {*} item
 * @return {integer}
 */
SortedCollection.prototype.index = function(item) {
	var k = this._key(item);
	var i = bisectLeft(this._keys, k);
	var j = bisectRight(this._keys, k);
	return findValue(this._items, item, i, j);
};

/**
 * Return number of occurrences of item
 * @param {*} item
 * @return {integer}
 */
SortedCollection.prototype.count = function(item) {
	var k = this._key(item);
	var i = bisectLeft(this._keys, k);
	var j = bisectRight(this._keys, k);
	return countValue(islice(this._items, i, j), item);
};

/**
 * Insert a new item.  If equal keys are found, add to the left
 * @param {*} item
 */
SortedCollection.prototype.insert = function(item) {
	var k = this._key(item);
	var i = bisectLeft(this._keys, k);
	this._keys.splice(i, 0, k);
	this._items.splice(i, 0, item);
	// todo: chain?
};

/**
 * Insert a new item.  If equal keys are found, add to the right
 * @param {*} item
 */
SortedCollection.prototype.insertRight = function(item) {
	var k = this._key(item);
	var i = bisectRight(this._keys, k);
	this._keys.splice(i, 0, k);
	this._items.splice(i, 0, item);
	// todo: chain?
};

/**
 * Remove first occurence of item.  Raise ValueError if not found
 * @param {*} item
 */
SortedCollection.prototype.remove = function(item) {
	var i = this.index(item);
	this._keys.splice(i, 1);
	this._items.splice(i, 1);
	// todo: chain?
};

/**
 * Return first item with a key == k.  Raise ValueError if not found.
 * param {*} k
 * @return {*}
 */
SortedCollection.prototype.find = function(k) {
	var i = bisectLeft(this._keys, k);
	if (i != this.length() && compare(this._keys[i], k) == 0)
		return this._items[i];
	throw new Error('No item found with key equal to: ' + repr(k));
};

/**
 * Return last item with a key <= k.  Raise ValueError if not found.
 * @param {*} k
 * @return {*}
 */
SortedCollection.prototype.find_le = function(k) {
	var i = bisectRight(this._keys, k);
	if (i != 0)
		return this._items[i-1];
	throw new Error('No item found with key at or below: ' +  repr(k));
};

/**
 * Return last item with a key < k.  Raise ValueError if not found.
 * @param {*} k
 * @return {*}
 */
SortedCollection.prototype.find_lt = function(k) {
	var i = bisectLeft(this._keys, k);
	if (i != 0)
		return this._items[i-1];
	throw new Error('No item found with key below: ' + repr(k));
};

/**
 * Return first item with a key >= equal to k.  Raise ValueError if not found
 * @param {*} k
 * @return {*}
 */
SortedCollection.prototype.find_ge = function(k) {
	var i = bisectLeft(this._keys, k);
	if (i != this.length())
		return this._items[i];
	throw new Error('No item found with key at or above: ' + repr(k));
};

/**
 * Return first item with a key > k.  Raise ValueError if not found
 * @param {*} k
 * @return {*}
 */
SortedCollection.prototype.find_gt = function(k) {
	var i = bisectRight(this._keys, k);
	if (i != this.length())
		return this._items[i];
	throw new Error('No item found with key above: ' + repr(k));
};



/*
# ---------------------------  Simple demo and tests  -------------------------
if __name__ == '__main__':

    def ve2no(f, *args):
        'Convert ValueError result to -1'
        try:
            return f(*args)
        except ValueError:
            return -1

    def slow_index(seq, k):
        'Location of match or -1 if not found'
        for i, item in enumerate(seq):
            if item == k:
                return i
        return -1

    def slow_find(seq, k):
        'First item with a key equal to k. -1 if not found'
        for item in seq:
            if item == k:
                return item
        return -1

    def slow_find_le(seq, k):
        'Last item with a key less-than or equal to k.'
        for item in reversed(seq):
            if item <= k:
                return item
        return -1

    def slow_find_lt(seq, k):
        'Last item with a key less-than k.'
        for item in reversed(seq):
            if item < k:
                return item
        return -1

    def slow_find_ge(seq, k):
        'First item with a key-value greater-than or equal to k.'
        for item in seq:
            if item >= k:
                return item
        return -1

    def slow_find_gt(seq, k):
        'First item with a key-value greater-than or equal to k.'
        for item in seq:
            if item > k:
                return item
        return -1

    from random import choice
    pool = [1.5, 2, 2.0, 3, 3.0, 3.5, 4, 4.0, 4.5]
    for i in range(500):
        for n in range(6):
            s = [choice(pool) for i in range(n)]
            sc = SortedCollection(s)
            s.sort()
            for probe in pool:
                assert repr(ve2no(sc.index, probe)) == repr(slow_index(s, probe))
                assert repr(ve2no(sc.find, probe)) == repr(slow_find(s, probe))
                assert repr(ve2no(sc.find_le, probe)) == repr(slow_find_le(s, probe))
                assert repr(ve2no(sc.find_lt, probe)) == repr(slow_find_lt(s, probe))
                assert repr(ve2no(sc.find_ge, probe)) == repr(slow_find_ge(s, probe))
                assert repr(ve2no(sc.find_gt, probe)) == repr(slow_find_gt(s, probe))
            for i, item in enumerate(s):
                assert repr(item) == repr(sc[i])        # test __getitem__
                assert item in sc                       # test __contains__ and __iter__
                assert s.count(item) == sc.count(item)  # test count()
            assert len(sc) == n                         # test __len__
            assert list(map(repr, reversed(sc))) == list(map(repr, reversed(s)))    # test __reversed__
            assert list(sc.copy()) == list(sc)          # test copy()
            sc.clear()                                  # test clear()
            assert len(sc) == 0

    sd = SortedCollection('The quick Brown Fox jumped'.split(), key=str.lower)
    assert sd._keys == ['brown', 'fox', 'jumped', 'quick', 'the']
    assert sd._items == ['Brown', 'Fox', 'jumped', 'quick', 'The']
    assert sd._key == str.lower
    assert repr(sd) == "SortedCollection(['Brown', 'Fox', 'jumped', 'quick', 'The'], key=lower)"
    sd.key = str.upper
    assert sd._key == str.upper
    assert len(sd) == 5
    assert list(reversed(sd)) == ['The', 'quick', 'jumped', 'Fox', 'Brown']
    for item in sd:
        assert item in sd
    for i, item in enumerate(sd):
        assert item == sd[i]
    sd.insert('jUmPeD')
    sd.insert_right('QuIcK')
    assert sd._keys ==['BROWN', 'FOX', 'JUMPED', 'JUMPED', 'QUICK', 'QUICK', 'THE']
    assert sd._items == ['Brown', 'Fox', 'jUmPeD', 'jumped', 'quick', 'QuIcK', 'The']
    assert sd.find_le('JUMPED') == 'jumped', sd.find_le('JUMPED')
    assert sd.find_ge('JUMPED') == 'jUmPeD'
    assert sd.find_le('GOAT') == 'Fox'
    assert sd.find_ge('GOAT') == 'jUmPeD'
    assert sd.find('FOX') == 'Fox'
    assert sd[3] == 'jumped'
    assert sd[3:5] ==['jumped', 'quick']
    assert sd[-2] == 'QuIcK'
    assert sd[-4:-2] == ['jumped', 'quick']
    for i, item in enumerate(sd):
        assert sd.index(item) == i
    try:
        sd.index('xyzpdq')
    except ValueError:
        pass
    else:
        assert 0, 'Oops, failed to notify of missing value'
    sd.remove('jumped')
    assert list(sd) == ['Brown', 'Fox', 'jUmPeD', 'quick', 'QuIcK', 'The']

    import doctest
    from operator import itemgetter
    print(doctest.testmod())
 */