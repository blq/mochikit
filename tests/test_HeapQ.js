// Unittests for heapq.
// converted from PyPy's unit-tests, http://codespeak.net/svn/pypy/trunk/lib-python/2.5.2/test/test_heapq.py

if (typeof(tests) == 'undefined') { tests = {}; }


tests.test_HeapQ = function(t)
{

    function test_heapify()
	{
        forEach(range(30), function(size) {
            var heap = deal(size);
            heapify(heap);
            t.ok(isHeap(heap), 'heapify ok');
		});
	}
	test_heapify();


    function test_push_pop()
	{
        // 1) Push 256 random numbers and pop them off, verifying all's OK.
        var heap = []
        var data = []
        t.ok(isHeap(heap));
        forEach(range(256), function(i) {
            var item = Math.random();
            data.push(item);
            heapPush(heap, item);
            t.ok(isHeap(heap));
		});
        var results = [];
        while (heap.length > 0) {
            var item = heapPop(heap);
            t.ok(isHeap(heap));
            results.push(item);
		}
        var data_sorted = sorted(data);
        t.eq(data_sorted, results);
        // 2) Check that the invariant holds for a sorted array
        t.ok(isHeap(results), 'pushpop ok');
	}
	test_push_pop();


    function test_nsmallest()
	{
		var data = map(random, repeat(2000, 1000));

        forEach([0, 1, 2, 10, 100, 400, 999, 1000, 1100], function(n) {
            t.eq(nSmallest(n, data), sorted(data).slice(0, n), 'nsmallest ' + n + ' ok');
        });
	}
	test_nsmallest();


	// !?? fails
	var m = [2, 8, 3, 0, 5, 6, 4, 1, 9, 7];
	var n = nLargest(5, m);
	t.eq(n, [9, 8, 7, 6, 5], 'simple nlargest ok');

    function test_nlargest()
	{
		var data = map(random, repeat(2000, 1000));

        forEach([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 66, 99, 100, 400, 999, 1000, 1100], function(n) {
            t.eq(nLargest(n, data), reversed(sorted(data)).slice(0, n), 'nlargest ' + n + ' ok');
		});
	}
	test_nlargest();


    function test_naive_nbest()
	{
		var data = map(random, repeat(2000, 1000));

        var heap = []
        forEach(data, function(item) {
            heapPush(heap, item);
            if (heap.length > 10)
                heapPop(heap);
		});

        heap.sort(compare);
        t.eq(heap, sorted(data).slice(data.length - 10), 'naive nbest ok');
	}
	test_naive_nbest();


    function test_nbest()
	{
        // Less-naive "N-best" algorithm, much faster (if len(data) is big
        // enough <wink>) than sorting all of data.  However, if we had a max
        // heap instead of a min heap, it could go faster still via
        // heapify'ing all of data (linear time), then doing 10 heappops
        // (10 log-time steps).
        var data = map(random,  repeat(200, 1000));

        var heap = data.slice(0, 10);
        heapify(heap);

        forEach(data.slice(10), function(item) {
            if (item > heap[0])  // this gets rarer the longer we run
                heapReplace(heap, item);
		});

        t.eq(list(heapIter(heap)), sorted(data).slice(data.length - 10), 'nbest ok');
	}
	test_nbest();


    function test_heapsort()
	{
        // Exercise everything with repeated heapsort checks
        forEach(range(100), function(trial) {
            var size = random(50);
			var data = map(random, repeat(25, size));

            if (trial & 1) {     // Half of the time, use heapify
                var heap = list(data);
                heapify(heap);
			} else {             // The rest of the time, use heappush
                var heap = [];
                forEach(data, function(item) {
                    heapPush(heap, item);
                });
			}
            var heap_sorted = map(heapPop, repeat(heap, size));
            t.eq(heap_sorted, sorted(data), 'heapsort ok');
		});
	}
	test_heapsort();

};

