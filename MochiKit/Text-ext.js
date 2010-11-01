/**
 *
 * @author Fredrik Blomqvist
 * 
 */

MochiKit.Base._module('Text-ext', '1.5', ['Text']);


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
