// based on http://svn.python.org/view/python/trunk/Lib/test/test_bisect.py?view=markup

if (typeof(tests) == 'undefined') { tests = {}; }

tests.test_Bisect = function (t) {

	var precomputedCases = [
		[bisectRight, [], 1, 0],
		[bisectRight, [1], 0, 0],
		[bisectRight, [1], 1, 1],
		[bisectRight, [1], 2, 1],
		[bisectRight, [1, 1], 0, 0],
		[bisectRight, [1, 1], 1, 2],
		[bisectRight, [1, 1], 2, 2],
		[bisectRight, [1, 1, 1], 0, 0],
		[bisectRight, [1, 1, 1], 1, 3],
		[bisectRight, [1, 1, 1], 2, 3],
		[bisectRight, [1, 1, 1, 1], 0, 0],
		[bisectRight, [1, 1, 1, 1], 1, 4],
		[bisectRight, [1, 1, 1, 1], 2, 4],
		[bisectRight, [1, 2], 0, 0],
		[bisectRight, [1, 2], 1, 1],
		[bisectRight, [1, 2], 1.5, 1],
		[bisectRight, [1, 2], 2, 2],
		[bisectRight, [1, 2], 3, 2],
		[bisectRight, [1, 1, 2, 2], 0, 0],
		[bisectRight, [1, 1, 2, 2], 1, 2],
		[bisectRight, [1, 1, 2, 2], 1.5, 2],
		[bisectRight, [1, 1, 2, 2], 2, 4],
		[bisectRight, [1, 1, 2, 2], 3, 4],
		[bisectRight, [1, 2, 3], 0, 0],
		[bisectRight, [1, 2, 3], 1, 1],
		[bisectRight, [1, 2, 3], 1.5, 1],
		[bisectRight, [1, 2, 3], 2, 2],
		[bisectRight, [1, 2, 3], 2.5, 2],
		[bisectRight, [1, 2, 3], 3, 3],
		[bisectRight, [1, 2, 3], 4, 3],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 0, 0],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 1, 1],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 1.5, 1],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 2, 3],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 2.5, 3],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 3, 6],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 3.5, 6],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 4, 10],
		[bisectRight, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 5, 10],

		[bisectLeft, [], 1, 0],
		[bisectLeft, [1], 0, 0],
		[bisectLeft, [1], 1, 0],
		[bisectLeft, [1], 2, 1],
		[bisectLeft, [1, 1], 0, 0],
		[bisectLeft, [1, 1], 1, 0],
		[bisectLeft, [1, 1], 2, 2],
		[bisectLeft, [1, 1, 1], 0, 0],
		[bisectLeft, [1, 1, 1], 1, 0],
		[bisectLeft, [1, 1, 1], 2, 3],
		[bisectLeft, [1, 1, 1, 1], 0, 0],
		[bisectLeft, [1, 1, 1, 1], 1, 0],
		[bisectLeft, [1, 1, 1, 1], 2, 4],
		[bisectLeft, [1, 2], 0, 0],
		[bisectLeft, [1, 2], 1, 0],
		[bisectLeft, [1, 2], 1.5, 1],
		[bisectLeft, [1, 2], 2, 1],
		[bisectLeft, [1, 2], 3, 2],
		[bisectLeft, [1, 1, 2, 2], 0, 0],
		[bisectLeft, [1, 1, 2, 2], 1, 0],
		[bisectLeft, [1, 1, 2, 2], 1.5, 2],
		[bisectLeft, [1, 1, 2, 2], 2, 2],
		[bisectLeft, [1, 1, 2, 2], 3, 4],
		[bisectLeft, [1, 2, 3], 0, 0],
		[bisectLeft, [1, 2, 3], 1, 0],
		[bisectLeft, [1, 2, 3], 1.5, 1],
		[bisectLeft, [1, 2, 3], 2, 1],
		[bisectLeft, [1, 2, 3], 2.5, 2],
		[bisectLeft, [1, 2, 3], 3, 2],
		[bisectLeft, [1, 2, 3], 4, 3],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 0, 0],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 1, 0],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 1.5, 1],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 2, 1],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 2.5, 3],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 3, 3],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 3.5, 6],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 4, 6],
		[bisectLeft, [1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 5, 10]
	];

    function test_precomputed() {
		var i = 0;
        forEach(precomputedCases, function(e) {
			var func = e[0], data = e[1], elem = e[2], expected = e[3];
            t.eq(func(data, elem), expected, 'precomputed ' + i++);
		});
	}
	test_precomputed();


    function test_random(n) {
		n = n || 25;
        forEach(range(n), function(i) {
			var data = map(partial(randRange, 0, n, 2), repeat('dummy', i));
            data.sort(compare);
            var elem = randRange(-1, n+1);
            var ip = bisectLeft(data, elem);
            if (ip < data.length)
                t.ok(elem <= data[ip], 'bisectLeft random');
            if (ip > 0)
                t.ok(data[ip-1] < elem, 'bisectLeft random');
			ip = bisectRight(data, elem);
            if (ip < data.length)
                t.ok(elem < data[ip], 'bisectRight random');
            if (ip > 0)
                t.ok(data[ip-1] <= elem, 'bisectRight random');
		});
	}
	test_random();


    function test_optionalSlicing() {
        forEach(precomputedCases, function(e) {
			var func = e[0], data = e[1], elem = e[2], expected = e[3];
            forEach(range(4), function(lo) {
                lo = Math.min(data.length, lo);
                forEach(range(3, 8), function(hi) {
                    hi = Math.min(data.length, hi);
                    var ip = func(data, elem, lo, hi);
                    t.ok(lo <= ip && ip <= hi, 'slicing in range');
                    if (func == bisectLeft && ip < hi)
                        t.ok(elem <= data[ip]);
                    if (func == bisectLeft && ip > lo)
                        t.ok(data[ip-1] < elem);
                    if (func == bisectRight && ip < hi)
                        t.ok(elem < data[ip]);
                    if (func == bisectRight && ip > lo)
                        t.ok(data[ip-1] <= elem);
                    t.eq(ip, Math.max(lo, Math.min(hi, expected)), 'ip ok');
				});
			});
		});
	};
	test_optionalSlicing();


	function grade(score, breakpoints, grades) {
		breakpoints = breakpoints || [60, 70, 80, 90];
		grades = grades || 'FDCBA';

		var i = bisect(breakpoints, score);
		return grades[i];
	}

	t.eq(map(grade, [33, 99, 77, 70, 89, 90, 100]), ['F', 'A', 'C', 'C', 'B', 'A', 'A'], 'grading ok');




};
