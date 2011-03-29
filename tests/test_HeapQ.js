// Unittests for heapq.
//
// converted from Python and PyPy's unit-tests
// http://codespeak.net/svn/pypy/trunk/lib-python/2.5.2/test/test_heapq.py
// and http://svn.python.org/view/python/trunk/Lib/test/test_heapq.py

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
        t.ok(isHeap(results), 'push pop ok');
	}
	test_push_pop();


    function test_nsmallest()
	{
		var data = map(randRange, repeat(2000, 1000));

        forEach([0, 1, 2, 10, 100, 400, 999, 1000, 1100], function(n) {
            t.eq(nSmallest(n, data), sorted(data).slice(0, n), 'nsmallest ' + n + ' ok');
        });
	}
	test_nsmallest();


	function test_nlargest_simple()
	{
		// smallest case distilled before finding the actual islice bug..
		var m = [0, 1, 2];
		var n = nLargest(2, m);
		t.eq(n, [2, 1], 'nlargest micro test ok');
	}
	test_nlargest_simple();


    function test_nlargest()
	{
		var data = map(randRange, repeat(2000, 1000));

        forEach([0, 1, 2, 10, 100, 400, 999, 1000, 1100], function(n) {
            t.eq(nLargest(n, data), reversed(sorted(data)).slice(0, n), 'nlargest ' + n + ' ok');
		});
	}
	test_nlargest();


    function test_naive_nbest()
	{
		var data = map(randRange, repeat(2000, 1000));

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
        var data = map(randRange,  repeat(200, 1000));

        var heap = data.slice(0, 10);
        heapify(heap);

        forEach(data.slice(10), function(item) {
            if (item > heap[0])  // this gets rarer the longer we run
                heapReplace(heap, item);
		});

        t.eq(list(heapIter(heap)), sorted(data).slice(data.length - 10), 'nbest ok');
	}
	test_nbest();


    function test_heappushpop()
	{
        var h = [];
        var x = heapPushPop(h, 10);
        t.eq([h, x], [[], 10], 'pushpop begin');

        h = [10];
        x = heapPushPop(h, 10.0);
        t.eq([h, x], [[10], 10.0]);
        t.eq(typeof h[0], 'number');
        t.eq(typeof x, 'number');

        h = [10];
        x = heapPushPop(h, 9);
        t.eq([h, x], [[10], 9]);

        h = [10];
        x = heapPushPop(h, 11);
        t.eq([h, x], [[11], 10], 'pushpop end');
	}
	test_heappushpop();


    function test_heapsort()
	{
        // Exercise everything with repeated heapsort checks
        forEach(range(100), function(trial) {
            var size = randRange(50);
			var data = map(randRange, repeat(25, size));

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


	function test_merge()
	{
        var inputs = [];
        forEach(range(randRange(5)), function(i) {
			var row = sorted( map(randRange, repeat(1000, randRange(10))) );
            inputs.push(row);
		});
        t.eq(sorted(chainFromIter(inputs)), list(imergeSorted(inputs)), 'merge ok');
        t.eq(list(imergeSorted([])), [], 'merge empty ok');
	}
	test_merge();


    function test_merge_stability()
	{
        var inputs = [[], [], [], []];
        forEach(range(2000), function(i) {
            var stream = randRange(4);
            var x = randRange(500);
            inputs[stream].push([x, stream]);
		});
        forEach(inputs, function(stream) {
            stream.sort(compare);
        });
        var result = list(imergeSorted(inputs));
        t.eq(result, sorted(result));
	}
	test_merge_stability();


};
