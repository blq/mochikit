/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * @author Fredrik Blomqvist
 *
 * todo: support native custom generators. having a seed to be able to get repeatedly same rands is useful
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Random');

	goog.require('MochiKit.Base');
}

MochiKit.Base.module(MochiKit, 'Random', '1.5', ['Base']);


/**
 * initially just for "symmetry" but should support custom generators
 * @see http://docs.python.org/library/random.html#random.random
 *
 * @return {number} [0.0..1.0)
 */
MochiKit.Random.random = Math.random;


/**
 * similar to Python's randrange
 * @see http://docs.python.org/library/random.html#random.randrange
 * uses half-open range. i.e random(0, 10) => values within [0..9] ([0,10) in range-notation)
 * @param {integer=} [rangeStart=0]
 * @param {integer=} [rangeEnd=rangeStart] if not set method returns [0..rangeStart-1]
 * @param {integer=} [step=1]
 * @return {integer} number in range [rangeStart..rangeEnd-1]
 */
MochiKit.Random.randRange = function(rangeStart, rangeEnd, step)
{
	// todo: verify it there's some subtle floor vs int-cast/trunc case left.. floor isn't same as trunc...
	var self = MochiKit.Random;
	if (arguments.length == 1) {
		// todo: verify this.
	//	// rangeStart > 0 in this case
	//	return Math.floor(self.random() * rangeStart);
		rangeEnd = rangeStart;
		rangeStart = 0;
	}
	step = step || 1;

	var width = rangeEnd - rangeStart;
	if (step == 1 && width > 0) {
		// Note that floor(start + random()*width)
		// instead would be incorrect.  For example, consider istart
		// = -2 and istop = 0.  Then the guts would be in
		// -2.0 to 0.0 exclusive on both ends (ignoring that random()
		// might return 0.0), and because floor() truncates toward 0, the
		// final result would be -1 or 0 (instead of -2 or -1).
		return Math.floor(rangeStart + Math.floor(self.random()*width));
	}
	if (step > 0) {
		var n = Math.floor((width + step - 1) / step);
	} else if (step < 0) {
		var n = Math.floor((width + step + 1) / step);
	}
	return rangeStart + step*Math.floor(self.random() * n);
};


/**
 * Return a random floating point number N such that a <= N <= b for a <= b and b <= N <= a for b < a.
 * The end-point value b may or may not be included in the range depending on floating-point rounding in the equation a + (b-a) * random().
 * @see http://docs.python.org/library/random.html#random.uniform
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
MochiKit.Random.uniform = function(a, b)
{
	return a + (b - a)*MochiKit.Random.random();
};


/**
 * Shuffles an array using the Fisher-Yates algorithm (Knuth). O(N)
 * in-place algorithm.
 *
 * @see http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 * @see http://docs.python.org/library/random.html#random.shuffle
 * @see http://www.sgi.com/tech/stl/random_shuffle.html
 *
 * - Thou shalt not shuffle by sorting using a random comparator!
 * .. you don't want to make same mistake M$ did ;) http://www.robweir.com/blog/2010/02/microsoft-random-browser-ballot.html
 *
 * todo: take optional range, start & end, indices?
 * todo: take a custom getter and setter funcs instead of just whole elem swaps? (though this yearns for a custom iterator concept..)
 * todo: support a generator? custom rand fn?
 * todo: add a shuffleD version also?
 *
 * @param {!Array} values
 * todo: take (sub)index params?
 * @return {!Array} chained, values array shuffled
 */
MochiKit.Random.shuffle = function(values) // or just shuffle?
{
	// Durstenfeld's algorithm
	for (var i = values.length - 1; i > 0; --i) {
		var j = Math.floor(MochiKit.Random.random() * (i + 1));
		// swap elems at i and j
		var tmp = values[i];
		values[i] = values[j];
		values[j] = tmp;
	}
	return values; // ok? enable chaining
};


/**
 * todo: drop? no significant advantage of this compared to (mapping) a shuffle..
 * Generates a unique random range of numbers from 0..N-1 (or rather f(0)..f(N-1) ) (no number occurs twice) (think dealing a deck of cards)
 * O(N)
 * todo: create an iterator based impl? (needs a quite different algo though, using a specific rand method)
 *
 * @param {integer} numItems
 * @param {Function=} [func] Optional. function receiving the index.nr and producing a result. default identity.
 * @return {!Array}
 */
MochiKit.Random.deal = function(numItems, func)
{
	func = func || MochiKit.Base.operator.identity; // default pass-through, function(i) { return i; }

	// == shuffle(map(func, range(numItems)));

	var deck = new Array(numItems);
	for (var i = 0; i < numItems; ++i) {
		var j = Math.floor(MochiKit.Random.random() * (i + 1));
		deck[i] = deck[j];
		deck[j] = func(i);
	}
	return deck;
};


/**
 * Choose a random element from a non-empty sequence.
 * @see http://docs.python.org/library/random.html#random.choice
 *
 * @param {!Array.<*>} seq
 * @return {*}
 */
MochiKit.Random.choice = function(seq)
{
	return seq[Math.floor(MochiKit.Random.random() * seq.length)];
};


/**
 * useful? (rename shuffle_copy?)
 * @param {!Array} source
 * @return {!Array} shuffled copy of source
 */
MochiKit.Random.shuffled = function(source)
{
	var n = source.length;
	var a = new Array(n);
	a[0] = source[0];
	for (var i = 1; i < n - 1; ++i) {
		var j = Math.floor(MochiKit.Random.random() * (i + 1));
		a[i] = a[j];
		a[j] = source[i];
	}
	return a;
};


/**
 * Chooses k unique random elements from a population sequence.
 *
 * Returns a new list containing elements from the population while
 * leaving the original population unchanged.  The resulting list is
 * in selection order so that all sub-slices will also be valid random
 * samples.  This allows raffle winners (the sample) to be partitioned
 * into grand prize and second place winners (the subslices).
 *
 * @see http://docs.python.org/library/random.html#random.sample
 * @see http://www.sgi.com/tech/stl/random_sample.html
 *
 * @param {!ArrayLike} population  (note: only supports Array-like input, not objs/dicts or iterables)
 * @param {integer} k  0 <= k <= len(population)
 * @return {!Array}
 */
MochiKit.Random.sample = function(population, k)
{
	// todo: couple of fast-path optimization depending on size
	// of population versus k can be made. See Python lib.
	var n = population.length;
	var result = new Array(k);
	var selected = {};
	for (var i = 0; i < k; ++i) {
		var j = MochiKit.Random.randRange(n);
		while (j in selected) {
			j = MochiKit.Random.randRange(n);
		}
		selected[j] = true;
		result[i] = population[j];
	}
	return result;
};


//----------------------

/** @this MochiKit.Random */
MochiKit.Random.__new__ = function() {
	// todo: setup generators etc here
};

MochiKit.Random.__new__();


MochiKit.Base._exportSymbols(this, MochiKit.Random);
