/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * Bisection algorithms
 * @see http://docs.python.org/library/bisect.html
 *
 * implementation based on: http://svn.python.org/view/python/trunk/Lib/bisect.py?view=markup
 *
 * todo: add support for custom compare? (i.e ala STL, not Python)
 *
 * @author Fredrik Blomqvist
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Bisect');

	goog.require('MochiKit.Base');
}

MochiKit.Base.module(MochiKit, 'Bisect', '1.5', ['Base']);


/**
 * Return the index where to insert item x in list a, assuming a is sorted.
 *
 * The return value i is such that all e in a[:i] have e <= x, and all e in
 * a[i:] have e > x.  So if x already appears in the list, a.insert(x) will
 * insert just after the rightmost x already there.
 *
 * Optional args lo (default 0) and hi (default len(a)) bound the
 * slice of a to be searched.
 *
 * @see http://docs.python.org/library/bisect.html#bisect.bisect_right
 * @see http://www.sgi.com/tech/stl/upper_bound.html
 *
 * @param {!Array.<*>} a
 * @param {*} x
 * @param {integer=} [lo=0]
 * @param {integer=} [hi=a.length]
 * @return {integer}
 */
MochiKit.Bisect.bisectRight = function(a, x, lo, hi)
{
	lo = lo || 0;
	hi = hi || a.length;
//	if (lo < 0)
//		throw new Error('lo must be non-negative')

    while (lo < hi) {
        var mid = Math.floor((lo + hi) / 2); // or use >> 1 ?
        if (MochiKit.Base.compare(x, a[mid]) < 0)
			hi = mid;
        else
			lo = mid + 1;
	}
    return lo;
};


/**
 * Insert item x in list a, and keep it sorted assuming a is sorted.
 *
 * If x is already in a, insert it to the right of the rightmost x.
 *
 * Optional args lo (default 0) and hi (default len(a)) bound the
 * slice of a to be searched.
 * @param {!Array.<*>} a
 * @param {*} x
 * @param {integer=} [lo=0]
 * @param {integer=} [hi=a.length]
 * @return {!Array.<*>} chained input array (Python doesn't do this)
 */
MochiKit.Bisect.insortRight = function(a, x, lo, hi)
{
	lo = MochiKit.Bisect.bisectRight(a, x, lo, hi);
	a.splice(lo, 0, x);
	return a;
};


/**
 * Return the index where to insert item x in list a, assuming a is sorted.
 *
 * The return value i is such that all e in a[:i] have e < x, and all e in
 * a[i:] have e >= x.  So if x already appears in the list, a.insert(x) will
 * insert just before the leftmost x already there.
 *
 * Optional args lo (default 0) and hi (default len(a)) bound the
 * slice of a to be searched.
 *
 * @see http://docs.python.org/library/bisect.html#bisect.bisect_left
 * @see http://www.sgi.com/tech/stl/lower_bound.html
 *
 * @param {!Array.<*>} a
 * @param {*} x
 * @param {integer=} [lo=0]
 * @param {integer=} [hi=a.length]
 * @return {integer}
 */
MochiKit.Bisect.bisectLeft = function(a, x, lo, hi)
{
	lo = lo || 0;
	hi = hi || a.length;
//	if (lo < 0)
//		throw new Error('lo must be non-negative');

    while (lo < hi) {
        var mid = Math.floor((lo + hi) / 2); // or use >> 1 ?
        if (MochiKit.Base.compare(a[mid], x) < 0)
			lo = mid + 1;
        else
			hi = mid;
	}
    return lo;
};


/**
 * Insert item x in list a, and keep it sorted assuming a is sorted.
 *
 * If x is already in a, insert it to the left of the leftmost x.
 *
 * Optional args lo (default 0) and hi (default len(a)) bound the
 * slice of a to be searched.
 *
 * @param {!Array.<*>} a
 * @param {*} x
 * @param {integer=} [lo=0]
 * @param {integer=} [hi=a.length]
 * @return {!Array.<*>} chained input a (Python doesn't do this)
 */
MochiKit.Bisect.insortLeft = function(a, x, lo, hi)
{
	lo = MochiKit.Bisect.bisectLeft(a, x, lo, hi);
    a.splice(lo, 0, x);
	return a;
};


//------------------


MochiKit.Bisect.__new__ = function() {
	// NOP ...
};


MochiKit.Bisect.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Bisect);
