/**
 *
 * See <http://mochikit.com/> for documentation, downloads, license, etc.
 *
 * @author Fredrik Blomqvist
 *
 * uses the Mersenne Twister algorithm, http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/VERSIONS/JAVASCRIPT/java-script.html
 *
 * todo: support more generators, ex: http://www.erikoest.dk/rng.htm or http://davidbau.com/encode/seedrandom.js
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Random');

	goog.require('MochiKit.Base');
	goog.require('MochiKit._MersenneTwister19937');
}

MochiKit.Base.module(MochiKit, 'Random', '1.5', ['Base', '_MersenneTwister19937']);

/**
 * @see http://docs.python.org/library/random.html#random.seed
 *
 * @param {integer=} [x]
 */
MochiKit.Random.seed = function(x)
{
	x = typeof x == 'number' ? x : Date.now();
	MochiKit.Random._generator.seed(x);
};


/**
 * Return an object capturing the current internal state of the generator.
 * This object can be passed to setState() to restore the state.
 * @see http://docs.python.org/library/random.html#random.getstate
 *
 * @return {!Object} black-box state
 */
MochiKit.Random.getState = function()
{
	return MochiKit.Random._generator.getState();
};


/**
 * state should have been obtained from a previous call to getState(), and setState() restores
 * the internal state of the generator to what it was at the time setState() was called.
 * @see http://docs.python.org/library/random.html#random.setstate
 *
 * @param {!Object} state obtained from getState()
 */
MochiKit.Random.setState = function(state)
{
	MochiKit.Random._generator.setState(state);
};


/**
 * @see http://docs.python.org/library/random.html#random.random
 *
 * @return {number} [0.0..1.0)
 */
MochiKit.Random.random = function()
{
	return MochiKit.Random._generator.random();
};


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
 * @see http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modern_method
 * @see http://docs.python.org/library/random.html#random.shuffle
 * @see http://www.sgi.com/tech/stl/random_shuffle.html
 *
 * - Thou shalt not shuffle by sorting using a random comparator!
 * .. you don't want to make same mistake M$ did ;) http://www.robweir.com/blog/2010/02/microsoft-random-browser-ballot.html
 *
 * todo: take optional range, start & end, indices?
 * todo: take a custom getter and setter funcs instead of just whole elem swaps? (though this yearns for a custom iterator concept..)
 * todo: support a generator arg? custom rand fn?
 * todo: add a shuffleD version also?
 *
 * @param {!Array} values
 * todo: take (sub)index params?
 * @return {!Array} chained, values array shuffled
 */
MochiKit.Random.shuffle = function(values) // or just shuffle?
{
	// Durstenfeld's algorithm ("modern Fisher-Yates")
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
 * @param {!ArrayLike} seq
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

// todo: although this setup allows different generators, compared to Python you can only use one at a time, singleton style.

/**
 * ! just for doc & Closure compiler. Should No be instantiated!
 * @private
 * @interface
 */
MochiKit.Random._IRndGenerator = function() {};
/**
 * @param {integer=} [x]
 */
MochiKit.Random._IRndGenerator.prototype.seed = function(x) {};
/**
 * @return {!Object}
 */
MochiKit.Random._IRndGenerator.prototype.getState = function() {};
/**
 * @param {!Object} state
 */
MochiKit.Random._IRndGenerator.prototype.setState = function(state) {};
/**
 * @return {number} [0..1)
 */
MochiKit.Random._IRndGenerator.prototype.random = function() {};

//------------------

/**
 * @implements {MochiKit.Random._IRndGenerator}
 * @param {integer=} [x] seed
 * @constructor
 */
MochiKit.Random.MersenneTwister = function(x)
{
	this._mt = new MochiKit._MersenneTwister19937();
	this.seed(x);
};

MochiKit.Random.MersenneTwister.prototype.seed = function(x)
{
	x = typeof x == 'number' ? x : Date.now();
	this._mt.init_genrand(x);
};

MochiKit.Random.MersenneTwister.prototype.getState = function()
{
	return this._mt._getState();
};

MochiKit.Random.MersenneTwister.prototype.setState = function(state)
{
	this._mt._setState(state);
};

MochiKit.Random.MersenneTwister.prototype.random = function()
{
	return this._mt.genrand_real2();
	// todo: test MT.genrand_res53();
};

//------------------

/**
 * Math.random impl.
 * note: this will currently fail the setstate unit-test. needs to be special cased
 * @implements {MochiKit.Random._IRndGenerator}
 * @constructor
 */
MochiKit.Random.SystemRandom = function()
{
	// NOP
};

MochiKit.Random.SystemRandom.prototype.seed = function(x)
{
	// NOP
	// todo: log
	// todo: indicate more clearly in docs (and tests..) that seed doesn't _have_ to do anything?
};

MochiKit.Random.SystemRandom.prototype.getState = function()
{
	// todo: throw?
};

MochiKit.Random.SystemRandom.prototype.setState = function(state)
{
	// todo: throw?
};

MochiKit.Random.SystemRandom.prototype.random = function()
{
	return Math.random();
};

//------------------


/**
 * @type {MochiKit.Random._IRndGenerator}
 * @private
 */
MochiKit.Random._generator = null;

/**
 * @param {MochiKit.Random._IRndGenerator} generator
 * @private
 */
MochiKit.Random._setGenerator = function(generator)
{
	MochiKit.Random._generator = generator;
};


MochiKit.Random.__new__ = function() {
	// todo: make the Mersenne generator optional, with default/fallback to plain Math.random (with do-nothing seed & get/setState methods)
	// todo: or make each generator inject itself if/when loaded?
	MochiKit.Random._setGenerator(new MochiKit.Random.MersenneTwister());
//	MochiKit.Random._setGenerator(new MochiKit.Random.SystemRandom());
};

MochiKit.Random.__new__();


MochiKit.Base._exportSymbols(this, MochiKit.Random);
