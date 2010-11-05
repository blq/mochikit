/**
 *
 * @author Fredrik Blomqvist
 *
 */

if (typeof goog != 'undefined' && typeof goog.provide == 'function') {
	goog.provide('MochiKit.Text_ext');

	goog.require('MochiKit.Text');
}

MochiKit.Base._module('Text_ext', '1.5', ['Text']);


/**
 * Compute Levenshtein distance between two strings.
 * @see http://en.wikipedia.org/wiki/Levenshtein_distance
 *
 * based on code by Lasse Johansen and Anders Sewerin Johansen
 * note how this could be viewed as a specific case of the more general Wagner-Fisher distance.
 * passing the supplied LevenshteinWeight to Wagner-Fisher should give identical results to this impl.
 *
 * todo: implement the mem-efficient version of the algorithm
 * todo: add a Wagner-Fisher
 * todo: generalize this to more than just strings? i.e allow any Iterable to be processed?
 *
 * @id MochiKit.Text.levenshteinDistance
 * @param {string} s
 * @param {string} t
 * @param {boolean=} [allowTransposition=false] optional, default false
 * @return {number} distance between the two strings. The larger the number, the bigger the difference.
 */
MochiKit.Text.levenshteinDistance = function(s, t, allowTransposition) // rename/alias as simply LD?
{
	allowTransposition = allowTransposition || false;
	var n = s.length;
	var m = t.length;

	if (n == 0) return m;
	if (m == 0) return n;

	// allocate a [n+1, m+1] matrix (should be possible to use only a single-dim array(?) => O(N) mem instead of O(N^2)..)
	// (could create a single-dim array and manually multiply by nr of columns to get cell also)
	var d = new Array(n + 1);
	for (var r = 0; r < n + 1; ++r)
		d[r] = new Array(m + 1);

	for (var i = 0; i <= n; ++i)
		d[i][0] = i;
	for (var j = 0; j <= m; ++j)
		d[0][j] = j;

	for (var i = 1; i <= n; ++i)
	{
		for (var j = 1; j <= m; ++j)
		{
			var cost = (t[j - 1] == s[i - 1] ? 0 : 1);

			// min of three
			var cell = Math.min(Math.min(
				d[i - 1][j] + 1,
				d[i][j - 1] + 1),
				d[i - 1][j - 1] + cost
			);

			// Optional step: Cover transposition, in addition to deletion,
			// insertion and substitution. This step is taken from:
			// Berghel, Hal ; Roach, David : "An Extension of Ukkonen's
			// Enhanced Dynamic Programming ASM Algorithm"
			// (http://www.acm.org/~hlb/publications/asm/asm.html)
			if (allowTransposition && (i > 2 && j > 2))
			{
				var trans = d[i - 2][j - 2] + 1;
				if (s[i - 2] != t[j - 1]) ++trans;
				if (s[i - 1] != t[j - 2]) ++trans;
				if (cell > trans) cell = trans;
			}

			d[i][j] = cell;
		}
	}

	return d[n][m];
};


/**
 * @id MochiKit.Text.humanNumericStrCmp
 * Comparator function taht makes 'abc9' be sorted _before_ 'abc123'
 * not case sensitive
 * based on Michael Herf's <a href="http://stereopsis.com/strcmp4humans.html">strcmp4humans</a>
 * todo: ignore leading & trailing whitespace also?
 * todo: flag for case sensitivity?
 * @param {string} a
 * @param {string} b
 * @return {number} -1, 0, +1
 */
MochiKit.Text.humanNumericStrCmp = function(a, b) // change name!..
{
	if (a == b) return 0;

	var reNum = /^(\+|\-)?\d+/;
	var reTxt = /^D+/; // inverse of reNum

	while (a.length > 0 && b.length > 0)
	{
		var ra = a.match(reNum);
		var a0 = null;
		if (ra != null && ra.length > 0) {
			a0 = parseInt(ra[0], 10) + 256; // make any number bigger than any char
			a = a.substring(ra[0].length);
		}
		else {
			// todo: if both a & b are string-segments, we can run a second regexp that only matches non-digits here and use same delta increment
			a0 = a.charAt(0).toLowerCase().charCodeAt(0);
			a = a.substring(1);
		}

		// same as above
		var rb = b.match(reNum);
		var b0 = null;
		if (rb != null && rb.length > 0) {
			b0 = parseInt(rb[0], 10) + 256;
			b = b.substring(rb[0].length);
		}
		else {
			b0 = b.charAt(0).toLowerCase().charCodeAt(0);
			b = b.substring(1);
		}

		if (a0 < b0) return -1;
		if (a0 > b0) return +1;
	}

	if (a.length > 0) return +1; 	// a > b
	if (b.length > 0) return -1;	// a < b

	return 0;
};



MochiKit.Text_ext.__new__ = function()
{
	// NOP ...
};


MochiKit.Text_ext.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Text); // ! since we add to the existing namespace we export it again here (ok?)