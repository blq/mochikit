// Unit tests for the Random module
//
// converted from Python and PyPy's unit-tests
// http://svn.python.org/view/python/branches/release27-maint/Lib/test/test_random.py?view=markup
//
// todo: this generates some odd false negatives when run from the main index.html test form?!


if (typeof(tests) == 'undefined') { tests = {}; }


tests.test_Random = function(t)
{


	function test_sample()
	{
        // For the entire allowable range of 0 <= k <= N, validate that
        // the sample is of the correct length and contains only unique items
        var N = 100;
        var population = list(range(N));
        forEach(range(N+1), function(k) {
            var s = sample(population, k);
            t.ok(s.length == k);

            var uniq = {};
			forEach(s, function(si){ uniq[si] = true; });
			uniq = keys(uniq);

            t.ok(uniq.length == k);
            t.ok(uniq.length <= population.length);
		});

        t.eq(sample([], 0), [], 'edge case N==k==0');
	}
	test_sample();


	// ...


};
